# ForgeOS API server

The backend lives in `server/` because the repository already contained the
Prisma service and schema there. The existing schema is the source of truth;
this foundation does not add or replace domain models.

## Setup

```bash
cp .env.example .env
npm install
npm run db:generate
```

Set `DATABASE_URL` in `.env` to the PostgreSQL instance from the repository's
Docker setup. `CORS_ORIGIN` should point to the frontend origin.

## Commands

```bash
npm run dev       # development server with reload
npm run build     # compile TypeScript
npm start         # run compiled server
npm run lint      # strict TypeScript check
npm test          # health endpoint tests
npm run db:validate
```

The API listens on `PORT` and exposes the public health endpoint at
`GET /api/v1/health`. It checks PostgreSQL through Prisma and returns a
degraded response when the database is unavailable.

Authentication, authorization, and Daily Site Operations endpoints are not
implemented in this foundation. They should integrate with the existing
`User`, `Project`, and `DailyLog` Prisma models rather than creating duplicate
models.
