# 07. Business Rules

The exact rules services must enforce. Each rule has an ID so tests, PRs, and AI prompts can reference it (e.g., "implement STK-R3").

---

## 0. Shared constants (`server/src/lib/constants.ts`, mirrored in `client/src/lib/constants.ts`)

```ts
export const UNITS = ['BAG','KG','TONNE','CFT','CUM','NOS','LITRE','SQFT','SQM','RMT','BUNDLE','TRIP'] as const;
export const GST_RATES = [0, 5, 12, 18, 28] as const;
export const DEFAULT_WASTAGE_THRESHOLD_PCT = 10;
export const BUDGET_WARNING_PCT = 80;
export const BUDGET_CRITICAL_PCT = 100;
export const DUE_SOON_DAYS = 3;                 // notifications (S2)
export const EDIT_WINDOW_HOURS = 48;            // overridable via env
export const LABOUR_TRADES = ['Mason','Helper','Carpenter','Bar Bender','Electrician','Plumber','Painter','Tiler','Other'];
```

Formatting: INR with `en-IN` grouping; dates stored as ISO, displayed `DD MMM YYYY`.

---

## 1. Stock

| ID | Rule |
|---|---|
| STK-R1 | `balance(project, material) = Σ quantity of IN − Σ quantity of OUT`, **excluding voided rows** |
| STK-R2 | An OUT may not exceed the current balance. Violation → `422 INSUFFICIENT_STOCK` with `{available, requested}` |
| STK-R3 | The balance check and insert happen in **one transaction holding `pg_advisory_xact_lock(projectId, materialId)`** |
| STK-R4 | A material must have a plan row in the project before stock can be posted for it |
| STK-R5 | Transactions are immutable. Corrections are done by **void** (reason required) plus a new transaction |
| STK-R6 | Voiding an IN must not make the balance negative. Voiding an OUT is always allowed |
| STK-R7 | PM can void only their own transactions within the edit window. Admin can void any |
| STK-R8 | `txnDate` cannot be in the future. Project must be `ACTIVE` to post |
| STK-R9 | IN-only fields: `vendorId`, `billId`, `unitRate`. OUT-only field: `outReason` (`USED`/`DAMAGED`/`LOST`) |
| STK-R10 | If `billId` is given on IN, the bill must belong to the same project |
| STK-R11 | Low stock: `balance ≤ lowStockThreshold` (only when threshold is set) |

---

## 2. Wastage (progress-adjusted)

**Why:** comparing total consumption with the whole-project plan only reveals waste at the end. Comparing against what the *current progress* justifies exposes it while the project is running.

For each plan row (project, material):

```
progress          = progressPercent of the latest daily log by date (0 if none)
expectedQty       = plannedQuantity × progress / 100
consumedQty       = Σ OUT quantity (all reasons, non-voided)
recordedWastage   = Σ OUT quantity where reason ∈ {DAMAGED, LOST}
overrunQty        = max(0, consumedQty − expectedQty)
overrunPct        = expectedQty > 0 ? overrunQty / expectedQty × 100 : null
thresholdPct      = plan.wastageThresholdPct ?? project.wastageThresholdPct (default 10)
estimatedLoss ₹   = overrunQty × plannedUnitRate   (null if no rate)
```

| Status | Condition |
|---|---|
| `NO_BASELINE` | `expectedQty = 0` **and** `consumedQty > 0` (usage with no logged progress) |
| `OVERRUN` | `overrunPct > thresholdPct` |
| `OK` | otherwise |

| ID | Rule |
|---|---|
| WST-R1 | Compute on read from the view `v_wastage_status` plus the TS step above. Do not persist results |
| WST-R2 | Round quantities to 3 decimals, percentages to 2, money to 2 |
| WST-R3 | A material with no consumption is `OK` with zeros |
| WST-R4 | Sorting: `OVERRUN` first, then `NO_BASELINE`, then `OK`; within a group by `estimatedLoss` desc, then `overrunPct` desc |
| WST-R5 | Wastage alerts (dashboard, notifications) include only `OVERRUN` and `NO_BASELINE` |

**Worked example:** planned cement 12,000 bags, progress 42.5% → expected 5,100. Consumed 6,400 → overrun 1,300 = 25.49% > 10% → `OVERRUN`. At ₹395/bag, estimated loss ₹5,13,500.

**Limitation to state in the report:** progress is a single overall % (not per material or stage), so materials used in front-loaded phases (e.g., steel and cement in structure) may show false overruns early. The threshold and per-material override exist to manage this. Future: stage-wise material plans.

