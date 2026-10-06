# 03. System Architecture

> This is the primary reference for **how the system is built**. Diagrams use Mermaid, which renders natively on GitHub.

---

## 1. Architectural style

A classic **three-tier web application**:

1. **Presentation:** React single-page app (SPA)
2. **Application:** stateless REST API (Node.js + Express + TypeScript) with a layered internal design
3. **Data:** PostgreSQL, accessed through Prisma (and raw SQL for reports)

Why this style: it maps directly to the course scope (frontend, backend, database), is easy for four people to split by feature, and needs no infrastructure beyond one API process and one database.

---

## 2. Technology choices

| Concern | Choice | Why |
|---|---|---|
| Language | TypeScript (client and server) | Catches integration mistakes early, which matters when four people share contracts |
| UI framework | React 18+ with Vite | Fast dev loop, huge ecosystem |
| Routing | React Router | Standard, nested layouts and route guards |
| Server state | TanStack Query | Caching, loading/error states, invalidation after writes |
| Forms | React Hook Form + Zod resolver | Fast forms with schema validation shared in style with the server |
| Styling / UI kit | Tailwind CSS + shadcn/ui | Polished, accessible components you own in your repo |
| Charts | Recharts | Simple declarative charts |
| Icons / toasts | lucide-react / sonner | Lightweight and consistent |
| HTTP client | Axios (or `fetch` wrapper) | Interceptors for the auth token and error normalisation |
| API framework | Express 5 | Familiar; async errors propagate to the error handler automatically |
| Validation | Zod | One validation library on both ends |
| ORM | Prisma | Typed queries, declarative schema, migrations, great for learners. Raw SQL for reports |
| Auth | JWT (`jsonwebtoken`) + bcrypt | Stateless, simple |
| Logging | pino + pino-http | Structured, fast |
| Security middleware | helmet, cors, express-rate-limit | Baseline hardening |
| Testing | Vitest + Supertest (API), Vitest + Testing Library (UI) | One test runner across the repo |
| Exports (S1) | `exceljs`, `pdfkit` | Server-side generation, no headless browser needed |
| Uploads (S2) | `multer` (local disk) | Simple; swap for S3-compatible storage later |
| Scheduling (S2) | `node-cron` | Daily notification sweep |
| Dev environment | Docker Compose (PostgreSQL), `tsx` (run TS), `concurrently` | One-command setup |
| Quality | ESLint, Prettier, GitHub Actions | Consistent code, automatic checks |

> Version note: use current stable releases at project start and lock them via `package-lock.json`. Library setup commands change between major versions (notably Prisma and Tailwind), so follow each tool's current official setup guide. The *architecture and schema* in these docs do not depend on specific versions.

---

## 3. System context and containers

```mermaid
flowchart LR
  subgraph Users
    A[Admin / Builder<br/>desktop browser]
    P[Project Manager<br/>mobile browser on site]
  end

  subgraph Client["Web client (static hosting)"]
    SPA[React SPA<br/>Vite build]
  end

  subgraph Server["API server (Node.js)"]
    API[Express REST API<br/>/api/v1]
    JOBS[Scheduled jobs<br/>node-cron, S2]
    FILES[(Upload storage<br/>local disk, S2)]
  end

  DB[(PostgreSQL)]

  A -->|HTTPS| SPA
  P -->|HTTPS| SPA
  SPA -->|JSON over HTTPS<br/>Bearer JWT| API
  API -->|Prisma / SQL| DB
  API --> FILES
  JOBS --> DB
```

- The SPA is static files, so any static host can serve it.
- The API is **stateless**. All state is in PostgreSQL (and uploaded files in S2), so it can be restarted or scaled freely.
- The SPA talks to the API only. It never touches the database.

---

## 4. Backend internal architecture

### 4.1 Layers

