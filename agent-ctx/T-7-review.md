# T-7 — Line-by-line code review (gaps + bugs report)

Scope reviewed: all of `src/app/api/**`, `src/lib/{auth,api-helpers,audit,rate-limit,mailer,db,forgeos-types}.ts`, `prisma/schema.prisma` + `prisma/seed.ts`, all of `src/forgeos/**` (lib, features, App, landing components), `src/app/{page,layout}.tsx`, `src/app/globals.css`. Cross-checked against `/home/z/ForgeOS-orig/server/src/modules/**` (business logic source of truth) and the original frontend structure. Read-only GET/POST-login smoke checks were run against the dev server (admin + riya + aisha/VIEWER tokens). `bunx tsc --noEmit` and `bunx eslint` are clean for project files (only pre-existing `examples/` + `skills/` noise remains).

---

## 1. Critical bugs (breaks flows / data corruption / security)

### C1. Admin notification bell permanently empty — contract mismatch (frontend expects array, backend returns object)
- **File:** `src/forgeos/features/app-shell/components/Topbar.tsx:34-35`
- **What:** `loadNotifications('ADMIN')` does `apiGet<Array<…>>('/audit-logs?limit=6')` then `data.map(...)`. The backend (`src/app/api/audit-logs/route.ts:55`) returns `data = { items, total, page, limit }`, **not** an array. `data.map` throws `TypeError`, which is swallowed by the surrounding `try/catch` (Topbar.tsx:49) → `[]`.
- **Impact:** The spec requirement "Topbar notifications bell → real recent items (admin: latest audit logs via /audit-logs?limit=6)" is silently broken; admins always see "No notifications yet" and the bell dot never lights (Topbar.tsx:145 requires `notifications.length > 0`).
- **Fix:** `const { data } = await apiGet<{ items: Row[] }>('/audit-logs?limit=6'); return data.items.map(...)`.

### C2. Breadcrumbs "Operations" link does a full-page navigation to a non-existent route → 404
- **File:** `src/forgeos/features/app-shell/components/Breadcrumbs.tsx:10`
- **What:** `<a href="/app">Operations</a>` is a plain href, not a hash link. `/app` is not a Next.js route (the app is a hash-router SPA on `/`), so clicking performs a full document navigation and lands on the Next 404 page. This violates PORT-SPEC §1.3 (`<a href="/app/...">` → `#`-prefixed hash link) and is the only remaining raw internal href in `src/forgeos/**` (grep-verified; the other raw href, `LoginForm.tsx:262` `/api/auth/oauth/google`, is intentional).
- **Impact:** Broken navigation on every page that renders Breadcrumbs (AuditPage, ProfilePage, ProjectProgressPage, ComingSoonPage).
- **Fix:** `href={routeLink('/app')}`.

### C3. Wastage `estimatedLoss` uses a different formula than the original service
- **Files:** `src/app/api/projects/[id]/inventory/wastage/route.ts:38-41,65` and `src/app/api/wastage/overview/route.ts:56-57,85`
- **What:** Port computes `estimatedLoss = recordedWastage × avgInRate` (average of IN transaction unit rates). The original (`/home/z/ForgeOS-orig/server/src/modules/inventory/inventory.service.ts:161-162`) computes `estimatedLoss = overrun × decimal(plan.plannedUnitRate)` — i.e. the *overrun quantity* valued at the *planned* rate, not the recorded damaged/lost quantity valued at average purchase price. PORT-SPEC §2a says the endpoint must use "the ORIGINAL formula … estimatedLoss".
- **Impact:** Wrong loss figures whenever planned rates differ from average IN rates or when overrun ≠ recorded wastage (they are independent quantities). The WastageAnalysisPage "Estimated Loss" card (sums rows), the per-material table, the portfolio overview table, and dashboards that consume it all display the wrong number. Sorting by `estimatedLoss` in the per-project report (wastage/route.ts:70-76) also diverges from the original ranking.
- **Fix:** `const estimatedLoss = overrun * (plan.plannedUnitRate ?? 0)` in both routes (and drop the avgInRate computation), or re-run the spec decision — but as written it contradicts "ORIGINAL formula".

