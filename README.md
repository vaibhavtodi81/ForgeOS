# ForgeOS

ForgeOS is a project and financial management platform for builders and real
estate developers in India. Administrators manage the portfolio while project
managers use project-scoped site operations and reporting workflows.

## What ForgeOS does

- **Portfolio visibility:** Admins see every project's status, spend, wastage,
  and pending payments from one dashboard.
- **Daily site logs:** PMs log a day's activity (progress, labour, machinery,
  material movement) in a few minutes.
- **Stock ledger:** Per-project IN/OUT/ADJUSTMENT tracking with advisory-locked
  transactions and race-safe balance checks.
- **Progress-adjusted wastage:** Flags over-consumption **while the project is
  running**, not after — comparing actual consumption against planned × progress%.
- **Billing workflow:** Bills flow through PENDING → APPROVED → PAID with
  admin-only approval, payment recording, and overdue detection.
- **Full audit trail:** Every mutation is logged in-transaction with old/new
  values, user, and timestamp.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full system design, RBAC
matrix, and authentication flow.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Express 5, TypeScript, Prisma ORM |
| Database | PostgreSQL 16 |
| Auth | JWT (HS256) + scrypt password hashing |
| Security | helmet, CORS allow-list, express-rate-limit |
| Testing | Vitest + Supertest |
| CI | GitHub Actions |

## Project structure

```
ForgeOS/
├── frontend/          # React + Vite SPA
├── server/             # Express REST API
│   ├── prisma/         # Schema, migrations, seed
│   └── src/
│       ├── modules/     # One folder per feature (vertical slice)
│       ├── shared/     # Audit helper
│       ├── middleware/  # auth, validation, error handling
│       └── config/     # env, logger
├── docker-compose.yml  # PostgreSQL
└── .github/workflows/  # CI
```

## Quick start

### Prerequisites

- Node.js 20+
- Docker (or a local PostgreSQL 16 instance)

### 1. Start the database

```bash
docker compose up -d
```

### 2. Set up the backend

```bash
cd server
cp .env.example .env
# Edit .env and set JWT_SECRET to a 32+ character random string
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev          # API runs on http://localhost:4000
```

### 3. Set up the frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev          # UI runs on http://localhost:5173
```

### 4. Log in

The seed creates demo accounts with deterministic passwords:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@forgeos.local` | `ForgeOS2026` |
| PM | `riya@forgeos.local` | `ForgeOS2026` |
| PM | `yashmeen@forgeos.local` | `ForgeOS2026` |
| PM | `vinayak@forgeos.local` | `ForgeOS2026` |

## Roles

- **ADMIN (Builder):** Full control. Creates users, lands, projects, assigns
  PMs, approves bills, records payments, views the portfolio dashboard and
  audit logs.
- **PM (Project Manager):** Works only on assigned projects. Creates daily
  logs, posts stock, creates bills. Edit window of 48 hours for logs and stock
  voids.

See the [permission matrix](./ARCHITECTURE.md#53-permission-matrix) for the
full RBAC model.

## Key API endpoints

```
POST   /api/v1/auth/login              # Returns JWT + user profile
GET    /api/v1/auth/me                  # Current user
POST   /api/v1/auth/change-password     # Change own password

GET    /api/v1/dashboard/admin          # Portfolio dashboard (Admin)
GET    /api/v1/dashboard/pm              # PM dashboard
GET    /api/v1/wastage/overview          # Portfolio wastage alerts

GET    /api/v1/projects                  # List (scoped by role)
POST   /api/v1/projects                  # Create (Admin)
PATCH  /api/v1/projects/:id/status       # Status transition (Admin)

GET    /api/v1/projects/:projectId/material-plans
POST   /api/v1/projects/:projectId/material-plans

POST   /api/v1/projects/:projectId/inventory/transactions
POST   /api/v1/projects/:projectId/inventory/transactions/:id/void

GET    /api/v1/bills                     # List with filters
POST   /api/v1/bills/:id/approve         # Admin
POST   /api/v1/bills/:id/payments        # Admin

GET    /api/v1/audit-logs                # Admin, paginated + filtered
```

## Development

```bash
# Run lint (typecheck)
cd server && npx tsc --noEmit
cd frontend && npx tsc --noEmit

# Run tests
cd server && npm test

# Reset database
docker compose down -v
docker compose up -d
cd server && npx prisma migrate dev && npx prisma db seed
```

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — System design, RBAC, auth flow
- [docs/01-problem-statement.md](./docs/01-problem-statement.md) — Problem and scope
- [docs/02-requirements.md](./docs/02-requirements.md) — Functional requirements
- [docs/03-database-schema.md](./docs/03-database-schema.md) — Database design
- `server/prisma/schema.prisma` — Authoritative database schema

## License

MIT
