# 06. Frontend Guide

React + TypeScript + Vite SPA. Mobile-first (PMs work on phones at site), polished on desktop (Admin works at a desk).

---

## 1. Stack

| Concern | Library |
|---|---|
| Build / dev | Vite, TypeScript (strict) |
| Routing | React Router (data router or classic, pick one and stay consistent) |
| Server state | TanStack Query |
| Forms | React Hook Form + `@hookform/resolvers/zod` + Zod |
| UI | Tailwind CSS + shadcn/ui (copied into `components/ui`) |
| Tables | shadcn `Table` (+ TanStack Table only if sorting/column control is needed) |
| Charts | Recharts |
| Icons / toasts | lucide-react / sonner |
| HTTP | Axios instance with interceptors |
| Dates / money | `date-fns`; `Intl.NumberFormat('en-IN')` |
| Tests | Vitest + Testing Library (+ MSW for mocking the API) |

Follow each library's current official setup guide (Tailwind and shadcn setup steps change between versions).

---

## 2. Folder structure

```
client/
├── index.html
├── vite.config.ts
├── .env.example
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── routes/
    │   ├── index.tsx              # route table
    │   ├── ProtectedRoute.tsx     # requires auth
    │   └── RoleRoute.tsx          # requires role
    ├── lib/
    │   ├── api-client.ts          # axios instance, interceptors, ApiError
    │   ├── query-client.ts
    │   ├── format.ts              # formatINR, formatDate, formatQty
    │   ├── constants.ts           # UNITS, enums, status colours, labels
    │   └── utils.ts               # cn() etc.
    ├── auth/
    │   ├── AuthContext.tsx        # user, token, login(), logout()
    │   └── useAuth.ts
    ├── components/
    │   ├── ui/                    # shadcn primitives
    │   ├── layout/                # AppShell, Sidebar, Topbar, MobileNav, PageHeader
    │   └── common/                # DataTable, StatCard, StatusBadge, MoneyText, DateText,
    │                              # ConfirmDialog, EmptyState, ErrorState, LoadingState,
    │                              # FormField, ProjectSelect, ProgressBar, Pagination
    ├── features/                  # ONE FOLDER PER BACKEND MODULE
    │   ├── auth/        (LoginPage)
    │   ├── users/       (api.ts, hooks.ts, types.ts, schemas.ts, components/, pages/)
    │   ├── lands/
    │   ├── projects/
    │   ├── materials/
    │   ├── vendors/
    │   ├── material-plans/
    │   ├── daily-logs/
    │   ├── stock/
    │   ├── wastage/
    │   ├── bills/
    │   ├── dashboard/
    │   ├── audit/
    │   └── reports/ notifications/ attachments/   # stretch
    └── types/
        └── api.ts                 # ApiResponse<T>, Paginated<T>, ApiError
```

Feature folder shape:
```
features/bills/
├── api.ts          # typed functions, one per endpoint
├── hooks.ts        # useBills, useBill, useCreateBill, useApproveBill … (TanStack Query)
├── schemas.ts      # Zod form schemas
├── types.ts        # Bill, BillStatus …
├── components/     # BillForm, BillTable, BillStatusBadge, PaymentDialog …
└── pages/          # BillsListPage, BillDetailPage, BillCreatePage
```

---

## 3. Routes and navigation

| Path | Page | Roles | Notes |
|---|---|---|---|
| `/login` | LoginPage | Public | Redirect to `/dashboard` if already logged in |
| `/dashboard` | AdminDashboard / PmDashboard | A,P | Renders by role |
| `/projects` | ProjectsListPage | A,P | PM sees only assigned |
| `/projects/new` | ProjectFormPage | A | |
| `/projects/:id` | ProjectDetailPage | A,P | Tabs below |
| `/projects/:id/edit` | ProjectFormPage | A | |
| `/projects/:id/logs/new` | DailyLogFormPage | A,P | |
| `/projects/:id/logs/:logId` | DailyLogDetailPage | A,P | Edit button within window |
| `/projects/:id/logs/:logId/edit` | DailyLogFormPage | A,P | |
| `/lands` | LandsListPage | A | |
| `/lands/new`, `/lands/:id`, `/lands/:id/edit` | Land pages | A | |
| `/materials` | MaterialsPage | A,P | Inline create dialog |
| `/vendors` | VendorsPage | A,P | Inline create dialog |
| `/bills` | BillsListPage | A,P | Filters + totals |
| `/bills/new` | BillFormPage | A,P | `?projectId=` prefill |
| `/bills/:id` | BillDetailPage | A,P | Approve/Reject/Payment for Admin |
| `/users` | UsersPage | A | |
| `/audit` | AuditLogPage | A | |
| `/reports` | ReportsPage | A,P | S1 |
| `/notifications` | NotificationsPage | A,P | S2 |
| `/profile` | ProfilePage | A,P | Change password |
| `*` | NotFoundPage | any | |

**Project detail tabs** (`/projects/:id?tab=…`): `overview` (summary cards, progress chart, budget bar), `logs`, `stock` (balances + ledger + add transaction), `wastage`, `plan` (material plans), `bills`, `activity` (Admin: audit log filtered to this project).