```mermaid
flowchart TB
  REQ[HTTP request] --> MW

  subgraph MW["Middleware pipeline"]
    direction TB
    M1[requestId + pino-http] --> M2[helmet / cors / rateLimit] --> M3[json body parser]
    M3 --> M4[authenticate<br/>verify JWT → req.user]
    M4 --> M5[requireRole]
    M5 --> M6[validate<br/>Zod body / query / params]
  end

  MW --> C[Controller<br/>thin: parse → call service → respond]
  C --> S[Service<br/>business rules, authorisation scope,<br/>transactions, audit]
  S --> R[(Prisma Client / raw SQL)]
  R --> DB[(PostgreSQL)]
  S -. throws AppError .-> EH[Global error handler<br/>formats error JSON]
```

| Layer | Responsibility | Must NOT |
|---|---|---|
| **Route** | Map `METHOD /path` to middleware chain + controller | Contain logic |
| **Middleware** | Cross-cutting: auth, role check, validation, logging | Contain business rules |
| **Controller** | Extract validated input, call a service, return `{success,data}` | Call Prisma, contain rules |
| **Service** | All business rules, access scoping, transactions, audit logging | Know about `req`/`res` |
| **Prisma/SQL** | Data access | Be imported outside services (and `lib/`) |

### 4.2 Server folder structure

```
server/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/               # generated + hand-added SQL (CHECKs, views)
│   └── seed.ts
├── src/
│   ├── server.ts                 # boots HTTP server, graceful shutdown
│   ├── app.ts                    # builds the Express app (testable, no listen)
│   ├── config/
│   │   └── env.ts                # Zod-validated environment variables
│   ├── lib/
│   │   ├── prisma.ts             # singleton PrismaClient (+ Decimal JSON patch)
│   │   ├── logger.ts             # pino instance
│   │   ├── errors.ts             # AppError + error codes
│   │   ├── response.ts           # ok(), paginated()
│   │   └── constants.ts          # UNITS, thresholds, edit window
│   ├── middleware/
│   │   ├── authenticate.ts
│   │   ├── require-role.ts
│   │   ├── validate.ts
│   │   ├── error-handler.ts
│   │   └── not-found.ts
│   ├── modules/                  # ONE FOLDER PER FEATURE (vertical slice)
│   │   ├── auth/        (routes, controller, service, schema)
│   │   ├── users/
│   │   ├── lands/
│   │   ├── projects/
│   │   ├── materials/
│   │   ├── vendors/
│   │   ├── material-plans/
│   │   ├── daily-logs/
│   │   ├── stock/
│   │   ├── wastage/
│   │   ├── bills/        (includes payments)
│   │   ├── dashboard/
│   │   ├── reports/                # S1 exports
│   │   ├── audit/                  # audit service + admin viewer
│   │   ├── notifications/          # S2
│   │   └── attachments/            # S2
│   ├── shared/
│   │   ├── access.ts             # assertProjectAccess, assertEditWindow
│   │   ├── pagination.ts
│   │   └── money.ts              # GST calc, rounding helpers
│   ├── jobs/                     # S2: notification sweeps
│   └── routes/index.ts           # mounts every module router under /api/v1
├── tests/                        # integration tests (Supertest), one file per module
├── .env.example
├── tsconfig.json
└── package.json
```

**Module file convention** (every module has the same shape, so AI tools and humans can navigate by pattern):

```
modules/bills/
├── bill.routes.ts        # router + middleware chain
├── bill.controller.ts    # thin handlers
├── bill.service.ts       # all logic
├── bill.schema.ts        # Zod schemas + inferred types
└── bill.test.ts          # (or in /tests)
```

### 4.3 Canonical route definition

```ts
// modules/bills/bill.routes.ts
router.post(
  '/bills/:id/approve',
  authenticate,
  requireRole('ADMIN'),
  validate({ params: billIdParam }),
  billController.approve,
);
```

### 4.4 Canonical service pattern

```ts
// modules/bills/bill.service.ts  (illustrative)
export async function approveBill(user: AuthUser, billId: number) {
  return prisma.$transaction(async (tx) => {
    const bill = await tx.bill.findUnique({ where: { id: billId } });
    if (!bill) throw new AppError('NOT_FOUND', 'Bill not found', 404);
    if (bill.status !== 'PENDING')
      throw new AppError('BUSINESS_RULE_VIOLATION', 'Only pending bills can be approved', 422);

    const updated = await tx.bill.update({
      where: { id: billId },
      data: { status: 'APPROVED', approvedById: user.id, approvedAt: new Date() },
    });

    await auditService.log(tx, {
      userId: user.id, action: 'APPROVE', entityType: 'Bill', entityId: billId,
      oldValues: { status: bill.status }, newValues: { status: updated.status },
    });
    return updated;
  });
}
```