---

## 3. Daily logs

| ID | Rule |
|---|---|
| LOG-R1 | One log per (project, date). Duplicate → `409` |
| LOG-R2 | `logDate` ≤ today. Project must be `ACTIVE` to create |
| LOG-R3 | `0 ≤ progressPercent ≤ 100` and **monotonic**: ≥ the previous log's value (by date) and ≤ the next log's value if one exists |
| LOG-R4 | Labour: `headCount > 0`, `0 ≤ hoursWorked ≤ 24`. Machinery: `0 ≤ hoursUsed ≤ 24` |
| LOG-R5 | PM edit window: `now − createdAt ≤ EDIT_WINDOW_HOURS`. Admin unrestricted. Outside window → `422` |
| LOG-R6 | On PATCH, provided child arrays **replace** the old sets (delete and insert in one transaction) |
| LOG-R7 | Labour and machinery rows carry **no cost** (see MON-R1) |
| LOG-R8 | Deleting a log (Admin) cascades labour/machinery; linked stock transactions keep existing with `dailyLogId = NULL` |

---

## 4. Billing

### 4.1 Amounts

| ID | Rule |
|---|---|
| BIL-R1 | `gstAmount = round(baseAmount × gstPercent / 100, 2)`; `totalAmount = baseAmount + gstAmount`. Computed **server-side only**; also enforced by a DB CHECK |
| BIL-R2 | `gstPercent` ∈ `GST_RATES` |
| BIL-R3 | `baseAmount ≥ 0` (a zero bill is allowed only if the team decides; default: require `> 0` in Zod) |
| BIL-R4 | `(vendorId, billNumber)` unique. Compare `billNumber` trimmed |
| BIL-R5 | `dueDate ≥ billDate` if present |

### 4.2 Lifecycle

| From | To | Who | Condition |
|---|---|---|---|
| (new) | `PENDING` | A, P | Project not `COMPLETED`; PM assigned to project |
| `PENDING` | `APPROVED` | A | Records `approvedById`, `approvedAt` |
| `PENDING` | `REJECTED` | A | `rejectionReason` required (≥ 5 chars) |
| `REJECTED` | `PENDING` | A, P (own) | Via edit; clears `rejectionReason` (old reason remains in audit log) |
| `APPROVED`/`PARTIALLY_PAID` | `PARTIALLY_PAID` | A | Payment < outstanding |
| `APPROVED`/`PARTIALLY_PAID` | `PAID` | A | Payment = outstanding |

| ID | Rule |
|---|---|
| BIL-R6 | Edit allowed only in `PENDING` or `REJECTED`. PM only for bills they submitted |
| BIL-R7 | Delete allowed only in `PENDING` with no payments (hard delete; audit row kept) |
| BIL-R8 | Approved/paid bills are immutable except by recording payments |
| BIL-R9 | Payment: `0 < amount ≤ outstanding`; `outstanding = totalAmount − Σ payments`. Done in one transaction that inserts the payment, recomputes status, and writes audit |
| BIL-R10 | Overdue: `dueDate < today` and status ∈ (`APPROVED`, `PARTIALLY_PAID`) |
| BIL-R11 | `paymentDate` ≤ today and ≥ `billDate` |
| BIL-R12 | Admin-created bills still start `PENDING` (Admin approves them explicitly; no auto-approval) |

---

## 5. Money and budget

| ID | Rule |
|---|---|
| MON-R1 | **Spend is derived only from bills.** Labour/machinery entries and stock `unitRate` are operational data and never added to spend (prevents double counting) |
| MON-R2 | `committed = Σ totalAmount` of bills in `APPROVED`, `PARTIALLY_PAID`, `PAID` |
| MON-R3 | `pendingExposure = Σ totalAmount` of `PENDING` bills (not part of committed) |
| MON-R4 | `paid = Σ payments.amount` |
| MON-R5 | `outstanding = committed − paid` |
| MON-R6 | `remainingBudget = totalBudget − committed`; `usedPercent = committed / totalBudget × 100` (null if budget = 0) |
| MON-R7 | Alert: `usedPercent ≥ 80` → `WARNING`; `≥ 100` → `CRITICAL` |
| MON-R8 | Aggregate bills and payments in separate subqueries to avoid join fan-out |

---

## 6. Projects, lands, users

