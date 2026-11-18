# ForgeOS UI Rollback — Master Port Specification

Goal: roll the sandbox app back to the user's ORIGINAL UI (from `/home/z/ForgeOS-orig/frontend`, their repo @06287cb), synced to the current Next.js backend. Zero hardcoded UI data. Preserve new capabilities: OTP login, Google OAuth, audit viewer, SQL dashboards, stock void, project status machine, material-plan CRUD, invoices/payments.

Reference clone (READ ONLY, do not modify): `/home/z/ForgeOS-orig` (original repo: `frontend/` = old UI, `server/` = original Express API + Prisma schema + seed + tests).

## 1. Architecture (fixed decisions — do not deviate)

1. **UI home**: `src/forgeos/` mirrors the original structure exactly:
   - `src/forgeos/App.tsx`, `src/forgeos/lib/…` (api adapter, session, router shim)
   - `src/forgeos/components/…` (landing: Navbar, Hero, Features, HowItWorks, ProductGallery, SiteStoryReveal, Testimonials, Footer, ui/perspective-tunnel-hero, ui/liquid-glass-navbar, ui/saa-s-template)
   - `src/forgeos/features/<feature>/…` (same folders as original: app-shell, authentication, bills, daily-logs, lands, materials, progress-history, projects, stock, users, vendors, wastage, audit(new), profile(new))
   - Relative imports inside `src/forgeos/**` keep working because structure matches the original `src/**`.