---

## 5. Request lifecycle: example "PM records a stock OUT"

```mermaid
sequenceDiagram
  autonumber
  actor PM
  participant UI as React form (RHF + Zod)
  participant Q as TanStack Query mutation
  participant API as Express middleware chain
  participant SVC as stock.service
  participant DB as PostgreSQL

  PM->>UI: Fill material, qty, reason, date
  UI->>UI: Client-side Zod validation
  UI->>Q: submit(payload)
  Q->>API: POST /projects/12/stock/transactions (Bearer JWT)
  API->>API: authenticate → validate (Zod)
  API->>SVC: createTransaction(user, projectId, payload)
  SVC->>SVC: assertProjectAccess(user, 12) + project is ACTIVE
  SVC->>DB: BEGIN
  SVC->>DB: pg_advisory_xact_lock(projectId, materialId)
  SVC->>DB: SELECT balance (Σ IN − Σ OUT, non-voided)
  alt qty > balance
    SVC-->>API: AppError INSUFFICIENT_STOCK (422)
    DB-->>SVC: ROLLBACK
  else sufficient
    SVC->>DB: INSERT stock_transactions
    SVC->>DB: INSERT audit_logs
    SVC->>DB: COMMIT
    SVC-->>API: transaction row
  end
  API-->>Q: 201 {success:true,data} | 422 {success:false,error}
  Q->>Q: invalidate ['stock', 12], ['wastage', 12], ['projects', 12, 'summary']
  Q-->>UI: toast + refreshed table
```

**Concurrency rule:** any "check then write" on stock takes a transaction-scoped advisory lock keyed by `(projectId, materialId)` so two simultaneous OUT requests cannot both pass the balance check.

```ts
await tx.$executeRaw`SELECT pg_advisory_xact_lock(${projectId}::int, ${materialId}::int)`;
```

---

## 6. Authentication and authorisation

```mermaid
sequenceDiagram
  actor U as User
  participant SPA
  participant API
  participant DB
  U->>SPA: email + password
  SPA->>API: POST /auth/login
  API->>DB: find user by email (lowercased), is_active = true
  API->>API: bcrypt.compare
  API-->>SPA: { token (JWT, 8h), user }
  SPA->>SPA: keep token in memory + localStorage, set Axios header
  SPA->>API: later requests: Authorization: Bearer <token>
  API->>API: authenticate: verify JWT → req.user = {id, role}
  Note over API: on 401, SPA clears token and redirects to /login
```

- **JWT payload:** `{ sub: userId, role, iat, exp }`. No sensitive data.
- **`authenticate`** verifies the token and loads `req.user = { id, role }`. It also re-checks that the user is still `isActive` (one cheap query), so deactivation takes effect immediately.
- **Authorisation has two levels:**
  1. **Role** (`requireRole('ADMIN')`): coarse, in the route chain.
  2. **Scope** (`assertProjectAccess(user, projectId)`): fine-grained, **inside services**. Admin passes; PM passes only if `project.assignedPmId === user.id`. Item-level routes (`/bills/:id`, `/daily-logs/:id`) load the record, resolve its `projectId`, then call the same check.
- **Return 404 (not 403) for a PM requesting a project they are not assigned to** if you want to avoid leaking existence. Pick one behaviour and keep it consistent (default: **403 `FORBIDDEN`**).
- **Known limitation (document in the report):** localStorage tokens are exposed to XSS and tokens cannot be revoked before expiry. Mitigations: short expiry, React's default escaping, no `dangerouslySetInnerHTML`. Future: httpOnly cookie plus refresh tokens.

---

## 7. Key data flows