### C4. `isLowStock` off-by-one vs original (`<` vs `<=`)
- **File:** `src/app/api/projects/[id]/inventory/route.ts:52`
- **What:** Port: `plan.lowStockThreshold !== null && availableStock < plan.lowStockThreshold`. Original (`inventory.service.ts:77`): `available <= decimal(plan.lowStockThreshold)` — **inclusive**.
- **Impact:** A material whose available stock exactly equals its threshold is reported Healthy in the port but Low stock in the original (and in the StockDashboardPage low-stock banner, which claims "at or below the backend low-stock threshold" — the copy says inclusive, the math is exclusive).
- **Fix:** `availableStock <= plan.lowStockThreshold`.

### C5. Daily-log business rules from the original server are missing (data integrity)
- **File:** `src/app/api/projects/[id]/daily-logs/route.ts` (POST, lines 144-213) and `src/app/api/daily-logs/[id]/route.ts` (PATCH, lines 118-191)
- **Original rules dropped** (see `/home/z/ForgeOS-orig/server/src/modules/daily-logs/daily-logs.service.ts`):
  1. **Logs only for ACTIVE projects** (original :189-191, 422). Port lets a PM create logs for PLANNING/ON_HOLD/COMPLETED projects.
  2. **logDate cannot be in the future** (original :193-195 and :242-244). Port accepts future dates via API (the form blocks it client-side only — ProjectLogFormPage.tsx:162).
  3. **Progress monotonicity** (`assertProgressOrder`, original :25-36, :197-209, :247-267): progress cannot decrease from the previous log nor exceed the following log. Port accepts any 0-100 value on any date, so a backdated log can contradict the progress series that the wastage formula and dashboards consume (`expected = planned × latestProgress/100` is only meaningful with a monotonic series).
- **Impact:** Data corruption of the progress series (drives wastage status, dashboard averages, PM progress-change card) and rule bypass via API.
- **Fix:** Port the three checks into POST + PATCH (they are pure reads before the transaction).

### C6. 48-hour PM edit window enforced in the UI but not the API
- **Files:** `src/app/api/daily-logs/[id]/route.ts:118-128` (no window check) vs `src/forgeos/features/daily-logs/components/ProjectLogsListing.tsx:24-26,142,151` (`editWindowOpen`, disabled Edit button with tooltip "Project Managers can edit within 48 hours of creation") and original `daily-logs.service.ts:71-76` (422 outside window).
- **Impact:** The UI advertises a rule the backend doesn't enforce: any PM can PATCH any of their logs at any age via the API; conversely the UI disables the button even when the server would accept it. Also the edit window's counterpart on the original void flow (see G4) is gone entirely.
- **Fix:** Add the 48h check for PM (ADMIN exempt) in PATCH `/daily-logs/:id`, or drop the UI rule.

### C7. Stock posting rules from the original server are missing
- **File:** `src/app/api/projects/[id]/inventory/transactions/route.ts` (POST, lines 81-212)
- **Original rules dropped** (`inventory.service.ts`): (1) stock can only be posted to an **ACTIVE** project (`assertProject(actor, projectId, true)` :14-21, :83); (2) **txnDate cannot be in the future** (:85, 422).
- **Impact:** PMs can post IN/OUT/ADJUSTMENT against PLANNING/COMPLETED/ON_HOLD projects and with future dates via API (the ported forms gate `max={todayISO()}` client-side only — StockInPage.tsx:116, StockOutPage.tsx:107, StockLedgerPage.tsx:173).
- **Fix:** Add `project.status !== 'ACTIVE' → 422` and `txnDate > todayUtc → 422` inside the POST handler.

