# ForgeOS API server

The Express and TypeScript API lives in `server/`. The Prisma schema at
`prisma/schema.prisma` is the source of truth for the PostgreSQL data model.

## Setup

```bash
cp .env.example .env
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
```

Set `DATABASE_URL` in `.env` to the PostgreSQL instance from the repository's
Docker setup. `CORS_ORIGIN` should point to the frontend origin.

## Commands

```bash
npm run dev       # development server with reload
npm run build     # compile TypeScript
npm start         # run compiled server
npm run lint      # strict TypeScript check
npm test          # unit tests and opt-in PostgreSQL integration tests
npm run db:validate
npm run db             # migration status
```

The API listens on `PORT` and exposes the public health endpoint at
`GET /api/v1/health`. It checks PostgreSQL through Prisma and returns a
degraded response when the database is unavailable.

Implemented API modules include authentication and user management, lands and
projects, daily site logs and project progress reporting, milestones, materials
and inventory, vendors and project assignments, and bills, payments, and
expense reports. Authenticated endpoints enforce role and project access in
the API; frontend role checks are only for presentation.
