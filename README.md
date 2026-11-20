# ForgeOS

ForgeOS is a project and financial management platform for builders and real
estate developers in India. Administrators manage the full portfolio while
project managers run project-scoped site operations — materials, stock, daily
logs, progress and billing — with every action captured in an audit trail.

## Roles

| Role | Scope |
|---|---|
| `ADMIN` | Full portfolio: users, lands, suppliers, all projects, audit, billing |
| `PROJECT_MANAGER` | Assigned projects only: site operations, reporting, invoices |
| `VIEWER` | Read-only dashboards and reports |

Permissions are enforced by a central RBAC matrix (`src/lib/rbac.ts`) with
named permissions — every API route declares what it needs, and the session
guard checks it. See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full design,
auth flows (password + OTP + Google OAuth) and the permission matrix.

## Tech stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript 5**
- **Tailwind CSS 4** with **shadcn/ui** (New York) components
- **Prisma ORM** with **SQLite** (`db/custom.db` locally)
- **Vitest** — unit, integration (real SQLite, seeded) and jsdom frontend suites
- **GitHub Actions** CI with a job per part (lint / typecheck / backend /
  frontend / build) and a single `ci-ok` gate for branch protection

## Quickstart

Prerequisites: [Bun](https://bun.sh) (v1.1+).

```bash
bun install                      # install dependencies

cp .env.example .env             # then edit .env:
#   JWT_SECRET=$(openssl rand -hex 32)   # required, >= 32 chars

bun run db:push                  # create the SQLite schema (db/custom.db)
bun run db:seed                  # seed a realistic demo portfolio

bun run dev                      # http://localhost:3000
```

### Demo accounts (after seeding)

All seeded users share the password **`ForgeOS2026`**.

| Email | Role |
|---|---|
| `admin@forgeos.local` | ADMIN — Vaibhav Todi |
| `riya@forgeos.local` | PROJECT_MANAGER — Riya Sharma |
| `yashmeen@forgeos.local` | PROJECT_MANAGER — Yashmeen Khan |
| `vinayak@forgeos.local` | PROJECT_MANAGER — Vinayak Patil |
| `aisha@forgeos.local` | VIEWER — Aisha Rao |

## Scripts

| Command | What it does |
|---|---|
| `bun run dev` | Start the dev server on port 3000 |
| `bun run build` / `bun run start` | Production build (standalone) and serve |
| `bun run lint` | ESLint over the repo |
| `bun run typecheck` | `tsc --noEmit` over app + tests |
| `bun run test` | All tests (backend unit + integration + frontend) |
| `bun run test:unit` / `test:integration` / `test:frontend` | Individual suites |
| `bun run db:push` / `db:seed` / `db:generate` | Prisma schema push, demo seed, client generate |

Integration tests run against a throwaway `db/test.db` that CI recreates and
reseeds on every run — the dev database is never touched.

## Project structure

```
prisma/                  schema + deterministic demo seed
src/app/api/             REST API routes (15 modules, RBAC-guarded)
src/app/page.tsx         SPA entry (hash-router, no page navigations)
src/forgeos/             Frontend: app shell, features/*, shared components
src/lib/                 auth, RBAC, audit, rate limit, API helpers, db client
src/components/ui/       shadcn/ui component set
tests/                   unit/ integration/ frontend/ (Vitest)
.github/workflows/ci.yml per-part CI pipeline
ARCHITECTURE.md          system design, auth, RBAC matrix, quality gates
```

## Contributors

- [@vaibhavtodi81](https://github.com/vaibhavtodi81) — Vaibhav Todi
- [@itsriy-aa](https://github.com/itsriy-aa) — Riya
- [@yashmeeny25707-dev](https://github.com/yashmeeny25707-dev) — Yashmeen Khan
- [@vinayakp25507-png](https://github.com/vinayakp25507-png) — Vinayak Patil
