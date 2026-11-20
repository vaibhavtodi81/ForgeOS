# ForgeOS — System Architecture

ForgeOS is a construction project and financial management platform for Indian
builders: multi-project portfolios, site stock, material planning, daily site
logs, wastage analysis, billing, and a complete audit trail.

This document is the map of the system: how a request travels, how
authentication and authorization are enforced, the data model, and the
quality gates that protect all of it.

---

## 1. System overview

```
┌──────────────────────────────────────────────────────────────────┐
│ Next.js 16 (App Router, TypeScript, single deployable)           │
│                                                                  │
│  src/app/page.tsx                                                │
│    └── src/forgeos/**           hash-router SPA (the UI)         │
│          features: app-shell, projects, stock, materials,        │
│          lands, daily-logs, bills, vendors, wastage, audit,      │
│          users, progress-history, profile, authentication        │
│                                                                  │
│  src/app/api/**                REST route handlers (the API)     │
│    auth, users, projects, lands, materials, material-plans,      │
│    inventory, daily-logs, milestones, invoices, payments,        │
│    suppliers, dashboard, wastage, audit-logs, meta               │
│                                                                  │
│  src/lib/**                    shared domain layer               │
│    auth (JWT + scrypt + DB revalidation), rbac (permission       │
│    matrix), api-helpers (envelope + guards + parsing),           │
│    audit, rate-limit, db (Prisma), forgeos-types (contract)      │
└──────────────────────────────────────────────────────────────────┘
                         │
                         ▼
              SQLite via Prisma ORM (db/custom.db)
              17 models — see §6
```

Key decisions:

- **One deployable.** UI and API ship together; the SPA talks to the API with
  relative `/api/...` fetches — no CORS, no separate origin.
- **`src/lib/forgeos-types.ts` is the single contract.** Enums, request/response
  shapes and the API envelope are defined once and imported by both sides.
- **Authorization lives in `src/lib/rbac.ts`** — one auditable permission
  matrix; no route decides access policy on its own.

## 2. Request lifecycle and the API envelope

Every route handler follows the same shape:

```ts
export async function POST(req: Request) {
  const auth = await requirePermission(req, 'plans:write')   // 1. guard
  if (!auth.ok) return auth.response
  // 2. parse + validate (readJson, parseDay, num, optString …)
  // 3. authorize scope (pmOwns for project-scoped data)
  // 4. transact (Prisma)
  // 5. audit (writeAudit)
  return ok(data, meta?)                                     // 6. envelope
}
```

All responses use a uniform envelope — the UI never branches on shape:

| Outcome | Body | HTTP |
|---|---|---|
| Success | `{ success: true, message: 'OK', data, meta }` | 200 |
| Failure | `{ success: false, message, error: { code, message } }` | 400/401/403/404/409/429/500 |

Pagination meta is a superset (`page`, `pageSize`, `limit`, `total`,
`totalPages`) — different UI pages read different keys; the backend speaks all
of them. Lists cap at `limit ≤ 100`.

## 3. Authentication

Credentials are scrypt-hashed (`scrypt:<salt>:<hash>`, 64-byte key,
`timingSafeEqual` comparison — no plaintext, no fast-hash).

Sign-in paths (all write audit rows):

1. **Password login** — `POST /api/auth/login`, rate-limited to
   10 attempts/min/IP (429 with `Retry-After`); failures audited as
   `LOGIN_FAILED`.
2. **OTP over email** — `POST /api/auth/otp/request` + `/otp/verify`
   (Gmail SMTP app-password; codes are single-use, hashed, short-lived).
3. **Google OAuth** — `/api/auth/oauth/google` callback.
4. `POST /api/auth/change-password` — requires the current password.

Sessions are **JWT (HS256, 8h TTL)** delivered two ways:

- `forgeos_session` **httpOnly cookie** (`sameSite=lax`, `secure` in
  production) — used by the browser UI;
- `Authorization: Bearer <token>` — used by tests and API clients.

### 3.1 Session revalidation (stale-token hardening)

The JWT is a *bearer of identity*, never of authority. On **every guarded
request**, `getSessionUser`:

1. verifies the signature and expiry, then
2. loads the user row from the database: the user must still exist and be
   **active**, and the **current database role is authoritative** — the token's
   role claim is display-only.

Consequences: deactivating a user kills their existing token on the next
request; a promotion or demotion takes effect immediately. There is no
8-hour window in which revoked access lingers.

Known trade-off (documented, accepted): logout clears the cookie but cannot
revoke an already-issued bearer token server-side; the DB revalidation above
bounds the exposure to account deactivation, which is the operationally
relevant control.

## 4. Authorization (RBAC)

Roles: **ADMIN** (full control), **PM** (site operations), **VIEWER** (read-only).

Reads (`guardAuth(req)`) require only an authenticated, active user. Every
guarded write/admin read resolves through the matrix in
`src/lib/rbac.ts` via `requirePermission(req, '<permission>')`:

