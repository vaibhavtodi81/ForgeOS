# T-8b — Test suite completion

Status: COMPLETE (subagent wrote all 9 remaining files before being cut off; orchestrator fixed test typings, resolved the one `test.fails`, and verified green)

## Final suite
- `bun run test` → **17 files, 215 tests, 215 passed, 0 failed, 0 skipped** (run twice for idempotency).
- `bunx tsc --noEmit` clean (project + tests; only pre-existing `examples/`/`skills/` scaffolding noise excluded).
- Test DB isolated at `db/test.db` (setup file pins `DATABASE_URL` before any `@/lib/db` import and loads JWT_SECRET from `.env`); the dev DB is never touched.

## Coverage map
- Unit: `auth` (13), `api-helpers` (23), `rate-limit` (6).
- Integration: `auth` (13 — incl. rate-limit + change-password), `otp` (7 — incl. anti-enumeration shape), `projects` (21 — CRUD, status machine, assign-pm, PM scoping), `lands` (9), `materials` (8), `material-plans` (dup 409, status machine, archived-edit 409, draft-only delete, filter validation, PM scoping), `inventory` (ACTIVE-only + future-date posting rules, plan-required 422, insufficient stock, ADJUSTMENT direction + signed storage, void + re-void 409 + balance exclusion, ledger filters, inventory rows math + inclusive isLowStock), `daily-logs` (ACTIVE-only, future-date, monotonic progress, duplicate-date 409, 48h PM edit/delete window, entries, reporting endpoints, summary/progress-history), `milestones` (CRUD + scoping), `activity` (audit-backed + PM scope), `wastage` (formula verified against DB-computed expectations, statuses, overview scoping), `dashboards` (admin shape, PM scoping, VIEWER read/403-write), `invoices-payments` (validation, transitions, overpay, auto-flip, summary math, number-retry after delete, PM scoping), `audit-users-meta` (ADMIN-only audit + filters + stats, users guards, meta scoping, suppliers).

## Fixes applied by orchestrator post-agent
- `tests/helpers.ts`: `okBody<T, M>` second generic for meta typing.
- Test typings in `daily-logs`/`material-plans` (nullable meta, full plan-row type).
- App fix surfaced by the suite: re-voiding a transaction returned 422 instead of the spec'd **409** — route corrected, test un-marked from `test.fails`.
- Earlier agent also updated for the intentional OTP anti-enumeration change (unknown/inactive email → 200 `{ok, delivered:false}` with no code).