**Sidebar:** Admin: Dashboard, Projects, Lands, Bills, Materials, Vendors, Users, Audit Log, (Reports). PM: Dashboard, Projects, Bills, Materials, Vendors, (Reports). On mobile, use a bottom nav with the 4-5 most-used items (Dashboard, Projects, Bills, More).

---

## 4. Auth flow

- `AuthContext` holds `{ user, token, status: 'loading'|'authenticated'|'anonymous' }`.
- On boot: read token from `localStorage` → set Axios header → call `GET /auth/me`. Success → authenticated; failure → clear token.
- `ProtectedRoute` shows a spinner while loading, redirects to `/login?next=<path>` when anonymous.
- `RoleRoute roles={['ADMIN']}` renders a "Not allowed" page for the wrong role (backend still enforces).
- Axios response interceptor: on `401` → clear token, `queryClient.clear()`, navigate to `/login`.
- Logout: clear token and the query cache.

---

## 5. Page specifications

### 5.1 Login
Fields: email, password. On success navigate to `next` or `/dashboard`. Show server error message inline. Disable the button while submitting.

### 5.2 Admin dashboard (`GET /dashboard/admin`)
- **Row 1, stat cards:** Active projects, Total budget, Committed spend, Outstanding payable.
- **Row 2, attention cards:** Pending approvals (count + ₹, click → `/bills?status=PENDING`), Overdue bills (click → `/bills?overdue=true`).
- **Row 3, charts:** Bar chart "Committed vs paid by project" (Recharts); donut or bar for projects by status.
- **Row 4, wastage alerts table:** project, material, overrun %, estimated loss; row click → project wastage tab.
- **Row 5, project cards/table:** name, PM, status badge, progress bar, budget used %, last log date, alert count.

### 5.3 PM dashboard (`GET /dashboard/pm`)
- Project cards with progress and a prominent **"Add today's log"** button (highlight if `logDueToday`).
- Low-stock list; wastage alerts; **Rejected bills needing action** (with reason and an Edit button).

### 5.4 Projects list
Table (cards on mobile): code, name, land/city, status, PM, progress. Filters: status, land, PM (Admin), search. "New project" button for Admin.

### 5.5 Project form (Admin)
Fields: land (select), code, name, description, start date, expected end date, total budget (₹), wastage threshold %, assigned PM (select of active PMs). Validation: code required/unique (server), budget ≥ 0, end ≥ start.

### 5.6 Project detail

| Tab | Content / actions |
|---|---|
| Overview | Status badge + (Admin) status change dropdown; budget bar (committed/paid/pending/remaining) with warning colours; progress chart from daily logs; quick links |
| Daily logs | Reverse-chronological list; "New log" button; row → detail |
| Stock | Balances table (low-stock row highlighted), "Stock IN" and "Stock OUT" buttons opening dialogs; ledger table with filters; void action with reason dialog |
| Wastage | Table per material: planned, expected-to-date, consumed, overrun %, loss ₹, status badge; explanation tooltip of the formula |
| Plan | Editable table of material plans (add row dialog, inline edit, delete) |
| Bills | Project-filtered bills list + "New bill" |
| Activity | Admin only: audit trail |

### 5.7 Daily log form
Sections: **Basics** (date defaults to today, progress % slider+number with the previous value shown, summary, weather, issues) → **Labour** (repeatable rows: trade select/custom, contractor, head count, hours) → **Machinery** (repeatable rows) → **Submit**. Use `useFieldArray`. Show a running total of head count and hours. Optional S3: autosave draft to `localStorage` (`draft:log:<projectId>:<date>`), restore on load, clear on submit.