### C8. `POST /payments` performs two dependent writes without a transaction
- **File:** `src/app/api/payments/route.ts:118-128`
- **What:** `db.payment.create(...)` then `db.invoice.update({ status })`. If the update fails (or the process dies between them), a payment row exists whose invoice still says `SENT`, permanently breaking `paidAmount`/`balance` consistency (the status machine then blocks `PARTIALLY_PAID`→ manual fixes since ALLOWED_INVOICE_TRANSITIONS has no outgoing edges).
- **Fix:** Wrap both writes in `db.$transaction` (the codebase already uses `$transaction` elsewhere, e.g. transactions POST).

### C9. Invoice-number generation retry loop is ineffective → permanent 409 dead-end
- **File:** `src/app/api/invoices/route.ts:125-155`
- **What:** The loop retries 5× but always computes `invoiceNo = INV-<year>-${count+1}` — `attempt` is never added to the number (compare the projects route, which correctly uses `base + attempt`, `projects/route.ts:127-130`). On a P2002 (e.g. a middle invoice was deleted so `count+1` collides with an existing number), every retry proposes the same number and the request ends in `fail('Could not generate a unique invoice number…', 409)` until data is manually fixed.
- **Fix:** `String(count + 1 + attempt).padStart(3, '0')` — or better, `count({ invoiceNo: { startsWith: prefix } }) + 1 + attempt` semantics like projects.

### C10. VIEWER users get a broken default route + admin navigation
- **Files:** `src/forgeos/App.tsx:100-101` (`pathname === '/app'` → `isAdmin() ? AdminDashboardPage : ProjectManagerDashboardPage`), `src/forgeos/features/app-shell/components/Sidebar.tsx:135-137` (non-PM ⇒ adminItems).
- **What:** A VIEWER (OAuth-created; seeded as aisha@forgeos.local) that lands on `/app` is routed to the PM dashboard, but `GET /dashboard/pm` requires PM (verified: 403 for viewer) → the page renders its error card forever. The sidebar shows the full ADMIN nav ("Project Managers", "Audit Logs", "Lands Portfolio" …) which all lead to Access-Denied pages (`/dashboard/admin` itself is viewer-allowed and works).
- **Fix:** Route VIEWER to the admin dashboard (or a viewer landing), and give VIEWER its own nav list (or filter admin-only items by role).

### C11. PM sidebar "New Invoice" opens a dialog PMs cannot submit
- **Files:** `src/forgeos/features/app-shell/components/Sidebar.tsx:132` (managerItems includes `{ label: 'New Invoice', href: '/app/bills/upload' }`), `src/forgeos/App.tsx:135-136` (`/app/bills/upload` → `<BillsPage openUpload />`), `src/forgeos/features/bills/pages/BillsPage.tsx:66` (`formOpen` initialized from `openUpload`) while the create-invoice action is ADMIN-only (`POST /invoices` guardAuth ['ADMIN']; the "New invoice" header button is admin-gated at BillsPage.tsx:200 but the `openUpload`-driven dialog is not).
- **Impact:** A PM clicking "New Invoice" gets the modal, fills it, submits, and receives "You do not have permission to perform this action".
- **Fix:** Drop the PM sidebar item, or gate `openUpload` in BillsPage (`openUpload && isAdmin`).

---

## 2. Gaps vs the original app (behaviors the original server/UI had that are missing or changed here)

