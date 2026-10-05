# 02. Requirements

Priority key: **V1** = must ship. **S1/S2/S3** = stretch tiers (S1 cheapest, S3 hardest).

---

## 1. Roles

| Role | Description |
|---|---|
| `ADMIN` | The builder or owner. Full control over all projects and users. |
| `PM` | Project manager. Works only on projects assigned to them and enters all site data. |

Rules:
- Accounts are created by Admin. There is **no public sign-up**.
- A project has **at most one** assigned PM. A PM can have many projects.
- Admin can perform every PM action on any project (the record shows who actually did it).

---

## 2. Decisions log

| ID | Decision | Rationale |
|---|---|---|
| D1 | Two roles only (Admin, PM) | Team size and experience; PM is the single data-entry person |
| D2 | One PM per project | Simpler access control. Future: `project_members` table |
| D3 | **Admin records payments** | Admin controls money release. Change to "PM can record" if the team prefers; it affects only role checks |
| D4 | **Money truth = bills.** Labour and machinery entries carry no cost | Prevents double counting (a contractor bill covers labour cost) |
| D5 | **Wastage is progress-adjusted**: compare consumption against `planned × progress%` | A simple "actual > planned" check only fires at project end, which is too late |
| D6 | Stock and bills are never hard-deleted. Stock is voided, bills use status | Financial and audit integrity |
| D7 | JWT Bearer token (8h), no refresh token | Simplicity for a one-month build. Document the trade-off in the report |
| D8 | Integer auto-increment IDs | Easier to debug. Authorisation is enforced by scope checks, not ID secrecy |
| D9 | PM edit window of 48h for logs and stock entries; Admin unrestricted | Data integrity with practical flexibility (`EDIT_WINDOW_HOURS`) |
| D10 | Vendor/contractor logins out of scope | Future scope |

### Open decisions (team must settle in week 1)
- **O1.** Should PMs be allowed to create *materials and vendors*, or only Admin? (Current default: both can create; only Admin can edit/deactivate.)
- **O2.** Are bill attachments required for approval? (Current: optional, S2.)
- **O3.** Default wastage threshold (current: 10%).

---

## 3. Permission matrix

`A` = Admin, `P` = PM on **assigned** projects only, `-` = no access.

| Resource / Action | Admin | PM |
|---|:-:|:-:|
| Login, view own profile, change own password | ✔ | ✔ |
| Create / edit / deactivate users | ✔ | - |
| Create / edit / delete lands | ✔ | - |
| Create / edit projects, assign PM, change status | ✔ | - |
| View projects | all | assigned |
| Create / edit materials and vendors | ✔ | create only |
| Deactivate materials and vendors | ✔ | - |
| Manage material plans (per project) | ✔ | ✔ (P) |
| Create / edit daily logs | ✔ | ✔ (P, 48h window) |
| Delete daily log | ✔ | - |
| Post stock IN / OUT | ✔ | ✔ (P) |
| Void stock transaction | ✔ | ✔ (P, own, 48h window) |
| View stock balances and wastage | ✔ | ✔ (P) |
| Create bill | ✔ | ✔ (P) |
| Edit / delete bill while `PENDING` or `REJECTED` | ✔ | ✔ (P, own) |
| Approve / reject bill | ✔ | - |
| Record payment | ✔ | - |
| View bills and payments | all | assigned |
| Portfolio dashboard | ✔ | - |
| Project dashboard / summary | ✔ | ✔ (P) |
| View audit log | ✔ | - |
| Notifications (S2), attachments (S2), exports (S1) | ✔ | ✔ (P) |

---

## 4. Functional requirements

### 4.1 Authentication and users (V1)

| ID | Requirement | Acceptance criteria |
|---|---|---|
| AUTH-1 | Email + password login | Valid credentials return a JWT and user profile. Invalid returns 401 with a generic message. Inactive users cannot log in |
| AUTH-2 | Session identity | `GET /auth/me` returns the current user. Expired or invalid token returns 401 and the UI redirects to login |
| AUTH-3 | Change own password | Requires current password. New password ≥ 8 chars with a letter and a digit |
| AUTH-4 | Role guard | Admin-only endpoints return 403 for PM. UI hides unavailable navigation |
| USR-1 | Admin creates users | Email unique (case-insensitive). Role `PM` or `ADMIN`. Temp password set by Admin |
| USR-2 | Admin edits / deactivates users | Cannot deactivate a PM who still has `ACTIVE` projects (must reassign first). Cannot deactivate self |
| USR-3 | Admin resets a user's password | Old sessions remain valid until token expiry (documented limitation) |

