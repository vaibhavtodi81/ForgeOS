# Task 7-c — Dashboards + Wastage + Audit + Billing API

Agent: 7-c (backend routes)
Status: COMPLETE — all 8 files written, `bunx tsc --noEmit` clean for my files, ESLint clean, all endpoints smoke-tested against the live dev server (port 3000) with the seeded demo DB.

## Files created (only these)

1. `src/app/api/dashboard/admin/route.ts` — GET. guardAuth ADMIN/ACCOUNTANT/VIEWER. Full AdminDashboardResponse: kpis (status counts, totalBudget/totalSpend, budgetUtilization, receivables + overdue count over SENT/PARTIALLY_PAID, avgWastagePct, worst project), statusBreakdown (enum order incl. zeros), spendByMonth (6 calendar months, zero-filled, JS bucketing from findMany txnDate >= start of 5 months ago), budgetVsSpend (top 6 by budget, name truncated 18 chars + '…'), wastageByProject (mean of non-null plan wastages, desc nulls-last, take 6), recentActivity (8 audit logs), recentInvoices (6 by createdAt desc).
2. `src/app/api/dashboard/pm/route.ts` — GET. guardAuth PROJECT_MANAGER (ADMIN override also passes per guardAuth). Scoped to pmId = user.id: kpis (myProjects, activeProjects, totalBudget, totalSpend, draftPlans, avgWastagePct), projects (ACTIVE first then name; wastagePct project-level mean; progressPct = min(100, spend/budget*100) or null), spendByMonth (own), recentLogs (6), upcomingEndDates (ACTIVE + plannedEndDate, asc, take 5).
3. `src/app/api/wastage/overview/route.ts` — GET. guardAuth any. PM sees only own projects' plans (where project.pmId). WastageRow per plan: estimated = plannedQty/(1+wastagePct/100), wastagePct = estimated>0 ? (consumed-estimated)/estimated*100 : null, varianceQty = consumed - planned. Portfolio totals + avgWastagePct. Sort: wastagePct desc nulls last, then projectName asc.
4. `src/app/api/audit-logs/route.ts` — GET. guardAuth ADMIN. parsePagination(url, 25) (max 100). Filters: action, entityType, actorId, search (OR contains on actorName / meta / entityId). Order createdAt desc. Returns Paginated<AuditRow> { items, total, page, limit }.
5. `src/app/api/audit-logs/stats/route.ts` — GET. guardAuth ADMIN. total, byAction top 8, byActor top 6 (actorName != null), last7Days (7 zero-filled days ascending ending today, labels 'Mon 26' style; buckets computed in JS).
6. `src/app/api/invoices/route.ts` — GET + POST.
   - GET: guardAuth any. PM scoped to own projects. Items filtered by status?/projectId? (createdAt desc). Summary computed over PM-visible (or all) invoices EXCLUDING DRAFT/VOID (summary deliberately ignores status/projectId query filters per spec wording): invoiced (SENT/PARTIALLY_PAID/PAID totalWithGst), collected (their payments), receivables = invoiced - collected, overdue (balance of SENT/PARTIALLY_PAID past due).
   - POST: guardAuth ADMIN/ACCOUNTANT. Validates amount > 0, gstPct in GST_OPTIONS, parseDate issue/due, dueDate > issueDate, project exists (404). invoiceNo = `INV-{issueYear}-{n padded 3}` where n = count(invoiceNo startsWith prefix) + 1, retried up to 5 times on Prisma P2002. Creates DRAFT, writeAudit INVOICE_CREATE (entityType 'invoice', meta { invoiceNo, amount, gstPct, project: project.name }). Returns { invoice: InvoiceRow }.