### 7.1 Daily log with labour and machinery
1. PM opens *New Log* for a project and date; the form pre-fills the last progress %.
2. Submit sends a **single nested payload** (log + `labourEntries[]` + `machineryEntries[]`).
3. Service, in one transaction: checks access, project `ACTIVE`, no duplicate date, progress not below the previous log; inserts log and child rows; writes audit.
4. Client invalidates logs, project summary, and wastage queries (progress feeds the wastage calculation).

### 7.2 Stock and wastage
1. Deliveries post `IN` (optionally linked to vendor/bill); consumption posts `OUT` with a reason.
2. Balances come from `v_stock_balance` (or the equivalent grouped query).
3. Wastage status is computed on read from plans, consumption, and the latest progress % (`v_wastage_status` plus a small TS step to compute overrun % and status).

### 7.3 Billing
```mermaid
stateDiagram-v2
  [*] --> PENDING: PM/Admin creates bill
  PENDING --> APPROVED: Admin approves
  PENDING --> REJECTED: Admin rejects (reason)
  REJECTED --> PENDING: PM edits and resubmits
  APPROVED --> PARTIALLY_PAID: payment < outstanding
  APPROVED --> PAID: payment = outstanding
  PARTIALLY_PAID --> PARTIALLY_PAID: payment < outstanding
  PARTIALLY_PAID --> PAID: payment = outstanding
  PAID --> [*]
```

### 7.4 Dashboards
Dashboards are **read-only aggregate queries** (no stored totals). They run in SQL (`$queryRaw`) using `GROUP BY` with `FILTER` clauses, and avoid join fan-out by aggregating bills and payments in separate subqueries. See `04-database-design.md` §7.

---

## 8. Cross-cutting concerns

### 8.1 Error handling

```ts
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public status = 400,
    public details?: unknown,
  ) { super(message); }
}
```

| Code | HTTP | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Zod failure. `details` = field errors |
| `UNAUTHENTICATED` | 401 | Missing/invalid/expired token or bad credentials |
| `FORBIDDEN` | 403 | Role or scope not allowed |
| `NOT_FOUND` | 404 | Record doesn't exist |
| `CONFLICT` | 409 | Uniqueness (duplicate email, bill no., log date) |
| `BUSINESS_RULE_VIOLATION` | 422 | Rule broken (invalid status transition, edit window passed) |
| `INSUFFICIENT_STOCK` | 422 | OUT exceeds balance |
| `RATE_LIMITED` | 429 | Too many attempts |
| `INTERNAL_ERROR` | 500 | Unexpected; logged, generic message returned |

The global handler also maps Prisma errors: `P2002` → `CONFLICT`, `P2025` → `NOT_FOUND`, `P2003` → `BUSINESS_RULE_VIOLATION`.

### 8.2 Validation
- **Server (authoritative):** a Zod schema per route for `body`, `query`, `params`. Coerce numeric query params (`z.coerce.number()`).
- **Client:** matching Zod schema in each form for instant feedback. The server is still the source of truth.
- **Database:** `NOT NULL`, `UNIQUE`, `FOREIGN KEY`, and `CHECK` constraints as the last line of defence.

### 8.3 Audit logging
- `auditService.log(tx, entry)` is called **inside the same transaction** as the change, so there are no phantom or missing audit rows.
- Stores `userId, action, entityType, entityId, oldValues (JSONB), newValues (JSONB), ipAddress, createdAt`.
- Never log passwords or tokens. Strip `passwordHash` before logging user changes.

### 8.4 Decimal handling
- `NUMERIC` in the DB. Prisma returns `Decimal`. A one-time patch in `lib/prisma.ts` (`Prisma.Decimal.prototype.toJSON = function () { return this.toNumber(); }`) makes responses plain JSON numbers.
- Sums and comparisons happen in SQL or with `Decimal` methods, never with float arithmetic on the server.
- The client only formats for display (`Intl.NumberFormat('en-IN')`).

### 8.5 Pagination, sorting, filtering
Query params: `page`, `limit`, `sort=field:asc|desc`, plus per-resource filters. A shared helper builds `skip/take` and the `meta` block. Always whitelist sortable fields.