- **G1. Original stock-void PM flow removed** — original `voidTransaction` (`inventory.service.ts:200-211`) let a PM void their *own* transactions within `EDIT_WINDOW_HOURS`; the port is ADMIN-only (`transactions/[txnId]/void/route.ts:12`). PORT-SPEC §2a explicitly says ADMIN-only, so this is *spec-sanctioned*, but the PM edit-window counterpart was kept in the UI while this one was removed — the two flows are now inconsistent (see C6).
- **G2. `GET /lands/:id` missing** — original `lands.service.ts:24-28` + route; the port only has list/POST/PATCH/DELETE. Unused by the ported UI, so harmless, but the original contract endpoint is absent.
- **G3. Daily-log detail no longer includes `stockTransactions`** — original `getDailyLog` includes `stockTransactions: true` (`daily-logs.service.ts:174-181`); port's `LOG_INCLUDE` (daily-logs/[id]/route.ts:7-12) omits it. The ported detail page doesn't render them, so no visible regression; noted for contract completeness.
- **G4. Original project summary included the `project` object** (`projects.service.ts:231`); the port (per spec §2a) returns only the seven summary fields. Spec-sanctioned; original UI didn't rely on it.
- **G5. PM-deactivate guard is stricter than the original** — `src/app/api/users/[id]/route.ts:7` uses `ACTIVE_PROJECT_STATUSES = ['ACTIVE','ON_HOLD']`; the original blocks only `status: 'ACTIVE'` (`users.service.ts:75-82`). A PM with only ON_HOLD projects can no longer be deactivated. Probably an improvement, but a deliberate-looking deviation that isn't in the spec — flag for sign-off.
- **G6. Original `PUT /projects/:id` let a PM edit name/description of their own project** (`projects.service.ts:314-324`); the port is ADMIN-only (spec §2a says ADMIN — sanctioned). No UI path exists for PM edits, consistent.
- **G7. Status codes:** original POST daily-log/land/etc. returned 201; the port returns 200 everywhere. Original 422 business-rule codes partially preserved (txns/void/plans) but daily-log rules that used 422 are gone entirely (C5/C6).
- **G8. `GET /projects` search is name+code in both, but original used case-insensitive mode explicitly**; on SQLite, Prisma `contains` maps to `LIKE` (ASCII case-insensitive) so behavior matches in practice. No action.
- **G9. Lands validation stricter than original** — port requires name/city/state ≥ 2 chars (`lands/route.ts:76-78`); original validator min 1 (`lands.validator.ts:4,6,7`). UI has no min-length hints; backend 400 messages surface. Cosmetic deviation.
- **G10. `GET /projects/:id/inventory` `lowStockThreshold` returns `null` where the original coerced to 0** (`decimal(plan.lowStockThreshold)`). The ported types declare `number | null` and all consumers handle null — fine, but the wire shape differs from the original service.

---

## 3. Contract mismatches (frontend expects X, backend returns Y)

- **M1 (＝C1):** Topbar expects `/audit-logs` → array; backend returns `{items,total,page,limit}`. Feature-dead.
- **M2:** `src/forgeos/features/projects/pages/ProjectDetailsPage.tsx:50-58` — `PlanRow.plannedUnitRate: number` and `lowStockThreshold: number` are typed **non-null**, but the backend returns `number | null` (`material-plans` GET; verified `plannedUnitRate` is nullable in schema and can be null — forgeos-types.ts:449 agrees). At runtime `formatBudget(plan.plannedUnitRate)` (line 339) turns `null` into `Number(null) = 0` → renders "₹0.00" instead of "—". `lowStockThreshold` null happens to hit the `Number.isFinite(null) === false` path and shows "—".
- **M3:** `src/forgeos/features/daily-logs/data/projectReportingApi.ts:52-53` — `ProjectActivity.entityType/entityId` typed `string` (non-null); backend returns `string | null` (activity route maps audit rows verbatim). In practice project-scoped rows always carry entityType, but a seeded `LOGIN` row with `entityType: null` scoped via the `entityId/entityType` OR-clause would render "null · #null" (`ProjectOperationsReports.tsx:142`).
- **M4:** `src/forgeos/features/app-shell/components/Topbar.tsx:42-48` — PM branch reads `log.createdBy?.name` from `/dashboard/pm` `recentLogs`, but that shape has no `createdBy` (forgeos-types.ts:670). Silent fallback to 'Site team' for every PM notification. Harmless but the code implies a field that never exists.
- **M5:** Audit `entityType` vocabulary is inconsistent between **seeded** rows (`prisma/seed.ts:589-601` uses `'plan'`, `'transaction'`, `'log'`) and **live** rows (routes write `'material-plan'`, `'stock-txn'`, `'daily-log'`). The AuditPage entityType filter dropdown is built from observed values (AuditPage.tsx:132-138), so users see both spellings and filtering by one excludes the other's history.
- **M6:** `src/forgeos/features/app-shell/data/dashboardApi.ts:103-141` — `AdminDashboardResponse` (the fetch type) matches the backend, but `AdminDashboardData` (the returned type) silently discards `statusBreakdown`, `spendByMonth`, `budgetVsSpend`, `wastageByProject`, `recentInvoices`. Likewise `PmDashboardData.spendByMonth` is typed and fetched but never rendered by ProjectManagerDashboardPage. Not a runtime bug — flagged as unused-payload/dead data.
- **M7:** `GET /invoices` `summary` is computed over the **unfiltered** invoice set while `items` honor `status`/`projectId` filters (invoices/route.ts:64-84). BillsPage's caption (BillsPage.tsx:237) documents exactly this behavior, so frontend and backend agree — recorded here so the orchestrator knows it's intentional.
- **M8:** `src/forgeos/features/projects/data/projectsAdminApi.ts:74-80` — `updateProjectStatus`/`assignProjectPm` return the raw Prisma row (dates ISO-serialized by NextResponse.json) rather than the `toProjectJson` shape used by the list/detail routes. Field names coincide, so the UI works; only `_count` presence differs. No action needed.

