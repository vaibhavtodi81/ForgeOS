# Task 7-b — PROJECTS + MATERIAL PLANS + INVENTORY + DAILY LOGS (API)

Agent: backend-projects-inventory
Status: COMPLETE (all 9 files written, tsc clean for my files, eslint clean, smoke-tested end-to-end)

## Files created (nothing else touched)

1. `src/app/api/projects/route.ts` — GET (list, paginated), POST (create, ADMIN)
2. `src/app/api/projects/[id]/route.ts` — GET (detail), PUT (edit, ADMIN), DELETE (ADMIN)
3. `src/app/api/projects/[id]/status/route.ts` — PATCH (ADMIN, state machine)
4. `src/app/api/projects/[id]/assign-pm/route.ts` — PATCH (ADMIN, pmId or null)
5. `src/app/api/material-plans/route.ts` — GET (list), POST (ADMIN+PM)
6. `src/app/api/material-plans/[id]/route.ts` — PUT, DELETE (ADMIN+PM)
7. `src/app/api/inventory/transactions/route.ts` — GET (list + summary), POST (ADMIN+PM)
8. `src/app/api/inventory/transactions/[id]/void/route.ts` — POST (ADMIN)
9. `src/app/api/daily-logs/route.ts` — GET (list), POST (ADMIN+PM)

## Response shapes (frontend contract)

- `GET /api/projects` → `{ items: ProjectRow[], total, page, limit }`.
  Query: status, pmId, search (name/code contains), page, limit (default 20, max 100).
  PROJECT_MANAGER users are force-filtered to their own projects (pmId param ignored).
- `GET /api/projects/:id` → bare `ProjectDetail` at top level (NOT wrapped in `{ project }`):
  `ProjectRow + { plans: PlanRow[], transactions: TxnRow[] (latest 50), logs: LogRow[] (latest 30), invoices: InvoiceRow[] }`.
- `POST/PUT/PATCH project endpoints` → `{ project: ProjectRow }` (status/assign-pm/put all wrap).
- `GET /api/material-plans` → `{ items: PlanRow[] }` (query: projectId, materialId, status; PM sees own only).
  `POST` → `{ plan: PlanRow }`; `PUT /:id` → `{ plan: PlanRow }`; `DELETE /:id` → `{ ok: true }`.
- `GET /api/inventory/transactions` → `{ items: TxnRow[], total, page, limit, summary }`.
  Query: projectId, materialId, type (IN|OUT|ADJUSTMENT), voided=true|false, page, limit (default 20).
  `summary` = `{ spend, txnCount, voidedCount, totalIn, totalOut }`:
  - spend = Σ qty*rate of non-voided IN rows under the filters (task spec)
  - txnCount = total matching rows; voidedCount = matching rows with voidedAt != null (task spec)
  - totalIn/totalOut = Σ qty of non-voided IN / OUT rows (extra fields added for compatibility
    with `TxnListResponse` in src/lib/forgeos-types.ts which declares { totalIn, totalOut, spend })
  `POST` → `{ transaction: TxnRow }`; `POST /:id/void` → `{ transaction: TxnRow }`.
- `GET /api/daily-logs` → `{ items: LogRow[] }` (query: projectId, limit default 30 max 100).
  `POST` → `{ log: LogRow }`.

Notes: TxnRow.totalCost is COMPUTED (|quantity| * unitRate) — schema has no column. All dates ISO strings.

## RBAC implemented

- All GETs: any authenticated role (guardAuth() with no roles).
- All writes: `['ADMIN','PROJECT_MANAGER']`; PMs restricted via pmOwns → 403 "You can only access your own projects".
- Project create/edit/delete/status/assign-pm/void-txn: ADMIN only.
- 404s: "Project not found" / "Plan not found" / "Transaction not found".

## Key validation messages (exact strings)

- "Land not found", "Assigned manager must be an active Project Manager"
- "Budget must be greater than zero", "Valid start date is required"
- "Planned end date must be after the start date", "Invalid planned end date"
- "Name must be at least 3 characters"
- Status machine: "Cannot move a COMPLETED project to ACTIVE (allowed: none)" style + allowed list
- "Only planning projects with no recorded activity can be deleted" (409)
- "Material not found or inactive", "A plan for this material already exists on this project" (409)
- "Planned quantity must be greater than zero", "Wastage percentage must be between 0 and 100"
- "Archived plans cannot be edited", "Only draft plans can be deleted" (409)
- "Quantity must be greater than zero", "Adjustment quantity cannot be zero"
- "Unit rate cannot be negative", "Invalid transaction type", "Supplier not found"
- "Provide a reason (at least 5 characters)", "Transaction is already voided" (409)
- "Valid log date is required", "Work done must be at least 3 characters", "Headcount must be at least 1"
- "Invalid status filter" (bad ?status=), "Invalid transaction type filter" (bad ?type=)

## Deviations from spec (minor, intentional)

1. GET /api/projects/:id returns the ProjectDetail object directly (spec wording "Return ProjectDetail" vs wrapped "{ project }" used on mutations).
2. Txn summary includes totalIn/totalOut in ADDITION to spec'd spend/txnCount/voidedCount (bridge to forgeos-types TxnListResponse).
3. Project code generation retries up to 5 attempts on P2002 (per spec) using count()+1 as base.
4. Numeric body fields also accept numeric strings (small local `num()` helper); wastagePct in POST /api/material-plans is required per spec (no default).
5. PUT /api/projects/:id silently ignores status/pmId (spec: not allowed there) rather than 400.

## Verification

- `bunx tsc --noEmit`: zero errors in my 9 files (remaining repo errors are in examples/ and skills/ scaffolding and other agents' files).
- `bunx eslint` on my route folders: clean.
- Live smoke tests against dev server (seeded DB, admin@forgeos.local): list/detail shapes, PM forced
  filter + 403s, ACCOUNTANT read-only 403, state-machine guards, plan transitions + guards, txn
  IN/OUT/ADJUSTMENT + void + spend recalculation, daily-log create + validation, project CRUD cycle
  (create FOS-00x, PUT, assign/unassign PM, status walk, delete guard). Temp test data removed from DB.