2. **Entry**: `src/app/page.tsx` = `'use client'` + renders `<ForgeOSApp />` (the ported App). `src/app/layout.tsx` minimal. **All UI routing is client-side.**
3. **Routing shim**: hash-based. Route string = `location.hash` minus leading `#` (e.g. `#/app/projects/123` → `/app/projects/123`, `#/login` → `/login`, `''` → landing). Provided by `src/forgeos/lib/router.ts` (foundation): `useHashRoute()` hook + `navigate(path)` + `navigateBack()`. NEVER use `window.location.href=…` or `history.replaceState` — replace every such call with `navigate(...)`. `<a href="/app/...">` → `<a href={'#'+path}>` (hash links don't reload). Keep the old `#login` support.
4. **API adapter** `src/forgeos/lib/api.ts` (foundation, already written — read it before use): same exports as original (`apiGet`, `apiPost`, `apiRequest`, `ApiError`), base `/api`, Bearer token from session store, unwraps `{success, data, meta}` envelope, 401 → `forgeos:unauthorized` event.
5. **Auth**: token stored in localStorage/sessionStorage (Bearer) — backend accepts Bearer. OAuth callback sets an httpOnly cookie, so `AuthProvider` also tries `GET /auth/me` once on boot even without a stored token. Login response `data = {token, expiresAt, user}`. Logout = `POST /auth/logout` + clear storage. Roles: backend now returns **`ADMIN` | `PM`** (VIEWER possible via OAuth first-login; treat as non-admin viewer).
6. **IDs are strings** (cuid). Change `id: number` → `id: string` in all ported types. Numeric comparisons (`Number(x)`, `parseInt`) are safe to keep; `project.id` used as React key is fine.
7. **No comment spam**: strip ALL `/* … */` auto-annotation comments from ported files (the repo still has them in some files). Keep meaningful code only. No new comments except tiny section markers.
8. **No hardcoded data**: every displayed value comes from the API. Replace the old hardcoded bits:
   - Sidebar "portfolio progress 65%" widget → real % from `/dashboard/admin` (admin) or `/dashboard/pm` (PM).
   - Topbar notifications bell → real recent items (admin: latest audit logs via `/audit-logs?limit=6`; PM: latest own daily logs via `/projects/:id/…` — use `/dashboard/pm` `recentLogs`).
   - Landing page marketing copy is CONTENT, not data — keep as-is.
9. **Do not touch** `src/components/ui/**`, `src/lib/{auth,db,audit,mailer,rate-limit,api-helpers,format,client-api}.ts`, `src/app/api/**`, `prisma/**` unless your task owns them (see ownership).
10. Deleted (foundation handles): old new-UI `src/components/forgeos/**`, `src/lib/store.ts`. `src/lib/forgeos-types.ts` is backend-owned (Task 2).

## 2. Backend contract (Task 2 implements; UI agents consume)

All responses use the ORIGINAL envelope. Success: `{ success: true, message: 'OK', data: <payload>, meta: <pagination|null> }`. Error: `{ success: false, message: <msg>, error: { code, message } }` with proper HTTP status. Pagination `meta` superset: `{ page, pageSize, limit, total, totalPages }`.

Roles in DB/API: `ADMIN`, `PM`, `VIEWER`(read-only, OAuth-created). All writes require ADMIN and/or PM; VIEWER gets 403.

### 2a. Ported to the ORIGINAL contract (paths under `/api`, shapes = original server; field names per original Prisma models; original services are at `/home/z/ForgeOS-orig/server/src/modules/**`):

| Endpoint | Notes |
|---|---|
| `GET /lands` (+POST, `PATCH/DELETE /lands/:id`) | Full original Land model: name, addressLine, city, state, pincode, areaValue, areaUnit(SQFT/SQYD/SQM/ACRE), surveyNumber, ownerName, purchaseDate, purchaseCost, notes. Pagination meta + `?search=`. Land lists include `projects` count. |
| `GET /projects` | Paginated (page/pageSize up to 100), meta totalPages. Project shape for old UI: id, code, name, location (project's own location field), status, startDate, expectedEndDate, actualEndDate, totalBudget, wastageThresholdPct, assignedPm {id,name,email} | null, land {addressLine, city, state, pincode}. PM sees own only. `POST /projects` (ADMIN), `PUT /projects/:id` (ADMIN), `PATCH /projects/:id/status` (state machine), `PATCH /projects/:id/assign-pm` — response `data = { project }`. |
| `GET /projects/:id/summary` | `{ latestProgressPercent, latestLogDate, totalDailyLogs, totalLabourHeadCount, totalLabourHours, totalMachineryHours, totalMachineryFuel }` |
| `GET /projects/:id/progress-history` | `[{ id, logDate, progressPercent, workSummary }]` ordered by logDate asc |
| `GET /projects/:id/activity` | Audit-backed activity feed: `data: [{ id, action, entityType, entityId, userId, userName, createdAt }]`, meta pagination. Accessible to PM for own project + ADMIN. |
| `GET/POST /projects/:id/daily-logs` | Original DailyLog model: logDate, progressPercent, workSummary, weather, issues, labourEntries[] (trade, contractorName, headCount, hoursWorked, remarks), machineryEntries[] (machineName, operatorName, hoursUsed, fuelLitres, remarks), createdBy {id,name}. Unique (projectId, logDate) → 409 on duplicate date. |
| `GET/PATCH/DELETE /daily-logs/:id` | Same shape; PATCH replaces entries. |
| `GET /projects/:id/labour-summary`, `/worker-count-history`, `/machinery-summary`, `/machinery-usage-history` | Original daily-logs reporting service, `?from=&to=`. |
| `GET/POST /projects/:id/milestones`, `PATCH/DELETE /milestones/:id` | Original Milestone model (name, description, sequence, planned/actual dates, status, progressPercent). |
| `GET /projects/:id/inventory` | InventoryRow[] per original inventory service (materialId, materialName, category, unit, openingStock, totalIn, totalOut, adjustmentIn, adjustmentOut, availableStock, plannedQuantity, lowStockThreshold, isLowStock). |
| `GET /projects/:id/inventory/summary` | InventorySummaryRow[] per original. |
| `GET /projects/:id/inventory/transactions` | StockTransaction[] per original shape: id, projectId, materialId, txnType(IN/OUT/ADJUSTMENT), quantity, unitRate, vendorId, challanNumber, outReason, adjustmentDirection, txnDate, dailyLogId, remarks, createdById, createdAt, isVoided, voidedAt, voidReason, voidedById, material{name,unit}, createdBy{id,name}. Filters: materialId, txnType, from, to, includeVoided. |
| `POST /projects/:id/inventory/transactions` | Original input incl. adjustmentDirection (INCREASE/DECREASE) + positive quantity — store ADJUSTMENT as signed quantity internally. `POST …/transactions/:id/void` (ADMIN, reason ≥5 chars). |
| `GET /projects/:id/inventory/wastage` | ORIGINAL formula: expected = plannedQuantity × progress/100; overrun; overrunPercent; threshold = plan.wastageThresholdPct ?? project.wastageThresholdPct; status OK/OVERRUN/NO_BASELINE; recordedWastageQuantity (OUT with DAMAGED/LOST); estimatedLoss. Returns `{ progressPercent, items }`. |
| `GET /materials` (+POST, `PATCH /materials/:id`) | Original Material model + description. category enum labels, isActive. |
| `GET /users` (+POST invite, `PATCH /users/:id` role/isActive/phone) | Original ApiUser shape incl. phone. PM-with-active-project deactivate block stays. |
| `GET /auth/me` | Full user row (id, name, email, role, phone, isActive, createdAt, updatedAt). |

### 2b. New-era endpoints (envelope-wrapped, contracts for the new old-style pages):

- `GET /dashboard/admin` — extended: existing sections PLUS `projects: [{ id, code, name, location, status, totalBudget, expectedEndDate, pm: {name}|null, latestProgressPercent, latestLogDate, totalDailyLogs }]` and `recentProgress: [{ projectId, projectName, code, id, logDate, progressPercent, workSummary }]` (top 8 by logDate desc) and keep `recentActivity`.
- `GET /dashboard/pm` — extended: `projects[]` gains `latestProgressPercent` (from latest daily log), `latestLogDate`, `totalDailyLogs`; keep recentLogs, upcomingEndDates, kpis, spendByMonth.
- `GET /wastage/overview` — portfolio table (per project+material: planned, consumed, overrun%, variance) using the ORIGINAL wastage formula, PM-scoped, plus totals + avgOverrunPct.
- `GET /audit-logs` (+`/stats`) — ADMIN. `data = { items: [{ id, actorName, action, entityType, entityId, projectId, ip, createdAt, meta }], total, page, limit }`; stats `{ total, byAction[], byActor[], last7Days[] }`. Filters: action, entityType, search, page.
- `GET/POST /invoices`, `PATCH /invoices/:id/status`, `GET/POST /payments` — current model (DRAFT→SENT→VOID; SENT→PARTIALLY_PAID→PAID; GST; payments) envelope-wrapped. Invoice row: id, invoiceNo, projectId, project {code,name}, amount, gstPct, totalWithGst, paidAmount, balance, status, issueDate, dueDate, payments[] (POST returns `{invoice}`). GET list `data={items, summary:{invoiced, collected, receivables, overdue}}`.
- `GET /suppliers` (+POST, PATCH) — supplier rows + supplyTxnCount. Used by the Vendors page.
- `GET /meta` — `{ materials, suppliers, lands, projects, managers }` (already close; envelope-wrap; managers = active PMs).
- `POST /auth/otp/request` `{email}` → `{ ok, delivered, expiresInSeconds, devCode? }` (devCode only when SMTP unconfigured); `POST /auth/otp/verify` `{email, code}` → `{ token, expiresAt, user }`.
- `GET /auth/oauth/google` (redirect; `?oauth_error=not_configured` when unset) + callback → `/` with cookie or `/?oauth_error=<code>`.
- `POST /auth/change-password` `{currentPassword, newPassword}` → `{ ok: true }`.
- `GET/POST /material-plans` (+`PATCH/DELETE /material-plans/:id`, +`GET /projects/:id/material-plans`): MaterialPlan = original fields (openingQuantity, plannedQuantity, plannedUnitRate, lowStockThreshold, wastageThresholdPct) + sandbox extras (status DRAFT/APPROVED/ARCHIVED, createdById, material{name,unit,category}, project{name,code}). Unique (projectId, materialId). Status transitions: DRAFT→APPROVED→ARCHIVED; archived not editable; only draft deletable.

### 2c. Schema changes (SQLite, strings not enums):
- `User`: + `phone String?`; roles 'ADMIN'/'PM'/'VIEWER' (migrate existing 'PROJECT_MANAGER'→'PM', 'ACCOUNTANT'→'PM').
- `Land`: original fields (addressLine, city, state, pincode, areaValue Float, areaUnit, surveyNumber, ownerName, purchaseDate, purchaseCost, notes) replacing location/areaSqft/khasraNumber.
- `Project`: + `location String?`, + `wastageThresholdPct Float @default(10)`; rename budget→totalBudget, plannedEndDate→expectedEndDate (update all routes + seed).
- `DailyLog`: logDate, progressPercent Float, workSummary, weather?, issues? + `LabourEntry` + `MachineryEntry` models; drop workDone/headcount/notes.
- `Milestone` model (original).
- `MaterialPlan`: original fields + status + createdById (rename plannedQty→plannedQuantity, wastagePct→wastageThresholdPct?).
- `InventoryTransaction`: + challanNumber, outReason, remarks, voidedById, dailyLogId?; rename supplierId→vendorId (maps to Supplier table).
- `AuditLog`: + `projectId String?`.
- Update `prisma/seed.ts` to seed ALL models richly (mirror original seed realism: ≥3 lands full fields, ≥5 projects, ≥12 materials, ≥5 suppliers, ≥7 plans, ≥20 txns incl. ADJUSTMENT + voided, ≥10 daily logs with entries, ≥5 milestones, ≥7 invoices + payments, ≥12 audit logs incl. projectId). Demo users: admin@forgeos.local / riya@ / yashmeen@ / vinayak@forgeos.local, password `ForgeOS2026` (scrypt, role ADMIN for admin, PM for others).

## 3. Task ownership (STRICT — do not edit files you don't own)

- **Foundation (done before you start)**: `src/forgeos/lib/{api.ts,session.ts,permissions.ts,router.ts}`, `src/forgeos/App.tsx`, `src/forgeos/features/{app-shell/components/*, authentication/auth/*, authentication/utils/*, projects/{projects-context.ts,useProjects.ts}}` (adapted), `src/app/{page.tsx,layout.tsx,globals.css}`, `.env`, `src/forgeos/features/app-shell/pages/ComingSoonPage.tsx`.
- **Task 2 (backend)**: `prisma/**`, `src/app/api/**`, `src/lib/{api-helpers.ts,forgeos-types.ts,audit.ts}` ONLY. Runs `bun run db:push` + reseed + `bunx tsc --noEmit`.
- **Task 3 (UI-A)**: `src/forgeos/components/**` (landing), `src/forgeos/features/authentication/{pages,components}/**` (LoginForm/LoginPage + OTP + Google), `src/forgeos/features/app-shell/{pages,data,hooks}/**` (dashboards), `src/forgeos/features/projects/**` EXCEPT context/useProjects (foundation) — incl. ProjectsPage (+create/edit/assign/status dialogs), ProjectDetailsPage, ProjectsProvider, project-utils, dashboardApi, useDashboardData.
- **Task 4 (UI-B)**: `src/forgeos/features/{stock,wastage,materials,lands,users,vendors,bills,profile}/**`.
- **Task 5 (UI-C)**: `src/forgeos/features/{daily-logs,progress-history,audit}/**`.

## 4. Porting rules (every UI agent)

1. Copy the original file, strip ALL auto-generated comments, fix navigation → shim, string ids, role checks (`user?.role === 'PM'`).
2. Data layer per feature: port the original `data/*.ts` api files verbatim in shape (same exported names/types the pages import) — the backend now serves the original contract, so most calls work by just keeping paths. For new-era endpoints (invoices/payments/suppliers/audit/dashboard/portfolio wastage), write typed fetchers in the feature's `data/` folder per §2b.
3. New features in the OLD design language (use existing CSS classes: `dashboard-card`, `dashboard-button`, `dashboard-input`, `dashboard-pill`, `dashboard-table` etc. from globals.css; lucide icons; no shadcn, no new CSS frameworks):
   - ProjectsPage: "Create project" (ADMIN) opens dialog (name, location, land select, budget, start date, expected end date) → `POST /projects`; row actions: View / Edit (PUT) / Assign PM (managers from /meta) / Status (PLANNING→ACTIVE→ON_HOLD↔ACTIVE→COMPLETED, COMPLETED terminal; COMPLETED sets actualEndDate).
   - MaterialPlanningPage: full CRUD (add plan dialog: material, plannedQuantity, plannedUnitRate, lowStockThreshold, wastageThresholdPct; edit; delete draft; approve → APPROVED; archive).
   - StockLedgerPage: Void action per row (ADMIN, confirm + reason ≥5 chars) → `POST …/void`.
   - WastageAnalysisPage: add "Portfolio overview" section at top (from `/wastage/overview`: KPI cards + table) above the per-project table.
   - BillsPage → InvoicesPage: keep the old page's layout/aesthetic but bind to invoices/payments (§2b): filters (status, project), summary cards, table (invoice no, project, amount, GST, total, paid, balance, status, dates), actions: Send (DRAFT→SENT), Void (DRAFT/SENT→VOID), Payments dialog (list + record payment), New invoice dialog (ADMIN). Sidebar label becomes "Invoices & Payments".
   - VendorsPage → keep title "Vendors" but bind to `/suppliers` (name, phone, email, address, supply txns count) + add dialog.
   - Profile page (new, `features/profile`): account card + change-password card (`POST /auth/change-password`), link from Topbar user menu.
   - Audit page (new, `features/audit`, ADMIN only, sidebar item "Audit Logs"): stats cards (from /stats) + filterable paginated table (from /audit-logs) in old design language.
4. Loading / error / empty states for every async section (match old patterns: inline retry buttons, `—` placeholders).
5. TypeScript strict — `bunx tsc --noEmit` must stay clean for your files; `bunx eslint <your files>` clean.
6. Do NOT start servers, do NOT run db commands, do NOT write tests.
7. When done: write `agent-ctx/<task-id>.md` documenting files touched + contracts used + deviations.