| Permission | ADMIN | PM | covers |
|---|:-:|:-:|---|
| `users:write` | x | | invite, edit, activate/deactivate, role change |
| `projects:write` | x | | create/update/delete projects |
| `projects:assign` | x | | assign / reassign PM |
| `projects:status` | x | | status machine transitions |
| `materials:write` | x | | materials master |
| `suppliers:write` | x | | vendors |
| `invoices:write` | x | | invoices + status transitions |
| `payments:write` | x | | payments |
| `stock:void` | x | | void inventory transactions |
| `audit:read` | x | | audit log viewer + stats |
| `lands:write` | x | x | land registry |
| `plans:write` | x | x | material plans |
| `logs:write` | x | x | daily site logs |
| `milestones:write` | x | x | milestones |
| `stock:write` | x | x | stock IN / OUT / ADJUSTMENT |
| `pm-dashboard:read` | x | x | PM cockpit dashboard |

The matrix is explicit (ADMIN is listed, never an implicit bypass) and locked
by unit tests (`tests/unit/rbac.test.ts`) plus 175 integration tests that
exercise the endpoints end-to-end.

### 4.1 Row-level scoping

PMs are confined to their own projects: project-scoped handlers check
`pmOwns(user, project.assignedPmId)` after the guard, so a PM can only act on
inventory, plans, logs, milestones and invoices of projects assigned to them.
Admins are exempt; VIEWERs hold no write permission at all.

## 5. Business rules

- **Project status machine** (admin-only):
  `PLANNING → ACTIVE ⇄ ON_HOLD → COMPLETED`; `COMPLETED` auto-writes
  `actualEndDate`. Invalid transitions are 400s, and the deactivation of a PM
  who still manages an active project is blocked (409).
- **Stock ledger** is append-only with corrections: transactions are `IN`,
  `OUT` (reason `USED|DAMAGED|LOST`) or `ADJUSTMENT` (`INCREASE|DECREASE`);
  mistakes are corrected by **voiding** (`stock:void`), never editing — the
  ledger preserves history and stock summaries are recomputed from it.
- **Wastage** compares planned vs consumed material per project; the rate
  formulas are unit-tested and surfaced per project and portfolio-wide
  (`/api/wastage/overview`, project `inventory/wastage`).
- **Billing lifecycle**: `DRAFT → SENT → PARTIALLY_PAID → PAID`, plus `VOID`;
  payments allocate against invoices and drive the receivables KPIs.
- **Audit trail**: every state-changing action (see `AuditAction` in
  `forgeos-types.ts` — 30+ actions including `LOGIN`, `TXN_VOID`,
  `STATUS_CHANGE`, `ROLE_CHANGE`) is recorded with actor, entity and metadata
  through the shared `writeAudit` helper; the audit viewer is ADMIN-only.

## 6. Data model (Prisma / SQLite)

```
User ──< Project >── Land          (project: land, PM, budget, status, dates)
OAuthAccount, OtpCode              (auth side-tables)
Project ──< MaterialPlan >── Material   (planned quantities per project)
Project ──< InventoryTransaction        (append-only stock ledger)
Project ──< DailyLog ──< LabourEntry / MachineryEntry
Project ──< Milestone
Project ──< Invoice ──< Payment
Supplier                               (vendor registry)
AuditLog                               (actor, action, entity, meta, ip)
```

The schema lives in `prisma/schema.prisma`; `bun run db:push` syncs it,
`bun run db:seed` loads a realistic demo portfolio (users, lands, projects,
materials, plans, ledger, bills, payments, audit history).
Demo login: `admin@forgeos.local` / `ForgeOS2026`.

## 7. Quality gates

Three test suites, all network-mocked or DB-isolated, wired into CI as
separate jobs (`.github/workflows/ci.yml`):

| Suite | Scope | Environment |
|---|---|---|
| `bun run test:unit` | auth crypto, JWT roundtrips, RBAC matrix, guards, rate limiter, API helpers | in-memory / mocked DB |
| `bun run test:integration` | every route handler: RBAC, validation, scoping, business rules, audit | isolated `db/test.db` (recreated + seeded in CI) |
| `bun run test:frontend` | hash router, API client, RBAC helpers, auth/projects/dashboard hooks and pages | jsdom + Testing Library, fetch mocked |

CI pipeline: **lint → typecheck → backend-unit → backend-integration →
frontend-tests → build → ci-ok** (single branch-protection gate), with
concurrency cancellation and read-only permissions.

## 8. Configuration

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | SQLite file path (`file:…/db/custom.db`); tests pin their own `db/test.db` |
| `JWT_SECRET` | **required**, ≥32 chars, checked at boot — no insecure default |
| SMTP / OAuth credentials | Gmail app password for OTP; Google OAuth client for sign-in |

Secrets never live in the repository — `.env` is git-ignored, `.env.example`
is the committed template, and CI supplies its own hermetic test-only
`JWT_SECRET` (mirrored by the `tests/setup.ts` fallback).

---

*Team*: vaibhavtodi81, itsriy-aa, yashmeeny25707-dev, vinayakp25507-png.