### 4.2 Lands and projects (V1)

| ID | Requirement | Acceptance criteria |
|---|---|---|
| LND-1 | CRUD lands | Fields per `04-database-design.md`. Delete blocked if any project exists |
| PRJ-1 | Create project linked to land | Unique project `code`. Budget ≥ 0. Default status `PLANNING` |
| PRJ-2 | Assign / reassign PM | Only active users with role `PM`. Reassignment is audit-logged |
| PRJ-3 | Status lifecycle | `PLANNING→ACTIVE→ON_HOLD↔ACTIVE→COMPLETED`. `COMPLETED` is read-only for PM and sets `actualEndDate` |
| PRJ-4 | Project list with filters | Admin sees all, PM only assigned. Filter by status, land, PM, text search. Paginated |
| PRJ-5 | Project detail with summary | Progress %, budget, committed, paid, pending, stock alerts, wastage alerts, last log date |

### 4.3 Masters (V1)

| ID | Requirement | Acceptance criteria |
|---|---|---|
| MST-1 | Materials master | Unique name (case-insensitive), category, unit from fixed list. Deactivate rather than delete |
| MST-2 | Vendors master | Unique name; optional GSTIN (validated format, unique); phone and email optional |
| MST-3 | Material plan per project | One row per (project, material). Planned qty > 0; optional planned rate, low-stock threshold, wastage threshold override |

### 4.4 Daily site log (V1)

| ID | Requirement | Acceptance criteria |
|---|---|---|
| LOG-1 | Create log | One per project per date. Date not in the future. Project must be `ACTIVE` |
| LOG-2 | Progress % | 0-100, cumulative, not lower than the previous log date's value |
| LOG-3 | Labour entries | 0-N rows: trade, contractor name (optional), head count > 0, hours |
| LOG-4 | Machinery entries | 0-N rows: machine name, operator (optional), hours ≥ 0, fuel litres (optional) |
| LOG-5 | Edit window | PM can edit within 48h of creation. Admin anytime. Edits are audit-logged with old/new values |
| LOG-6 | List and detail | Reverse-chronological list with date range filter; detail shows labour, machinery, linked stock transactions |

### 4.5 Stock (V1)

| ID | Requirement | Acceptance criteria |
|---|---|---|
| STK-1 | Stock IN | Material, quantity > 0, date, optional vendor, challan no., rate, linked bill |
| STK-2 | Stock OUT | Quantity > 0, reason (`USED`/`DAMAGED`/`LOST`). **Rejected with 422 if it exceeds the current balance** (race-safe) |
| STK-3 | Balances view | Per material: total in, total out, balance, planned qty, low-stock flag |
| STK-4 | Ledger | Filter by material, type, date range; voided rows shown struck through when requested |
| STK-5 | Void | Requires reason. Voiding an IN must not make the balance negative. Never deletes the row |
| STK-6 | Date rules | Not in the future |

### 4.4b Wastage (V1)

| ID | Requirement | Acceptance criteria |
|---|---|---|
| WST-1 | Per-material wastage status | Shows planned, expected-to-date, consumed, overrun qty/%, recorded wastage (damaged/lost), estimated loss in ₹ (if planned rate set), and status `OK` / `OVERRUN` / `NO_BASELINE` |
| WST-2 | Portfolio overview (Admin) | Top overruns across projects, sorted by estimated loss then overrun % |
| WST-3 | Configurable threshold | Project default (10%), per-material override |

### 4.6 Billing (V1)