7. `src/app/api/invoices/[id]/status/route.ts` — PATCH. guardAuth ADMIN/ACCOUNTANT. params awaited (Promise). Enforces ALLOWED_INVOICE_TRANSITIONS; invalid target/transition → 400 `Only these status changes are allowed here: DRAFT→SENT, DRAFT→VOID, SENT→VOID`. writeAudit INVOICE_STATUS_CHANGE (meta { from, to, invoiceNo }). Returns { invoice }.
8. `src/app/api/payments/route.ts` — GET + POST.
   - GET: guardAuth any. invoiceId? filter; PM scoped via invoice.project.pmId. Order paidAt desc. { items: PaymentRow[] }.
   - POST: guardAuth ADMIN/ACCOUNTANT. Validates amount > 0, method in PAYMENT_METHODS, invoice exists (404), invoice status in SENT/PARTIALLY_PAID (409 'Payments can only be recorded against sent invoices'), amount <= balance + 0.01 (409 `Payment exceeds the outstanding balance of ₹{Math.round(balance)}`). Creates payment, sets invoice to PAID when paidAmount >= totalWithGst - 0.01 else PARTIALLY_PAID. writeAudit PAYMENT_CREATE (entityType 'payment', meta { invoiceNo, amount, method }). Returns { payment, invoice }.

## Verification

- `bunx tsc --noEmit`: zero errors in my files (only pre-existing scaffold errors in examples/ and skills/).
- `bunx eslint` on all 5 route dirs: clean.
- Live smoke tests (all passed):
  - admin dashboard: all sections verified against seed data (8 projects, utilization 38.2%, receivables 9,398,000, 1 overdue).
  - pm dashboard (riya@forgeos.local): 3 own projects, ACTIVE-first ordering, scoped spendByMonth, 6 recent logs, upcoming end dates.
  - wastage: admin sees 16 plan rows across all projects; riya sees only 7 rows on her 3 projects; sort nulls-last verified.
  - audit-logs: pagination (total 64), search, action filter, stats (byAction/byActor/last7Days with zero-fill), PM 403.
  - invoices: list + summary stable under status filter; POST validations (404 project, 400 GST/date-order); created INV-2026-008; PATCH blocked DRAFT→PAID and DRAFT→DRAFT with exact message; DRAFT→SENT OK.
  - payments: partial → PARTIALLY_PAID; over-balance → 409 rupee message; settle → PAID balance 0; payment on PAID → 409; PM scoping; RBAC (viewer 403 on POST/PATCH, 200 on admin dashboard; 401 unauthenticated).
  - Smoke-test data (invoice INV-2026-008, its 2 payments, 4 audit entries) surgically removed afterwards — DB back to 7 invoices with original summary.

## Conventions / deviations (minor judgment calls)

- Audit entityType values: lowercase singular ('invoice', 'payment'), entityId = record id — matches existing 'user' convention in users/auth routes.
- PM dashboard recentLogs ordered by logDate desc (createdAt desc tiebreak) — "latest daily logs" read as most recent site-work dates; response shape unchanged.
- Invoice summary in GET /api/invoices ignores status/projectId query filters (spec: "over the PM-visible (or all) invoices"), while items respect them.
- Unspecified validation messages used: 'Project is required' / 'Invoice is required', 'Amount must be greater than zero', 'A valid issue/due date is required', 'Invalid payment method', 409 'Could not generate a unique invoice number, please retry' (after 5 P2002 retries).
- No rounding applied to computed numbers (frontend format.ts handles display); the only rounded value is the rupee amount inside the over-balance 409 message per spec.
- No shared lib files created; tiny helpers (monthKey, toInvoiceRow, wastage math) duplicated per route file as permitted.

## Notes for other agents

- Invoice numbers are sequential per issue-year: `INV-{YYYY}-{NNN}` (padStart 3).
- Payments auto-transition invoice status: SENT/PARTIALLY_PAID → PARTIALLY_PAID or PAID (epsilon 0.01).
- All list endpoints return { items: [...] } (+ summary for invoices); audit-logs returns Paginated { items, total, page, limit }.
- Auth: Bearer token or forgeos_session cookie (see src/lib/auth.ts). Demo logins in prisma/seed.ts (password ForgeOS2026).
