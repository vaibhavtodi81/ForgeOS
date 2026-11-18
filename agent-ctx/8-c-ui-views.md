# Task 8-c — Billing, Users, Materials, Lands, Suppliers, Profile Views (UI agent)

## Scope
Created exactly 6 client view components for ForgeOS inside `src/components/forgeos/views/`.
No other files were created or modified. All data access goes through the shared API contract
(`src/lib/forgeos-types.ts`, `src/lib/client-api.ts`) so the parallel backend agent's routes
drop in without changes.

## Files created
1. `src/components/forgeos/views/billing-view.tsx` — `export default function BillingView({ user })`
   - `GET /api/invoices` with `withParams({ status, projectId })` → `InvoiceListResponse`; filter Selects for status (`all` + `INVOICE_STATUSES`) and project (`all` + `meta.projects` from `GET /api/meta`).
   - 4 StatCards from `summary`: Invoiced (ReceiptIndianRupee), Collected (success), Receivables (danger when > 0), Overdue (danger).
   - Table columns: Invoice (mono), Project, Amount, GST (`formatPct(gstPct, 0)`), Total incl. GST, Paid, Balance (red when > 0), Status (`StatusBadge` + `INVOICE_STATUS_LABELS`), Dates (issue → due; due red when balance > 0 and past due), Actions.
   - Actions DropdownMenu (always rendered; items role-gated): Send (isFinance && DRAFT, AlertDialog confirm `Send invoice {no} to the client?` → `PATCH /api/invoices/:id/status { status: 'SENT' }`), Void (isFinance && DRAFT|SENT, destructive item, AlertDialog `Void invoice {no}?` → `{ status: 'VOID' }`), Payments (always).
   - Payments dialog: `GET /api/payments?invoiceId=` list (amount / method label / paidAt / mono reference), header shows invoiceNo + balance (derived fresh from the invoices query after invalidation, so balance/status update live after recording a payment). Record-payment form visible for isFinance && SENT|PARTIALLY_PAID: amount (> 0, <= balance inline check), method Select, optional reference, date (default today) → `POST /api/payments`.
   - New invoice dialog: project Select (required), amount > 0, GST Select (`GST_OPTIONS`), issue date (default today), due date (default +30 days, must be > issue date) → `POST /api/invoices` → toast `Invoice {no} created as draft`. Form resets on close (fresh "today" defaults each open).
2. `src/components/forgeos/views/users-view.tsx` — `export default function UsersView({ user })`
   - `GET /api/users` → `{ items: UserRow[] }`; Invite User dialog (`POST /api/users { name, email, role, password }`, password min 8 with helper text, toast `User invited`).
   - Table: User (Avatar initials + name + email), Role (inline Select over `ROLES`/`ROLE_LABELS`, `PATCH /api/users/:id { role }`, toast `Role updated`, disabled + title `You cannot modify your own account` on self row), Status (Active emerald / Inactive red Badge via `BADGE_CLASSES.ACTIVE`/`VOID`, plus `{n} active projects` under PM rows), Active Projects, Created, Actions (ghost Activate / Deactivate with AlertDialog `Deactivate {name}?` — description `They can no longer sign in. Managers with active projects cannot be deactivated.` → `PATCH /api/users/:id { isActive }`). Self row: both controls disabled with the same title.
3. `src/components/forgeos/views/materials-view.tsx` — `export default function MaterialsView({ user })`
   - `GET /api/materials`; client-side search (name/category, `useMemo`). Table: Material (name + category muted), Unit, Last Rate (`formatMoney` or `—`), Status (`Switch` checked=isActive, disabled for non-admins; admin toggle → direct `PATCH /api/materials/:id { isActive }` with toast; inactive rows also show red `Inactive` Badge). No Actions column.
   - Add Material dialog (admin only trigger): Name, Unit, Category → `POST /api/materials` → toast `Material added`.
4. `src/components/forgeos/views/lands-view.tsx` — `export default function LandsView({ user })`
   - `GET /api/lands`; Table: Land (name + location muted), Area (`{formatQty} sq ft` or `—`), Khasra/Survey No. (mono or `—`), Projects count.
   - Add Land dialog (admin): Name, Location (required), Area sq ft (optional number), Khasra (optional) → `POST /api/lands` (nulls for empties) → toast `Land added`.
5. `src/components/forgeos/views/suppliers-view.tsx` — `export default function SuppliersView({ user })`
   - `GET /api/suppliers`; Table: Supplier, Phone (tabular-nums), Email (`—`), Address (muted, truncate), Supply Txns count.
   - Add Supplier dialog (admin): Name, Phone (required), Email optional, Address optional Textarea → `POST /api/suppliers` → toast `Supplier added`.
6. `src/components/forgeos/views/profile-view.tsx` — `export default function ProfileView({ user })`
   - Two-column layout `grid-cols-1 lg:grid-cols-3`. Left: `Account` SectionCard (centered h-16 w-16 Avatar initials, name, email, `ROLE_LABELS[role]` StatusBadge, note `Password, email OTP and Google sign-in are supported`) + `Session` SectionCard (`Signed in as {email}` + role description). Right: `Change password` SectionCard — Current / New (min 8, helper `At least 8 characters`) / Confirm (live inline mismatch check) → `POST /api/auth/change-password` → toast `Password updated` + fields reset; 401 renders inline `Current password is incorrect`, 400 renders the server message inline, other errors go through the standard toast. No sign-out button (lives in topbar).
   - Added a `PageHeader title="Profile"` above the grid for consistency with the other views.

## Conventions followed
- Every file starts with `'use client'`; TanStack Query v5 object syntax; all label/enum data from `forgeos-types` (no hardcoded business data).
- Mutations: `useMutation` + sonner `toast.success(...)` + `queryClient.invalidateQueries()` (no args); errors: `toast.error(err instanceof ApiError ? err.message : 'Something went wrong')`.
- Forms: controlled `useState` inside dialogs; manual validation with `text-sm text-red-600 dark:text-red-400` inline errors; submit disabled while `isPending`; numbers use `parseFloat` + `isNaN` guards; dates are `<Input type="date">` 'YYYY-MM-DD' via `toDateInputValue`.
- Selects always have non-empty values and `SelectValue` placeholders; `'all'` sentinel for filters (skipped by `withParams`).
- Tables wrapped in `overflow-x-auto rounded-md border`; dialogs `sm:max-w-[480px]`; numeric cells `tabular-nums` and right-aligned; lucide icons only, no emojis; `@/` imports; no comments beyond small section dividers.

## Verification
- `bunx tsc --noEmit`: zero errors in these 6 files (only pre-existing unrelated errors remain in `examples/` and `skills/`).
- `bunx eslint <the 6 files>`: clean (exit 0).
- No servers started, no build/db commands run, no test code written.

## Notes / minor deviations
- GST column uses `formatPct(gstPct, 0)` exactly as instructed — note the shared helper prefixes positive values with `+`, so 18% renders as `+18%` (0% renders as `0%`).
- Added tasteful bits beyond the letter of the spec: `(you)` marker on the self row in Users, `Overdue`/`Receivables` icons (Wallet/AlertTriangle — spec only mandated ReceiptIndianRupee for Invoiced), Search icon in the materials search input, and a `PageHeader` on Profile.
- Create/invite dialogs reset their fields on close so defaults ("today", "+30 days") are recomputed at every open.