### 8.6 Logging
`pino-http` logs method, path, status, duration, `requestId`, and `userId`. Do not log request bodies for auth routes.

### 8.7 Security checklist
- [ ] `helmet()` enabled
- [ ] CORS restricted to `CORS_ORIGIN`
- [ ] Login rate-limited
- [ ] bcrypt (cost ≥ 10) for passwords; never return `passwordHash`
- [ ] JWT secret ≥ 32 random chars, from env
- [ ] Prisma parameterised queries; `$queryRaw` only with tagged template (never string concatenation)
- [ ] Authorisation scope checked in every service touching project data
- [ ] File upload (S2): type allow-list, size limit, randomised stored filename, served only after auth
- [ ] No secrets in Git; `.env` ignored
- [ ] Generic login error message (no user enumeration)

---

## 9. Environment configuration

`server/.env.example`
```ini
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://buildtrack:buildtrack@localhost:5432/buildtrack?schema=public
JWT_SECRET=change-me-to-a-long-random-string-at-least-32-chars
JWT_EXPIRES_IN=8h
BCRYPT_ROUNDS=10
CORS_ORIGIN=http://localhost:5173
EDIT_WINDOW_HOURS=48
UPLOAD_DIR=./uploads
MAX_UPLOAD_MB=5
LOG_LEVEL=info
```

`client/.env.example`
```ini
VITE_API_URL=http://localhost:4000/api/v1
```

`config/env.ts` parses `process.env` with Zod and **crashes at boot** if anything is missing or malformed.

`docker-compose.yml` (repo root)
```yaml
services:
  db:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_USER: buildtrack
      POSTGRES_PASSWORD: buildtrack
      POSTGRES_DB: buildtrack
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```

---

## 10. Deployment topology

| Environment | Client | API | Database |
|---|---|---|---|
| **Local** | `vite dev` :5173 | `tsx watch` :4000 | Docker Postgres :5432 |
| **Demo/Prod (suggested)** | Vercel / Netlify / Cloudflare Pages (static) | Render / Railway / Fly.io | Neon / Supabase / Railway Postgres |

Deployment steps (API): set env vars → `npm run build -w server` → `npx prisma migrate deploy` → `node dist/server.js`. Free tiers may cold-start; open the app a minute before a demo. Uploaded files on ephemeral disks are lost on redeploy (S2 limitation; use object storage if deployed).

---

## 11. Performance and scalability notes

- Index every foreign key used for filtering and all `(project_id, date)` access paths (see DB doc).
- Always paginate lists; cap `limit` at 100.
- Dashboards aggregate in SQL, not in JS loops.
- Expected scale (tens of projects, thousands of ledger rows, hundreds of bills) is trivial for one Postgres instance. Do not over-engineer (no caching layer, no queues).

---

## 12. Testing strategy

| Level | Tool | What |
|---|---|---|
| API integration | Vitest + Supertest against a **separate test database** | Auth, RBAC, every business rule (negative stock, bill transitions, edit window, duplicate log date, payment cap) |
| Unit | Vitest | Pure helpers: GST calc, wastage calc, pagination |
| UI | Vitest + Testing Library | Critical forms and guards (login, route protection) |
| Manual | QA checklist (`09-project-plan.md`) | Role walk-throughs on seed data |

CI (GitHub Actions) runs lint → typecheck → test on every PR (see `08-development-workflow.md`).

---

## 13. Extension points (for stretch features)

| Feature | Where it plugs in |
|---|---|
| Exports (S1) | `modules/reports`: query service reuses list filters, `exceljs`/`pdfkit` stream the file; one endpoint `GET /reports/export/:type` |
| Budget alerts (S1) | Computed in `projects` summary; thresholds in `constants.ts` |
| Notifications (S2) | `notifications` module + `jobs/daily-sweep.ts`; also triggered inline after bill status changes. Uses `dedupeKey` to avoid repeats |
| Attachments (S2) | `attachments` module with `multer`; files in `UPLOAD_DIR`; download streamed after access check |
| Draft saving (S3) | Client only: serialise form state into `localStorage` keyed by project and date |