---

## 4. Minor issues (a11y, dead code, perf, UX nits)

**Dead code / unused exports**
- `src/lib/forgeos-types.ts:89-155` — `ROLE_LABELS`, `PROJECT_STATUS_LABELS`, `PLAN_STATUS_LABELS`, `INVOICE_STATUS_LABELS`, `TXN_TYPE_LABELS`, `PAYMENT_METHOD_LABELS`, `AREA_UNIT_LABELS`, `BADGE_CLASSES` are exported but referenced nowhere (leftovers of the deleted new-UI).
- `src/forgeos/features/app-shell/components/dashboard-ui.tsx:73-84` — `Sparkline` and `Skeleton` never imported.
- `src/forgeos/features/stock/data/formatting.ts:1-17` — `formatINR` and `formatDate` never imported (pages define local copies).
- `src/forgeos/App.tsx:104-106` — legacy permission strings `hasPermission(['Project Manager', 'Admin'])` (works via `getCurrentRole()` mapping in permissions.ts:9-14, but the display-label API is legacy; `isAdmin()` is used everywhere else).

**Perf**
- Inventory/wastage/summary/overview routes fetch **all** project transactions and filter per plan in JS (e.g. `inventory/route.ts:16-54`, `wastage/route.ts:16-68`) — O(plans × txns); a single Prisma `groupBy(materialId)` would do it. Fine at seed scale, worth noting.
- `GET /projects/:id/inventory/transactions` is unpaginated (transactions/route.ts:72-78) — returns every row; the ledger page then does client-side search only.
- Dashboards load all logs/txns/invoices (`dashboard/admin/route.ts:26-76`, `dashboard/pm/route.ts:21-55`, `wastage/overview/route.ts:34-39` fetches *all* daily logs to derive per-project latest).
- `audit-logs/route.ts:38` — `orderBy: { createdAt: 'desc' }` without an id tiebreaker → same-millisecond rows can shuffle across pages.
- `ProjectsProvider` + `fetchAllDailyLogs` + `fetchLandOptions` fan out one request per page (page size 100) — acceptable, noted.

