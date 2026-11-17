# ForgeOS — System Architecture & Design

> This document is the engineering reference for ForgeOS. It covers the system
> design, technology stack, RBAC model, authentication flow, and module layout.
> The Prisma schema (`server/prisma/schema.prisma`) is the authoritative database
> source of truth; this document explains the decisions behind it.

---

## 1. Overview

ForgeOS is a project and financial management platform for Indian builders and
real-estate developers. It gives builders (Admins) a single portfolio view across
all sites, while Project Managers (PMs) enter daily site operations data.

**Core capabilities:**
- Multi-land, multi-project portfolio management
- Daily site logs with labour and machinery tracking
- Per-project stock ledger with advisory-locked transactions
- Progress-adjusted wastage detection (the key differentiator)
- Centralised billing with approval workflow and payment tracking
- Audit trail on every mutation
- Role-based dashboards (Admin portfolio, PM project-scoped)

---

## 2. Technology Stack

| Concern | Choice | Rationale |
|---|---|---|
| Language | TypeScript (client + server) | Shared contracts across 4 developers |
| Frontend | React 18 + Vite | Fast dev loop, huge ecosystem |
| Backend | Express 5 | Familiar, layered architecture maps to course scope |
| Database | PostgreSQL 16 | Relational integrity, advisory locks, JSONB for audit |
| ORM | Prisma 5 | Typed queries, declarative schema, migrations |
| Validation | Zod | Single library on both ends, shared patterns |
| Auth | Hand-rolled JWT (HS256) + scrypt | Zero-dependency, timing-safe, spec-compliant |
| Security | helmet, cors, express-rate-limit | Baseline hardening per NFR |
| Logging | pino + pino-http | Structured, fast |
| Testing | Vitest + Supertest | One runner across the repo |
| CI | GitHub Actions | Lint + typecheck + test on every PR |
| Dev infra | Docker Compose (PostgreSQL) | One-command local setup |

---

## 3. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Users                                │
│  Admin (desktop)        PM (mobile on site)                │
└──────────┬──────────────────────┬──────────────────────────┘
           │                      │
           ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│              React SPA (Vite, static hosting)                │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │
│  │  Auth   │ │Dashboard  │ │ Projects │ │ Stock/Bills/...│  │
│  │Provider │ │  Charts  │ │ + Logs   │ │   CRUD pages    │  │
│  └─────────┘ └──────────┘ └──────────┘ └────────────────┘  │
│              Typed fetch wrapper (lib/api.ts)               │
└──────────────────────┬──────────────────────────────────────┘
                       │ JSON over HTTPS, Bearer JWT
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                Express REST API (/api/v1)                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Middleware: helmet → cors → rateLimit → pino → auth │    │
│  └──────────────────────┬──────────────────────────────┘    │
│  ┌──────────────────────▼──────────────────────────────┐    │
│  │  Modules (vertical slices):                         │    │
│  │  auth · users · lands · projects · materials ·      │    │
│  │  vendors · material-plans · inventory · billing ·    │    │
│  │  daily-logs · milestones · dashboard · audit         │    │
│  └──────────────────────┬──────────────────────────────┘    │
│  ┌──────────────────────▼──────────────────────────────┐    │
│  │  Each module: routes → controller → service → Prisma│    │
│  └──────────────────────┬──────────────────────────────┘    │
└──────────────────────────┼──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   PostgreSQL 16                              │
│  18 models, indexed FKs, advisory locks, JSONB audit logs  │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Backend Layered Architecture

Every module follows the same 4-layer pattern:

```
modules/<feature>/
├── <feature>.routes.ts       # Route → middleware chain → controller
├── <feature>.controller.ts   # Thin: extract input, call service, respond
├── <feature>.service.ts      # All business rules, transactions, audit
├── <feature>.validator.ts    # Zod schemas for body/query/params
```