### 5.8 Stock transaction dialog
Mode toggle IN/OUT. IN: material, quantity, date, vendor (optional), challan no., unit rate, link bill (optional, select from the project's bills). OUT: material, quantity (show **available balance**), reason, date. Map `INSUFFICIENT_STOCK` to an inline error on the quantity field using `details.available`.

### 5.9 Bills list
Filter bar: project, vendor, status (multi-select chips), category, overdue toggle, date range, search. Table: bill no., vendor, project, bill date, due date (red if overdue), total, paid, outstanding, status badge. Footer totals from `meta.totals`.

### 5.10 Bill form
Fields: project, vendor (with "add vendor" quick dialog), bill number, dates, category, description, base amount, GST % (select: 0, 5, 12, 18, 28). **Live preview** of GST and total (display only; server recomputes). Show server `409` as "This vendor already has a bill with this number".

### 5.11 Bill detail
Header (number, status badge, vendor, project), amounts breakdown, payments table, rejection reason banner (if rejected), linked deliveries, (S2) attachments. **Admin actions** by status: PENDING → Approve / Reject (reason dialog); APPROVED or PARTIALLY_PAID → Record payment dialog (amount defaults to outstanding). **PM actions:** Edit / Delete when allowed.

### 5.12 Users, Lands, Materials, Vendors
Standard list + dialog/form CRUD. Use a "Deactivate" toggle rather than delete. Show server business-rule messages in a toast.

### 5.13 Audit log
Filter bar + table: time, user, action badge, entity, id. Row expand shows old/new JSON as a simple key-by-key diff.

---

## 6. Shared components (build these first, in week 1)

| Component | Behaviour |
|---|---|
| `AppShell` | Sidebar (desktop), top bar with user menu, bottom nav (mobile), content container |
| `PageHeader` | Title, breadcrumb, action buttons slot |
| `DataTable<T>` | Columns config, loading skeleton, empty state, pagination footer, responsive (card list on mobile) |
| `StatCard` | Label, value, optional delta/hint, icon, optional link |
| `StatusBadge` | Maps any enum to colour and label (see §8) |
| `MoneyText` | `formatINR(value)`, tabular numbers, right-aligned |
| `DateText` | `DD MMM YYYY` |
| `ConfirmDialog` | Title, message, confirm/cancel, optional required "reason" textarea |
| `FormField` | Label + control + error message wrapper (RHF-aware) |
| `EmptyState` / `ErrorState` / `LoadingState` | Consistent states with retry |
| `ProjectSelect`, `MaterialSelect`, `VendorSelect` | Searchable selects backed by query hooks |
| `ProgressBar` | Percent with colour thresholds |

---

## 7. Data fetching patterns

**API function**
```ts
// features/bills/api.ts
export const billsApi = {
  list: (params: BillListParams) => api.get<Paginated<Bill>>('/bills', { params }),
  create: (body: BillCreateInput) => api.post<Bill>('/bills', body),
  approve: (id: number) => api.post<Bill>(`/bills/${id}/approve`),
};
```

**Query hooks**
```ts
export const useBills = (params: BillListParams) =>
  useQuery({ queryKey: ['bills', params], queryFn: () => billsApi.list(params), placeholderData: keepPreviousData });

export const useApproveBill = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: billsApi.approve,
    onSuccess: (bill) => {
      qc.invalidateQueries({ queryKey: ['bills'] });
      qc.invalidateQueries({ queryKey: ['projects', bill.projectId, 'summary'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Bill approved');
    },
  });
};
```

**Invalidation map**

| After mutation | Invalidate |
|---|---|
| Create/edit/delete bill, approve/reject, payment | `bills`, `['projects', id, 'summary']`, `dashboard` |
| Create/edit log | `['daily-logs', projectId]`, `['projects', projectId, 'summary']`, `['wastage', projectId]`, `dashboard` |
| Post/void stock | `['stock', projectId]`, `['wastage', projectId]`, `['projects', projectId, 'summary']`, `dashboard` |
| Material plan change | `['plans', projectId]`, `['wastage', projectId]`, `['stock', projectId, 'balances']` |
| Project edit/status/assign | `projects`, `dashboard` |

**Rules:** no `fetch`/Axios in components; every data view handles `isLoading`, `isError` (with retry), and empty; mutation buttons show a pending state; errors surface via toast (global handler) and field errors via `setError` when `error.code === 'VALIDATION_ERROR'`.

---

## 8. UI standards

**Design tokens (suggested):** primary amber/orange (`#F59E0B` family) for a construction feel, slate neutrals, rounded-lg cards, subtle shadows. Define as CSS variables (shadcn theme) so the palette can be changed in one place. Support light mode first; dark mode optional.

**Status colours**

| Enum value | Colour |
|---|---|
| Project `PLANNING` / `ACTIVE` / `ON_HOLD` / `COMPLETED` | slate / green / amber / blue |
| Bill `PENDING` / `APPROVED` / `REJECTED` / `PARTIALLY_PAID` / `PAID` | amber / blue / red / violet / green |
| Wastage `OK` / `OVERRUN` / `NO_BASELINE` | green / red / gray |
| Budget alert `NONE` / `WARNING` / `CRITICAL` | green / amber / red |

**Formatting**
```ts
formatINR(1250000)   // "₹12,50,000.00" via Intl.NumberFormat('en-IN', {style:'currency', currency:'INR'})
formatQty(1234.5, 'BAG') // "1,234.5 bag"
formatDate('2026-10-04') // "04 Oct 2026"
```

**Responsive rules**
- Design at 360px first. Tables collapse to stacked cards below `md`.
- Touch targets ≥ 44px; numeric inputs use `inputMode="decimal"`.
- No page-level horizontal scroll; wide tables scroll inside their container.

**UX rules**
- Destructive or irreversible actions (reject, void, delete) use `ConfirmDialog`.
- Preserve form input on validation errors.
- Show the user's role and name in the top bar.
- Consistent wording: "Bill", "Vendor", "Project Manager", "Daily Log", "Stock In/Out".

**Accessibility:** labelled inputs, visible focus, colour never the only signal (badges carry text), dialogs trap focus (shadcn handles this).

---

## 9. Frontend definition of done (per page)
- [ ] Matches the API contract (`05`) and the page spec above
- [ ] Loading, empty, error states implemented
- [ ] Works at 360px and 1280px
- [ ] Form validation (Zod) with clear messages
- [ ] Role visibility correct (and verified by logging in as each role)
- [ ] Query invalidation per §7
- [ ] No `any`, lint and typecheck pass
