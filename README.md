# ForgeOS

ForgeOS is a centralized project and financial management platform for builders and real estate developers. Builders get a portfolio view, while managers use operational data entry workflows for progress, tasks, finance, documents, and approvals.

## Top-level folders

- `backend/` - Node.js modular monolith API, integrations, jobs, and ORM-side stubs.
- `frontend/` - React/Next.js App Router application for builder, manager, and shared workflows.
- `database/` - Standalone PostgreSQL migrations, seed data, and the entity relationship diagram.
- `docs/` - Source-document placeholders for architecture, requirements, and database schema.

The files under `backend/src/db/models/` are ORM-side stubs. The files under `database/migrations/` are the real schema; keep both in sync.