| Layer | Responsibility | Must NOT |
|---|---|---|
| Route | Map HTTP method+path to middleware + controller | Contain logic |
| Middleware | Cross-cutting: auth, role check, validation, logging | Business rules |
| Controller | Parse validated input, call service, format response | Call Prisma directly |
| Service | Business rules, access scoping, transactions, audit | Touch req/res |

**Canonical request flow (example: PM posts stock OUT):**
1. `POST /api/v1/projects/12/inventory/transactions` (Bearer JWT)
2. Middleware: `requireAuth` → loads user, checks isActive
3. Middleware: `validateRequest('body', createTransactionSchema)` → Zod
4. Controller: calls `service.createTransaction(user, 12, body)`
5. Service: `assertProjectAccess` → `prisma.$transaction` → advisory lock →
   balance check → insert → audit log → commit
6. Controller: `sendSuccess(res, 201, result, message)`

---

## 5. Authentication & Authorization

### 5.1 Authentication Flow

```
1. User submits email + password to POST /api/v1/auth/login
2. Server: findUser(email), verify isActive, scrypt.verify(password)
3. Server: create JWT { sub: userId, role, iat, exp } (HS256, 8h)
4. Server: log LOGIN audit entry
5. Client: stores token in localStorage, sets Authorization header
6. Subsequent requests: requireAuth middleware verifies JWT,
   re-checks user.isActive on every request (immediate deactivation)
7. On 401: client clears token, redirects to /login
```

**Security measures:**
- Password hashing: scrypt (Node.js crypto, cost-equivalent to bcrypt)
- JWT: HS256 with env-configured secret (min 32 chars, no default fallback)
- Rate limiting: 10 login attempts per minute per IP
- JWT expiry: 8 hours (configurable via `JWT_EXPIRES_IN`)
- Deactivation takes effect immediately (DB check on every request)
- Generic error message on login failure (no user enumeration)

### 5.2 RBAC Model

Two roles only (decision D1):

| Role | Description |
|---|---|
| `ADMIN` | The builder/owner. Full control over all projects and users. |
| `PM` | Project Manager. Works only on projects assigned to them. |

### 5.3 Permission Matrix

`A` = Admin, `P` = PM on **assigned** projects only, `-` = no access.

| Resource / Action | Admin | PM |
|---|:-:|:-:|
| Login, view own profile, change own password | ✔ | ✔ |
| Create / edit / deactivate users | ✔ | - |
| Create / edit / delete lands | ✔ | - |
| Create / edit projects, assign PM | ✔ | - |
| Change project status (state machine) | ✔ | - |
| View projects | all | assigned |
| Create / edit materials | ✔ | - |
| Deactivate materials | ✔ | - |
| Create / edit vendors | ✔ | ✔ (P) |
| Manage material plans (per project) | ✔ | ✔ (P) |
| Create / edit daily logs | ✔ | ✔ (P, 48h window) |
| Delete daily log | ✔ | - |
| Post stock IN / OUT / ADJUSTMENT | ✔ | ✔ (P) |
| Void stock transaction | ✔ | ✔ (P, own, 48h) |
| View stock balances and wastage | ✔ | ✔ (P) |
| Create bill | ✔ | ✔ (P) |
| Edit / delete bill (PENDING/REJECTED) | ✔ | ✔ (P, own) |
| Approve / reject bill | ✔ | - |
| Record payment | ✔ | - |
| View bills and payments | all | assigned |
| Portfolio dashboard | ✔ | - |
| Project dashboard / summary | ✔ | ✔ (P) |
| Portfolio wastage overview | ✔ | ✔ (assigned) |
| View audit log | ✔ | - |

**Two-level authorization:**
1. **Role-level** (`requireRole('ADMIN')`): coarse, in the route chain.
2. **Scope-level** (`projectAccess(actor)`): fine-grained, in the service.
   Admin sees all; PM sees only `assignedPmId === actor.id`.

### 5.4 Access Scope Helper

