# Task 8-b — ForgeOS: Projects, Material Plans, Inventory, Daily Logs UI

Agent: 8-b (frontend views)
Status: COMPLETE — tsc clean, eslint clean, live API smoke-tested

## Files created (only these 5)

1. `src/components/forgeos/views/projects-view.tsx` — `export default function ProjectsView({ user }: { user: SessionUser })`
2. `src/components/forgeos/views/project-detail-dialog.tsx` — `export function ProjectDetailDialog({ projectId, open, onOpenChange, user })` (user accepted in props type, not destructured — dialog is read-only)
3. `src/components/forgeos/views/plans-view.tsx` — `export default function PlansView({ user })`
4. `src/components/forgeos/views/inventory-view.tsx` — `export default function InventoryView({ user })`
5. `src/components/forgeos/views/logs-view.tsx` — `export default function LogsView({ user })`

No other files were created or modified.

## Implementation notes for other agents

- All views use the shared `['meta']` query (`GET /api/meta`) for dropdown data; `['projects', …]`, `['plans', …]`, `['inventory', …]`, `['daily-logs', …]`, `['project', id]` query keys. Mutations call `queryClient.invalidateQueries()` with no args, so my mutations refresh every view's data (incl. dashboards).
- ProjectsView opens `ProjectDetailDialog` by clicking the project name cell (or "View details" in the row menu).
- Dialog form-reset pattern used throughout (lint rule `react-hooks/set-state-in-effect` is enforced repo-wide): parent passes a `key` that changes when the dialog target changes (e.g. `key={formMode}-${editRow?.id ?? 'new'}`), fields are initialized via `useState(() => prefill)` initializers, and a `close()` handler resets state when the dialog closes. Filter-driven page resets are done in `onValueChange`/`onChange` handlers, not effects. Recommend this pattern for any remaining dialogs.
- Role gating implemented as specced: admin-only (edit project, change status, assign PM, delete project, void txn); ADMIN+PM (new/edit plans, record txn, add log); ACCOUNTANT/VIEWER read-only.

## IMPORTANT for the types agent (forgeos-types.ts owner)

`TxnListResponse.summary` in the types file is `{ totalIn; totalOut; spend }` but the live backend (`src/app/api/inventory/transactions/route.ts` line ~98) actually returns `{ spend, txnCount, voidedCount, totalIn, totalOut }`. My InventoryView reads `txnCount`/`voidedCount` via a defensive cast (`(summary ?? {}) as unknown as { txnCount?: number; voidedCount?: number }`, falling back to `total` / `0`), so it works today and keeps compiling if the type is widened. Please sync the type when convenient — my code will still compile unchanged.

## Deviations from spec (minor, deliberate)

1. **PlansView edit dialog**: both Project and Material selects are disabled while editing (spec only said Material). Reason: the PUT contract only accepts `plannedQty/wastagePct/notes/status`, so changing project in edit mode would be silently ignored.
2. **PlansView delete AlertDialog description**: spec text "Only draft plans can be deleted." was expanded slightly to also tell users that transactions are kept.
3. **InventoryView "Transactions" stat**: uses `summary.txnCount ?? data.total` (see type note above). "Voided" uses `summary.voidedCount ?? 0`.
4. **AlertDialogAction** delete buttons get explicit red styling (`bg-red-600 …`) since the theme's default action color is primary, not destructive.

## Verification performed

- `bunx tsc --noEmit`: 0 errors in my 5 files. Remaining project-wide errors are only pre-existing `examples/` + `skills/` scaffolding (not part of the app).
- `bunx eslint` on the 5 files: exit 0.
- Live smoke tests against the running backend (as seeded admin):
  - `GET /api/projects?page=1&limit=10`, `?search=`, `GET /api/projects/:id` (plans/transactions/logs/invoices arrays verified with real data), `GET /api/material-plans`, `GET /api/daily-logs?limit=30`, `GET /api/inventory/transactions?page=1&limit=15` and `?voided=true` — all match the shapes rendered.
  - `POST /api/projects` with my create-dialog payload then `DELETE /api/projects/:id` — reversible create+delete cycle verified (test project removed; DB left clean).
  - Backend route bodies grepped to confirm my POST/PUT/PATCH field names match exactly.