**Correctness nits**
- `invoices/route.ts:70-84` — summary `collected` includes payments attached to **VOID** invoices while `invoiced` excludes VOID, so `receivables = invoiced − collected` can underflow if an invoice is voided after payments (no such row in seed today).
- `parseDay`-based filters (`from`/`to` on logs, txns, reporting routes) silently ignore malformed dates instead of 400-ing (original validators 400'd).
- `material-plans/route.ts:49-50` — `status` query filter is not validated against PLAN_STATUSES (garbage → empty list, no error).
- `lib/rate-limit.ts` — in-memory limiter is per-process (no-op across instances) and the interval cleanup never stops; fine for the sandbox.
- `auth.ts` — token carries `role` from sign-time; role changes/deactivations don't invalidate outstanding 8h tokens (`/auth/me` re-checks `isActive`, but API routes trust the JWT role). Acceptable for demo; worth a note.
- OTP request returns 404 "No active account found for this email" (`otp/request/route.ts:32`) — user enumeration; also the 3-per-10-min cap is per-email (per-IP would be stronger). OTP verify caps attempts at 5 per code ✓ and expiry is checked ✓.
- OAuth callback decodes the id_token payload without signature verification (auth-only risk is low since it comes directly from Google's token endpoint over TLS, but use `jwtVerify` with Google's JWKS for hygiene); state cookie is not cleared on `state_mismatch`.
- `stock/data/formatting.ts:19-21` `todayISO()` uses UTC — for IST users, `max={todayISO()}` date inputs block "today" for the first 30 minutes after local midnight. Same class of nit: `BillsPage.tsx:41` and `ProjectLogFormPage.tsx:49-50` compute "today" at module load (stale across midnight in a long-lived tab).
- `dashboard/admin/route.ts:8-10,144-149` — month bucketing uses server-local time; txnDate is UTC midnight (fine if the server runs UTC, off-by-one month boundary otherwise).

**UX / a11y nits**
- `AdminDashboardPage.tsx:153,214` — "Open reports" navigates to `/app/reports` which is only a ComingSoonPage (dead shortcut in two places).
- `BillsPage.tsx:174-176` — after recording a payment the dialog closes instead of refreshing the payments list in place.
- `MaterialPlanningPage.tsx:58-66` — catalogue fetch failure is swallowed (sets `[]`), so "Add plan" silently offers zero materials with no retry.
- `LandsPage.tsx`/`UsersPage.tsx` — search fires a request per keystroke (abort-controller'd, but no debounce; AuditPage does debounce properly).
- `App.tsx:69-70` — protected-route fallback renders `<LoginPage />` inline for unauthenticated deep links before the redirect effect runs (brief double-render; acceptable).
- `LoginPage.tsx:34,47` — `href="/"` full page reload instead of hash navigation (works, since `/` is the SPA route, but inconsistent with the shim).
- `LoginForm.tsx:119-120` — OTP success does `window.location.hash = …; window.location.reload()` — full reload (per spec's letter only `window.location.href` was banned, but this is the heaviest possible "navigate").
- `ProjectLogFormPage.tsx:181` — client requires trade to be merely non-empty; backend requires ≥ 2 chars (daily-logs route :67) → 1-char trade surfaces as a server 400 instead of inline pre-validation. Same for milestones? (Milestone name ≥3 matches.)
- `Sidebar.tsx` — PM nav has no Profile item (Topbar menu covers it); VIEWER sees admin items (see C10).
- Mobile: tables use `min-w-[900..1200px]` inside `overflow-x-auto` wrappers — handled; the Bills page and stock pages are consistent. No fixed-width traps found.
- `AppShell.tsx:20` — stray blank line/prop artifact (cosmetic).

---

## 5. Verification status — what was checked and found CLEAN

**Backend (all 40 route files read line-by-line; cross-checked against original services):**
- ✅ Envelope `{success, message, data, meta}` / error shape on every route; `pageMeta` superset `{page,pageSize,limit,total,totalPages}` matches every frontend reader (`landsApi`, `usersApi`, `dailyLogApi`, `projectReportingApi`, `AuditPage` math).
- ✅ Auth: login (rate-limit 10/min/IP, inactive check, audit LOGIN/LOGIN_FAILED), `/auth/me` full row + isActive re-check, logout cookie clear, change-password (current-password verify, min 8, audit), OTP request (3/10min + 60s cooldown, old codes consumed, devCode only when SMTP unset), OTP verify (expiry, 5-attempt cap, consume-on-success, audit), Google OAuth (state cookie set + validated, inactive redirect, VIEWER provisioning + OAuthAccount upsert, session cookie).
- ✅ Token handling: Bearer preferred, httpOnly cookie fallback; 401 → `forgeos:unauthorized` → AuthProvider reset (path-agnostic for login/verify).
- ✅ RBAC matrix verified by reading every `guardAuth` call + live smoke tests: ADMIN passes all; VIEWER blocked from all writes (POST project/txn/milestone/plan, PATCH) and from `/users`, `/audit-logs`; PM blocked from admin routes; `guardAuth(req, [])` footgun unused.
- ✅ PM scoping: `pmOwns` on every project-scoped route (projects detail/summary/activity/daily-logs/inventory ×4/transactions/void/wastage/milestones/material-plans/reporting ×4); `where.project.assignedPmId` on invoices/payments/wastage-overview/material-plans/dashboards; `projects.some.assignedPmId` on lands; PM `?pmId=` filter ignored (verified live: cross-PM GET/POST → 403; wastage overview + meta scoped to own projects).
- ✅ Insufficient-stock guard: `balance = opening + IN + signed ADJ − OUT` computed inside a transaction; OUT and ADJUSTMENT-DECREASE blocked when `quantity > balance` (422 with balance/unit); ADJUSTMENT stored signed, returned as `Math.abs(quantity)` + `adjustmentDirection` — matches spec §2a.
- ✅ Void semantics: ADMIN-only, reason ≥ 5 chars, double-void 422, balance guard for IN/ADJUSTMENT+ (voiding can't drive stock negative), balances implicitly restored because every aggregation filters `voidedAt: null`; audit `TXN_VOID` with projectId.
- ✅ Project status machine identical on both sides: `PLANNING→ACTIVE`, `ACTIVE→ON_HOLD|COMPLETED`, `ON_HOLD→ACTIVE`, `COMPLETED` terminal; COMPLETED sets `actualEndDate` (route + ProjectDialogs `allowedTransitions` are the same set; backend 400s surfaced inline).
- ✅ Plan status machine identical: `DRAFT→APPROVED→ARCHIVED`, archived not editable (409), only draft deletable (409), 409 on duplicate `(projectId, materialId)`, per-field PATCH validation, PLAN_STATUS/PLAN_UPDATE audit split.
- ✅ Invoice status machine consistent: manual `DRAFT→SENT|VOID`, `SENT→VOID`, paid states terminal- manual and set automatically by payments with ε=0.01 tolerance on both overpay check and PAID flip; UI Send/Void buttons expose exactly the allowed set; overpay blocked (409 with balance).
- ✅ GST math: `totalWithGst = amount × (1 + gstPct/100)`, `paidAmount = Σ payments`, `balance = total − paid`; GST restricted to `{0,5,12,18,28}`; due > issue enforced both sides.
- ✅ Daily-log validation: logDate format, progress 0-100, workSummary ≥ 3, labour trade ≥ 2 / integer headCount ≥ 1 / 0 < hours ≤ 24, machinery name ≥ 2 / 0 < hours ≤ 24 / fuel ≥ 0 — matches the ported form's client rules (T-5) except the 1-char-trade nit; 409 duplicate `(projectId, logDate)` (unique constraint backed); PATCH replaces entries atomically via `$transaction` (nested `create` on `UncheckedUpdateInput` verified valid in the generated client).
- ✅ Reporting endpoints reproduce the original aggregation math exactly (labour-summary totals/byTrade, worker-count-history per-log, machinery-summary totals/byMachine, machinery-usage-history flatMap) with `?from=&to=` UTC-midnight filters; activity feed = audit-backed with meta pagination.
- ✅ Projects list/detail shapes (incl. `assignedPm`, trimmed `land`, `_count`), summary fields, progress-history (id/logDate/progress/workSummary asc), meta (materials/suppliers/lands/projects/managers), suppliers (+supplyTxnCount, findFirst name-dup guard), materials (name-dup 409, deactivate-guard vs active plans 422), users (invite validation, self-demotion/self-deactivate blocks, PM-active-project deactivate guard, ROLE_CHANGE/ACTIVATE/DEACTIVATE audits).
- ✅ Dashboards: admin (kpis incl. budgetUtilization/receivables/overdue/avg+worst wastage, 6-month spend buckets, projects[] with latest log + counts, recentProgress top-8, recentActivity 8) and PM (own-projects only, upcoming ACTIVE end dates, recentLogs 6, draftPlans, avgWastage) — shapes match `dashboardApi.ts`; spot-checked live.
- ✅ Audit rows include `projectId` everywhere the spec requires (project/plan/txn/log/milestone/invoice/payment writes); `/audit-logs` + `/stats` are ADMIN-only with action/entityType/actorId/projectId/search filters and correct 25-default pagination.
- ✅ Prisma schema: unique constraints match the 409s relied on (project.code, material.name, invoice.invoiceNo, dailyLog (projectId,logDate), materialPlan (projectId,materialId), supplier checked in code, user.email); cascades (project→plans/txns/logs/milestones/invoices/audit-logs, invoice→payments, log→entries, oauth→account) and `SetNull` for assignedPm/audit project match the delete guards (project delete blocked while children exist, land delete blocked while projects exist).
- ✅ Seed: rich and spec-compliant (6 users incl. inactive PM + VIEWER, 4 lands full fields, 6 projects, 14 materials, 6 suppliers, 16 plans, 134 txns incl. signed ADJUSTMENTs + 1 voided + DAMAGED/LOST outs, 14 logs w/ 25+11 entries, 10 milestones, 7 invoices + payments, 31 project-scoped audit rows); demo logins verified live.

**Frontend (all `src/forgeos/**` files read):**
- ✅ API adapter: envelope unwrap, Bearer from session store, 401 event, ApiError with status/code; no `window.location.href` navigations anywhere (grep-verified; the only raw internal href is C2).
- ✅ Hash router: `parseHashRoute` handles `''`, `#`, `#/`, `#login`, `#/login…`; `useHashRoute` re-renders on hashchange/popstate; `navigate('/')` replaceState + synthetic event works; `/` page-load shows the landing page with no flash (status-gated render in App.tsx).
- ✅ Session: localStorage/sessionStorage split by remember-me, `/auth/me` boot restore (covers OAuth cookie), unauthorized event handling, OTP/OAuth password-less login paths.
- ✅ ProjectsProvider: paginated fetch-all with requestKey staleness guard + abort; ProjectSelector disabled states; sessionStorage persistence per user.
- ✅ Race-condition hygiene: every data-loading page uses AbortController + requestKey/settledKey (or equivalent) guards — ProjectDetailsPage, Stock×4, Wastage×2, Materials, Planning, Lands, Users, Vendors, Bills, Audit, DailyLogs/Listing, Progress, Milestones, OperationsReports, dashboards. No stale-state or set-state-after-unmount bugs found. Filter-change page resets are in handlers, not effects (react-hooks lint clean).
- ✅ Known-bug list verified fixed: JWT_SECRET in `.env` (+ 32-char enforcement); supplier name lookups use `findFirst` with real txn count on no-op PATCH; sidebar progress averages only projects with logs (Sidebar.tsx:59,68 + 60s TTL cache keyed by role:userId); StockLedger void button has per-row unique `aria-label` (date + material).
- ✅ No hardcoded UI data: sidebar progress from dashboards, notifications from audit/dashboards (albeit broken per C1/M4), every table/KPI/form bound to API values; the only literals are landing-page marketing copy (exempt per spec) and enum option lists (UI mirrors of backend enums — statuses, GST rates, categories, units, payment methods, out-reasons).
- ✅ Loading/error/empty states present on every async section (inline retry buttons, `—` placeholders, empty-state CTAs) — spot-verified on all pages read.
- ✅ `bunx tsc --noEmit`: zero diagnostics in `src/**` (only `examples/` + `skills/` pre-existing). `bunx eslint src/forgeos src/app src/lib` exit 0.

**Top-priority fix list for the final pass:** C1 (Topbar audit items), C2 (Breadcrumbs href), C3 (estimatedLoss formula), C5+C6+C7 (daily-log/stock business rules + 48h window), C4 (isLowStock boundary), C8 (payments transaction), C9 (invoiceNo retry), C10/C11 (VIEWER + PM invoice-dialog routing).