```typescript
// projects.service.ts
export function projectAccess(actor: ProjectActor) {
  return actor.role === 'ADMIN' ? {} : { assignedPmId: actor.id }
}
```

Every service query that touches project data spreads `projectAccess(actor)`
into its Prisma `where` clause, ensuring PMs can never see unassigned projects.

---

## 6. Key Business Rules

### 6.1 Project Status State Machine

```
PLANNING → ACTIVE → ON_HOLD ↔ ACTIVE → COMPLETED (terminal)
```

- `PATCH /projects/:id/status` is Admin-only.
- Invalid transitions return 422 `BUSINESS_RULE_VIOLATION`.
- `COMPLETED` auto-sets `actualEndDate`.
- PMs cannot change status via `PATCH /projects/:id` (field is restricted).

### 6.2 Stock Concurrency Safety

Stock OUT and void operations use PostgreSQL advisory locks:

```typescript
await tx.$executeRaw`SELECT pg_advisory_xact_lock(${projectId}::int, ${materialId}::int)`
```

This prevents two simultaneous OUT requests from both passing the balance
check and creating a negative balance. The lock is transaction-scoped
(released on commit/rollback).

### 6.3 48-Hour PM Edit Window

PMs can edit daily logs and void stock transactions only within 48 hours
of creation (`EDIT_WINDOW_HOURS` env). Admins are unrestricted. This balances
data integrity with practical flexibility (decision D9).

### 6.4 Bill State Machine

```
PENDING → APPROVED → PARTIALLY_PAID → PAID
PENDING → REJECTED → (edit) → PENDING
```

- Payments are advisory-locked per bill (race-safe).
- Overpayment rejected (amount must be ≤ outstanding).
- Delete only if PENDING with no payments.
- REJECTED bills can be edited and resubmitted.

### 6.5 Progress-Adjusted Wastage

The key differentiator. Wastage is not "actual > planned" (which only fires
at project end). Instead:

```
expectedToDate = plannedQuantity × (progressPercent / 100)
overrun = max(consumed - expectedToDate, 0)
overrunPercent = overrun / expectedToDate × 100   (null if expected = 0)
threshold = plan.wastageThresholdPct ?? project.wastageThresholdPct
status = OVERRUN if overrunPercent > threshold
       | NO_BASELINE if progressPercent = 0 and consumed > 0
       | OK otherwise
estimatedLoss = overrun × plannedUnitRate
```

This flags over-consumption **while the project is running**, not after.

### 6.6 Audit Trail

Every mutation writes an `AuditLog` entry **inside the same transaction**:

| Field | Type | Description |
|---|---|---|
| userId | Int? | Who performed the action |
| action | AuditAction | CREATE/UPDATE/DELETE/APPROVE/REJECT/VOID/LOGIN/ACTIVATE/DEACTIVATE/PASSWORD_CHANGE/ASSIGN/STATUS_CHANGE |
| entityType | String | e.g. "Bill", "StockTransaction", "User" |
| entityId | Int? | The record's ID |
| oldValues | Json? | Snapshot before the change |
| newValues | Json? | Snapshot after the change |
| ipAddress | String? | For login audit |
| createdAt | DateTime | When the action occurred |

Sensitive fields (passwordHash) are stripped before logging.

---

## 7. Database Design

18 Prisma models in PostgreSQL 16:

```
User ─┬─< Project (assignedPm)
      ├─< Project (createdBy)
      ├─< DailyLog
      ├─< StockTransaction
      ├─< Bill
      ├─< Payment
      └─< AuditLog

Land ─< Project

Project ─┬─< ProjectMaterialPlan ── Material
         ├─< ProjectVendorAssignment ── Vendor
         ├─< ProjectMilestone
         ├─< DailyLog ─┬─< LabourEntry
         │             └─< MachineryEntry
         ├─< StockTransaction
         ├─< Bill ──< Payment
         ├─< Notification
         └─< Attachment
```