| ID | Requirement | Acceptance criteria |
|---|---|---|
| BIL-1 | Create bill | Project, vendor, bill number (unique per vendor), bill date, optional due date (≥ bill date), category, base amount, GST %. Server computes GST and total. Starts `PENDING` |
| BIL-2 | Edit / delete | Only while `PENDING` or `REJECTED`. Editing a `REJECTED` bill returns it to `PENDING`. Delete only if `PENDING` with no payments |
| BIL-3 | Approve / reject | Admin only. Reject requires a reason. Approver and time recorded |
| BIL-4 | Record payment | Admin only, bill must be `APPROVED` or `PARTIALLY_PAID`. Amount > 0 and ≤ outstanding. Status auto-moves to `PARTIALLY_PAID` or `PAID` |
| BIL-5 | Bill list | Filters: project, vendor, status, category, overdue, date range, text. Totals row for the filtered set |
| BIL-6 | Overdue | `dueDate < today` and status in (`APPROVED`, `PARTIALLY_PAID`) |
| BIL-7 | Link to deliveries | A stock IN can reference a bill; bill detail lists linked deliveries |

### 4.7 Dashboards and reports (V1)

| ID | Requirement | Acceptance criteria |
|---|---|---|
| DSH-1 | Admin dashboard | Project counts by status; total budget / committed / paid / outstanding; pending approvals; overdue bills; top wastage alerts; per-project cards; spend-by-project chart |
| DSH-2 | PM dashboard | Assigned projects with progress, last log date, low-stock items, wastage alerts, own pending/rejected bills |
| DSH-3 | Project summary tab | Spend vs. budget, progress timeline (from logs), stock table, bills summary |

### 4.8 Audit (V1)

| ID | Requirement | Acceptance criteria |
|---|---|---|
| AUD-1 | Audit every mutation | Who, what, which entity, old and new values (JSON), when |
| AUD-2 | Admin audit viewer | Filter by entity, user, action, date range. Read-only |

### 4.9 Stretch features

| ID | Tier | Requirement | Acceptance criteria |
|---|---|---|---|
| UI-1 | S1 | Mobile-friendly | All PM-facing pages usable at 360px width; no horizontal page scroll |
| EXP-1 | S1 | Export Excel/PDF | Bills, stock ledger, wastage, project summary exportable with current filters |
| BUD-1 | S1 | Budget vs. actual alerts | Warning at ≥ 80% of budget committed, critical at ≥ 100% |
| NOT-1 | S2 | In-app notifications | Low stock, wastage overrun, bill due soon/overdue, budget alerts, bill submitted/approved/rejected; bell with unread count; mark read |
| ATT-1 | S2 | Attachments | Upload image/PDF (≤ 5 MB) to a daily log or bill; download; delete by uploader or Admin |
| OFF-1 | S3 | Draft saving | Daily log form autosaves to browser storage and restores after refresh (true offline sync is future scope) |

---

## 5. Non-functional requirements

| Area | Requirement |
|---|---|
| Security | Passwords hashed (bcrypt); JWT secret from env; `helmet`, CORS allow-list, rate limit on login (e.g., 10/min/IP); parameterised queries only; server-side authorisation on every route |
| Performance | List endpoints paginated; dashboards respond in < 1.5 s on seed-size data; indexes per `04-database-design.md` |
| Usability | Mobile-first responsive layouts; loading, empty, and error states on every data view; forms preserve input on validation failure |
| Reliability | All multi-table writes transactional; stock never negative; consistent error format |
| Maintainability | TypeScript strict mode; lint and typecheck in CI; docs updated with schema/API changes |
| Observability | Structured request logging (pino); error logging with request ID |
| Portability | One-command local setup (Docker Compose for DB); `.env.example` committed |
| Localisation | INR with `en-IN` formatting; dates `DD MMM YYYY` in UI |

---

## 6. Out of scope (Version 1)

Accounting/tax filing, drawings/BIM, sales/booking, payment gateway, AI/ML, vendor/contractor/operator logins, multiple companies, email/SMS notifications, refresh tokens/SSO, true offline sync.

## 7. Future scope (roadmap for the report)

Vendor and contractor portals, multiple PMs per project, category-level budgets, email/WhatsApp alerts, true offline-first PWA, purchase orders and GRN matching, material rate benchmarking, predictive wastage detection, multi-tenant SaaS.