| ID | Rule |
|---|---|
| PRJ-R1 | Status transitions: `PLANNING→ACTIVE`, `ACTIVE↔ON_HOLD`, `ACTIVE→COMPLETED`. Others → `422` |
| PRJ-R2 | Moving to `COMPLETED` sets `actualEndDate` (default today). Afterwards PM cannot create logs, stock, or bills; Admin can still record payments and approve existing pending bills |
| PRJ-R3 | `assignedPmId` must reference an **active** user with role `PM` |
| PRJ-R4 | A project may be `ACTIVE` without a PM, but the dashboard flags it "Unassigned" |
| PRJ-R5 | Land cannot be deleted while it has projects |
| USR-R1 | Email lowercased and trimmed; unique |
| USR-R2 | Password policy: ≥ 8 chars, at least one letter and one digit |
| USR-R3 | A PM with `ACTIVE` projects cannot be deactivated; Admin cannot deactivate themself |
| USR-R4 | Login fails identically for unknown email, wrong password, or inactive user |
| USR-R5 | `authenticate` re-checks `isActive` on every request, so deactivation is immediate |

---

## 7. Access control

| ID | Rule |
|---|---|
| ACC-R1 | Admin: all projects. PM: only `assignedPmId = user.id` |
| ACC-R2 | List endpoints add the PM scope filter inside the service (`where: { assignedPmId }` or via joined project) |
| ACC-R3 | Item endpoints (`/bills/:id`, `/daily-logs/:id`, `/material-plans/:id`, `/stock/transactions/:id/void`) resolve `projectId` from the record then call `assertProjectAccess` |
| ACC-R4 | Role-restricted routes use `requireRole`. Scope checks are in services. Both are required |
| ACC-R5 | Not-assigned access returns `403 FORBIDDEN` (consistent everywhere) |
| ACC-R6 | When a PM is reassigned away from a project, they immediately lose access |

---

## 8. Audit

| ID | Rule |
|---|---|
| AUD-R1 | Log in the **same transaction** as the change |
| AUD-R2 | Actions: `CREATE`, `UPDATE`, `DELETE` for all domain entities; `APPROVE`, `REJECT` for bills; `VOID` for stock; `LOGIN` for successful logins |
| AUD-R3 | `UPDATE`: store only changed fields in `oldValues`/`newValues` |
| AUD-R4 | Never store `passwordHash`, tokens, or full file contents |
| AUD-R5 | Payments are logged as `CREATE` with `entityType = 'Payment'` |
| AUD-R6 | Audit rows are never updated or deleted by the application |

---

## 9. Notifications (S2)

Generated by a daily job (`node-cron`, 08:00 server time) and inline after relevant events. Every notification has a `dedupeKey` so re-runs do not duplicate.

| Type | Trigger | Recipient | Dedupe key |
|---|---|---|---|
| `LOW_STOCK` | balance ≤ threshold after OUT/void | Project's PM + Admin | `LOW_STOCK:p{pid}:m{mid}:{date}` |
| `WASTAGE_ALERT` | status becomes `OVERRUN` | PM + Admin | `WASTAGE:p{pid}:m{mid}:{date}` |
| `BILL_SUBMITTED` | bill created | Admin | `BILL_SUBMITTED:b{id}` |
| `BILL_APPROVED` / `BILL_REJECTED` | Admin action | Submitting PM | `BILL_APPROVED:b{id}` / `BILL_REJECTED:b{id}:{ts}` |
| `BILL_OVERDUE` | due within `DUE_SOON_DAYS` or overdue | Admin | `BILL_OVERDUE:b{id}:{date}` |
| `BUDGET_ALERT` | usedPercent crosses 80 or 100 | Admin | `BUDGET:p{pid}:{80\|100}` |

---

## 10. Test checklist derived from rules (minimum)

- [ ] STK-R2: OUT beyond balance rejected; two parallel OUTs cannot overdraw
- [ ] STK-R6: voiding an IN that would make balance negative is rejected
- [ ] WST: worked example above returns `OVERRUN`, 25.49%, loss ₹5,13,500; zero-progress with consumption → `NO_BASELINE`
- [ ] LOG-R1/R3/R5: duplicate date, regressing progress, edit after window
- [ ] BIL-R1: GST/total computed server-side; client-supplied totals ignored
- [ ] BIL lifecycle: every allowed and a sample of disallowed transitions
- [ ] BIL-R9: overpayment rejected; partial then final payment ends in `PAID`
- [ ] ACC: PM cannot read or write another PM's project, bill, log, or stock (list and item routes)
- [ ] USR-R3/R4/R5: deactivation rules and immediate lockout
- [ ] MON-R2..R6: dashboard numbers equal hand-computed seed values