**Key constraints:**
- `@@unique([projectId, materialId])` on ProjectMaterialPlan (one plan per material per project)
- `@@unique([projectId, logDate])` on DailyLog (one log per project per date)
- `@@unique([vendorId, billNumber])` on Bill (unique bill number per vendor)
- Advisory locks for concurrent stock operations
- Soft-delete (isVoided) for stock transactions, never hard-delete
- All FKs indexed for filter performance

---

## 8. API Structure

All endpoints are under `/api/v1`. Standard response envelope:

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 47, "totalPages": 3 }
}
```

Error response:
```json
{
  "success": false,
  "error": {
    "code": "BUSINESS_RULE_VIOLATION",
    "message": "Insufficient stock available.",
    "details": { "available": 150, "requested": 200 }
  }
}
```

**Error codes → HTTP status:**
| Code | HTTP | Meaning |
|---|---|---|
| VALIDATION_ERROR | 400 | Zod validation failure |
| UNAUTHENTICATED | 401 | Missing/invalid token |
| FORBIDDEN | 403 | Role or scope denied |
| NOT_FOUND | 404 | Record doesn't exist |
| CONFLICT | 409 | Uniqueness violation |
| BUSINESS_RULE_VIOLATION | 422 | Rule broken (bad status, edit window) |
| INSUFFICIENT_STOCK | 422 | OUT exceeds balance |
| RATE_LIMITED | 429 | Too many login attempts |
| INTERNAL_ERROR | 500 | Unexpected (logged) |

---

## 9. Module Inventory

| Module | Endpoints | Status |
|---|---|---|
| auth | POST /auth/login, GET /auth/me, POST /auth/change-password | ✅ Complete |
| users | CRUD + status | ✅ Complete + audit |
| lands | CRUD | ✅ Complete + audit |
| projects | CRUD + status + summary + activity + analytics | ✅ Complete + audit |
| materials | CRUD + status (deactivate) | ✅ Complete + audit |
| vendors | CRUD + assignments | ✅ Complete + audit |
| material-plans | CRUD | ✅ Complete |
| inventory | stock IN/OUT/ADJUST + void + balances + wastage | ✅ Complete |
| billing | bills + payments + approve/reject + reports | ✅ Complete |
| daily-logs | CRUD with labour/machinery | ✅ Complete |
| milestones | CRUD | ✅ Complete |
| dashboard | GET /dashboard/admin, /dashboard/pm, /wastage/overview | ✅ Complete |
| audit | GET /audit-logs + stats | ✅ Complete |

---

## 10. Environment Configuration

```ini
# server/.env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://forgeos_user:forgeos_dev_password@localhost:5432/forgeos_db?schema=public
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
JWT_SECRET=<32+ random characters, REQUIRED>
JWT_EXPIRES_IN=8h
EDIT_WINDOW_HOURS=48
LOGIN_RATE_LIMIT_MAX=10
```

The server crashes at boot if `JWT_SECRET` is missing or shorter than 32 chars
(no insecure default fallback).

---

## 11. Local Setup

```bash
# 1. Start PostgreSQL
docker compose up -d

# 2. Backend
cd server
cp .env.example .env
# Edit .env: set JWT_SECRET to a 32+ char random string
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev    # http://localhost:4000

# 3. Frontend
cd ../frontend
cp .env.example .env
npm install
npm run dev    # http://localhost:5173

# 4. Login
# Email: admin@forgeos.local   Password: ForgeOS2026
```

---

## 12. Team Contribution Map

| Owner | Track | Modules |
|---|---|---|
| Vaibhav | Backend Core | Hygiene, auth hardening, material-plans, stock void, project status, wastage fixes |
| Riya | Backend Data | Dashboards, audit viewer, audit hooks, seed rewrite |
| Yashmeen | Infra | Docker compose, CI workflow, env config |
| Vinayak | Docs | Architecture doc, RBAC matrix, README |
