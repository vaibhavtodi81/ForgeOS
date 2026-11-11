# ForgeOS Database Infrastructure

This directory contains PostgreSQL (16+) container setup and database reference material for the **ForgeOS Construction Management Platform**. Prisma at `server/prisma/schema.prisma` is the authoritative schema; use Prisma Migrate to create and apply database changes.

---

## 1. Directory Structure

```text
database/
├── docker-compose.yml          # 1-click containerized PostgreSQL 16 setup
├── schema.sql                  # Generated SQL reference from the Prisma migration
├── seeds/
│   └── 0001_seed_data.sql      # Legacy SQL reference; Prisma seed is authoritative
└── README.md                   # This setup & operations guide
```

---

## 2. Quickstart Options

### Option A: 1-Click with Docker (Recommended for Local Dev)

If you have Docker installed, simply run:

```bash
cd database
docker compose up -d
```

This will:
1. Start an official **PostgreSQL 16 Alpine** container on port `5432`.
2. Provide an empty PostgreSQL database for Prisma Migrate.
3. Mount persistent storage in a Docker volume `pgdata`.

To stop the container:
```bash
docker compose down
```

---

### Option B: Local PostgreSQL (`psql`)

If you have PostgreSQL installed on your machine:

```bash
# 1. Create the database
createdb forgeos_db

# 2. Configure `server/.env` with the connection URL
# 3. Apply the Prisma migration and seed
cd server
npm run db:migrate
npm run db:seed
```

---

### Option C: Cloud Hosted PostgreSQL (Neon, Supabase, AWS RDS, Railway)

1. Open your cloud database dashboard (e.g. [Supabase](https://supabase.com/) or [Neon](https://neon.tech/)).
2. Navigate to the **SQL Editor**.
3. Configure `server/.env` with the hosted connection URL.
4. Run `npm run db:migrate` and `npm run db:seed` from `server/`.

---

## 3. Database Credentials (Development Defaults)

| Parameter | Value |
|---|---|
| **Host** | `localhost` |
| **Port** | `5432` |
| **Database** | `forgeos_db` |
| **User** | `forgeos_user` |
| **Password** | `forgeos_dev_password` |
| **Connection URL** | `postgresql://forgeos_user:forgeos_dev_password@localhost:5432/forgeos_db?schema=public` |

These are local development defaults only. Override them with environment variables; do not use them in production.

---

## 4. Tables & Entity Summary

| Table | Purpose | Key Constraints |
|---|---|---|
| `users` | Admins and Project Managers | Unique lowercase email, role enum |
| `lands` | Land acquisition parcels | Linked to owner, area units (`SQFT`, `ACRE`) |
| `projects` | Construction sites on land | Unique project code (`PRJ-001`), budget check |
| `materials` | Master inventory catalog | Case-insensitive unique name, category enum |
| `vendors` | Suppliers & trade contractors | Case-insensitive name, unique GSTIN |
| `project_material_plans` | Budgeted BOM per project | Unique (project, material), positive qty |
| `daily_logs` | Daily site execution records | Unique (project, date), progress 0-100% |
| `labour_entries` | Headcounts per trade | Cascade on log delete, positive headcount |
| `machinery_entries` | Plant & machinery log | Hours used between 0 and 24 |
| `stock_transactions` | Inward/outward movement | Positive qty, reason checks, soft void |
| `bills` | Vendor invoices & tax | Unique (vendor, bill_number), GST checks |
| `payments` | Payouts against bills | Positive amount, payment modes |
| `audit_logs` | Immutable tamper audit log | JSONB old/new snapshots |
| `notifications` | System alerts & warnings | Dedupe keys for idempotency |
| `attachments` | Site photos, PDFs, challans | Target constraint (bill or daily log) |

---

## 5. Analytics Views Included

1. **`v_stock_balance`**: Live computed inventory balance per project, per material (`total_in`, `total_out`, `balance`).
2. **`v_wastage_status`**: Compares actual consumption against expected baseline calculated from project progress, flagging scrap and material overrun quantities.
3. **`v_project_financials`**: Financial health per site: total budget, committed bill value, pending exposure, total paid, and remaining unspent budget.

---

## 6. Default Demo Credentials (from Seed)

- **Administrator**: `admin@forgeos.com` / `Admin@123`
- **Project Manager 1 (Green Valley)**: `aarav@forgeos.com` / `Pm@12345`
- **Project Manager 2 (Skyline Hub)**: `priya@forgeos.com` / `Pm@12345`
- **Project Manager 3 (Riverside)**: `rohan@forgeos.com` / `Pm@12345`
- **Project Manager 4 (Urban Square)**: `neha@forgeos.com` / `Pm@12345`
