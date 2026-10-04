# 05. API Specification

Base URL: `/api/v1`. JSON in, JSON out. This document is the **contract** between frontend and backend. Change it first (in a PR), then the code.

Legend for the **Access** column: `A` = Admin, `P` = PM on assigned projects, `A,P` = both, `Public` = no token.

---

## 1. Conventions

### 1.1 Auth
`Authorization: Bearer <jwt>` on every request except `POST /auth/login` and `GET /health`.

### 1.2 Envelopes

```jsonc
// success
{ "success": true, "data": { ... } }

// success, paginated list
{ "success": true, "data": [ ... ],
  "meta": { "page": 1, "limit": 20, "total": 134, "totalPages": 7 } }

// error
{ "success": false,
  "error": { "code": "VALIDATION_ERROR", "message": "Invalid input",
             "details": [ { "path": "baseAmount", "message": "Must be ≥ 0" } ] } }
```

Error codes and HTTP statuses: `03-system-architecture.md` §8.1.

### 1.3 Data formats
- Field names `camelCase`.
- Date-only: `"2026-10-04"`. Timestamps: ISO 8601 UTC (`"2026-10-04T09:30:00.000Z"`).
- Money and quantities: JSON **numbers** (e.g. `125000.5`). INR, 2 decimals for money, 3 for quantities.
- IDs: integers.
- Enums: UPPER_SNAKE strings as in `04-database-design.md`.

### 1.4 Pagination, sorting, search
`?page=1&limit=20` (default 20, max 100), `?sort=createdAt:desc`, `?search=text`. Unknown or non-whitelisted sort fields return `400`.

### 1.5 Never accept from the client
`createdById`, `submittedById`, `approvedById`, `recordedById`, `status` (on create), `gstAmount`, `totalAmount`, `role` (outside user-management), `passwordHash`.

---

## 2. Endpoint index

| # | Method | Path | Access | Summary |
|---|---|---|---|---|
| **Health** |||||
| 1 | GET | `/health` | Public | Liveness + DB check |
| **Auth** |||||
| 2 | POST | `/auth/login` | Public | Login |
| 3 | GET | `/auth/me` | A,P | Current user |
| 4 | POST | `/auth/change-password` | A,P | Change own password |
| **Users** |||||
| 5 | GET | `/users` | A | List users |
| 6 | POST | `/users` | A | Create user |
| 7 | GET | `/users/:id` | A | User detail |
| 8 | PATCH | `/users/:id` | A | Update name/phone/isActive/role |
| 9 | POST | `/users/:id/reset-password` | A | Set a new password |
| **Lands** |||||
| 10 | GET | `/lands` | A | List lands |
| 11 | POST | `/lands` | A | Create land |
| 12 | GET | `/lands/:id` | A | Land with its projects |
| 13 | PATCH | `/lands/:id` | A | Update land |
| 14 | DELETE | `/lands/:id` | A | Delete (only if no projects) |
| **Projects** |||||
| 15 | GET | `/projects` | A,P | List (scoped) |
| 16 | POST | `/projects` | A | Create project |
| 17 | GET | `/projects/:id` | A,P | Project detail |
| 18 | PATCH | `/projects/:id` | A | Update fields / assign PM |
| 19 | PATCH | `/projects/:id/status` | A | Change status |
| 20 | GET | `/projects/:id/summary` | A,P | Progress, spend, alerts |
| **Masters** |||||
| 21 | GET | `/materials` | A,P | List materials |
| 22 | POST | `/materials` | A,P | Create material |
| 23 | PATCH | `/materials/:id` | A | Update / deactivate |
| 24 | GET | `/vendors` | A,P | List vendors |
| 25 | POST | `/vendors` | A,P | Create vendor |
| 26 | PATCH | `/vendors/:id` | A | Update / deactivate |
| **Material plans** |||||
| 27 | GET | `/projects/:projectId/material-plans` | A,P | List plans |
| 28 | POST | `/projects/:projectId/material-plans` | A,P | Add plan row |
| 29 | PATCH | `/material-plans/:id` | A,P | Update plan row |
| 30 | DELETE | `/material-plans/:id` | A,P | Remove (only if no stock transactions) |
| **Daily logs** |||||
| 31 | GET | `/projects/:projectId/daily-logs` | A,P | List logs |
| 32 | POST | `/projects/:projectId/daily-logs` | A,P | Create log (nested) |
| 33 | GET | `/daily-logs/:id` | A,P | Log detail |
| 34 | PATCH | `/daily-logs/:id` | A,P | Update (edit window) |
| 35 | DELETE | `/daily-logs/:id` | A | Delete log |
| **Stock** |||||
| 36 | GET | `/projects/:projectId/stock/balances` | A,P | Balances per material |
| 37 | GET | `/projects/:projectId/stock/transactions` | A,P | Ledger |
| 38 | POST | `/projects/:projectId/stock/transactions` | A,P | Post IN / OUT |
| 39 | POST | `/stock/transactions/:id/void` | A,P | Void a transaction |
| **Wastage** |||||
| 40 | GET | `/projects/:projectId/wastage` | A,P | Per-material wastage status |
| 41 | GET | `/wastage/overview` | A | Portfolio-wide top overruns |
| **Bills & payments** |||||
| 42 | GET | `/bills` | A,P | List (scoped, filtered) |
| 43 | POST | `/bills` | A,P | Create bill |
| 44 | GET | `/bills/:id` | A,P | Detail with payments |
| 45 | PATCH | `/bills/:id` | A,P | Edit (PENDING/REJECTED) |
| 46 | DELETE | `/bills/:id` | A,P | Delete (PENDING, no payments) |
| 47 | POST | `/bills/:id/approve` | A | Approve |
| 48 | POST | `/bills/:id/reject` | A | Reject with reason |
| 49 | GET | `/bills/:id/payments` | A,P | List payments |
| 50 | POST | `/bills/:id/payments` | A | Record payment |
| **Dashboards** |||||
| 51 | GET | `/dashboard/admin` | A | Portfolio dashboard |
| 52 | GET | `/dashboard/pm` | P | PM dashboard |
| **Audit** |||||
| 53 | GET | `/audit-logs` | A | Audit viewer |
| **Stretch** |||||
| 54 | GET | `/reports/export/:type` | A,P | S1: `bills`, `stock`, `wastage`, `project-summary`; `?format=xlsx\|pdf` |
| 55 | GET | `/notifications` | A,P | S2: list (`?unread=true`) |
| 56 | PATCH | `/notifications/:id/read` | A,P | S2 |
| 57 | POST | `/notifications/read-all` | A,P | S2 |
| 58 | POST | `/attachments` | A,P | S2: multipart upload |
| 59 | GET | `/attachments/:id` | A,P | S2: download |
| 60 | DELETE | `/attachments/:id` | A,P | S2: uploader or Admin |

---

## 3. Endpoint details

Only non-trivial endpoints are expanded. For standard CRUD, fields match the Prisma model minus server-controlled fields.

### 3.1 Auth

**POST `/auth/login`**
```jsonc
// request
{ "email": "admin@buildtrack.test", "password": "Admin@123" }
// 200
{ "success": true, "data": {
    "token": "eyJhbGciOi...",
    "user": { "id": 1, "name": "Rakesh Verma", "email": "admin@buildtrack.test", "role": "ADMIN" } } }
// 401 UNAUTHENTICATED: generic "Invalid email or password" (also for inactive users)
```

**POST `/auth/change-password`** body `{ "currentPassword", "newPassword" }` → `200 { data: { changed: true } }`.

### 3.2 Users

**POST `/users`** (Admin)
```jsonc
{ "name": "Anil Kumar", "email": "anil@example.com", "phone": "9876543210",
  "role": "PM", "password": "Temp@1234" }
```
Errors: `409 CONFLICT` duplicate email. Response never contains `passwordHash`.

**PATCH `/users/:id`** body subset of `{ name, phone, role, isActive }`. Deactivating a PM with `ACTIVE` projects → `422 BUSINESS_RULE_VIOLATION`. Admin cannot deactivate self.

**GET `/users`** filters: `role`, `isActive`, `search`.

### 3.3 Lands

**POST `/lands`**
```jsonc
{ "name": "Sector 12 Plot", "addressLine": "Near Kundli Border", "city": "Sonipat", "state": "Haryana",
  "pincode": "131028", "areaValue": 2.5, "areaUnit": "ACRE", "surveyNumber": "KH-221/4",
  "ownerName": "XYZ Developers Pvt Ltd", "purchaseDate": "2025-03-10", "purchaseCost": 52000000, "notes": "" }
```
**DELETE `/lands/:id`** → `422` if any project references it.

### 3.4 Projects

**GET `/projects`** filters: `status`, `landId`, `pmId` (Admin only), `search`; scoped automatically for PM. Each item includes `land: {id,name,city}`, `assignedPm: {id,name}|null`, and `progressPercent` (latest log or 0).

**POST `/projects`** (Admin)
```jsonc
{ "landId": 1, "code": "SNP-A-01", "name": "Skyline Heights Tower A", "description": "",
  "startDate": "2026-06-01", "expectedEndDate": "2027-12-31",
  "totalBudget": 120000000, "wastageThresholdPct": 10, "assignedPmId": 2 }
```
Rules: `code` unique (`409`); `assignedPmId` must be an active PM (`422`).

**PATCH `/projects/:id/status`** body `{ "status": "ACTIVE" }`. Invalid transition → `422`. `COMPLETED` sets `actualEndDate = today` (override allowed in body).

**GET `/projects/:id/summary`**
```jsonc
{ "success": true, "data": {
  "project": { "id": 3, "name": "Skyline Heights Tower A", "status": "ACTIVE" },
  "progressPercent": 42.5,
  "lastLogDate": "2026-10-03",
  "budget": { "total": 120000000, "committed": 38500000, "paid": 29000000,
              "pendingExposure": 4200000, "remaining": 81500000, "usedPercent": 32.1,
              "alert": "NONE" },                        // NONE | WARNING (>=80%) | CRITICAL (>=100%)
  "bills": { "pending": 3, "rejected": 1, "overdue": 2, "outstandingAmount": 9500000 },
  "stock": { "lowStockCount": 2 },
  "wastage": { "overrunCount": 1, "estimatedLoss": 184000 }
} }
```

### 3.5 Masters

**POST `/materials`** `{ "name": "OPC 53 Cement", "category": "CEMENT", "unit": "BAG" }`. `409` on duplicate name (case-insensitive).
**POST `/vendors`** `{ "name": "Shree Cement Traders", "gstin": "06ABCDE1234F1Z5", "phone": "...", "email": "...", "contactPerson": "...", "address": "..." }`. GSTIN pattern: `^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$`.
Lists support `search`, `isActive`; materials also `category`.

### 3.6 Material plans

**POST `/projects/:projectId/material-plans`**
```jsonc
{ "materialId": 4, "plannedQuantity": 12000, "plannedUnitRate": 395,
  "lowStockThreshold": 500, "wastageThresholdPct": 8 }
```
`409` if (project, material) already planned. `GET` returns rows with `material: {id,name,unit,category}`.

### 3.7 Daily logs

**POST `/projects/:projectId/daily-logs`** (single nested payload, one transaction)
```jsonc
{
  "logDate": "2026-10-04",
  "progressPercent": 43.0,
  "workSummary": "Slab casting completed on 5th floor; shuttering started on 6th.",
  "weather": "Clear",
  "issues": "Cement delivery delayed by 2 hours",
  "labourEntries": [
    { "trade": "Mason", "contractorName": "R. Singh & Co", "headCount": 12, "hoursWorked": 8 },
    { "trade": "Helper", "headCount": 20, "hoursWorked": 8 }
  ],
  "machineryEntries": [
    { "machineName": "Concrete Mixer", "operatorName": "Suresh", "hoursUsed": 6.5, "fuelLitres": 22 }
  ]
}
```
Errors: `409` duplicate date; `422` future date / project not `ACTIVE` / progress lower than previous log date.

**PATCH `/daily-logs/:id`** same shape, all optional. If `labourEntries` / `machineryEntries` are provided, they **replace** the existing set. `422` if PM and the edit window has passed.

**GET `/projects/:projectId/daily-logs`** filters `from`, `to`; list items include counts (`labourHeadCountTotal`, `machineryHoursTotal`). **GET `/daily-logs/:id`** returns the full log with children and linked stock transactions.

### 3.8 Stock

**GET `/projects/:projectId/stock/balances`**
```jsonc
{ "success": true, "data": [
  { "materialId": 4, "materialName": "OPC 53 Cement", "unit": "BAG",
    "totalIn": 5000, "totalOut": 4550, "balance": 450,
    "plannedQuantity": 12000, "lowStockThreshold": 500, "isLowStock": true }
] }
```

**POST `/projects/:projectId/stock/transactions`**
```jsonc
// IN
{ "materialId": 4, "txnType": "IN", "quantity": 800, "txnDate": "2026-10-04",
  "vendorId": 2, "billId": 17, "challanNumber": "CH-4471", "unitRate": 398, "remarks": "" }
// OUT
{ "materialId": 4, "txnType": "OUT", "quantity": 120, "txnDate": "2026-10-04",
  "outReason": "USED", "dailyLogId": 88 }
```
Validation: IN must not include `outReason`; OUT must include it and must not include `vendorId/billId/unitRate`. Errors: `422 INSUFFICIENT_STOCK` with `details: { available: 450, requested: 600 }`; `422` if the project is not `ACTIVE`; `422` if the material has no plan row (**decision:** plan row required, so wastage can be evaluated; the UI offers a quick "add plan" link).

**POST `/stock/transactions/:id/void`** body `{ "reason": "Wrong quantity entered" }`. `422` if already voided, PM outside edit window or not the creator, or if voiding an IN would make the balance negative.

**GET `/projects/:projectId/stock/transactions`** filters `materialId`, `txnType`, `from`, `to`, `includeVoided` (default false).

### 3.9 Wastage

**GET `/projects/:projectId/wastage`**
```jsonc
{ "success": true, "data": {
  "progressPercent": 42.5,
  "items": [
    { "materialId": 4, "materialName": "OPC 53 Cement", "unit": "BAG",
      "plannedQuantity": 12000, "expectedQuantity": 5100, "consumedQuantity": 6400,
      "overrunQuantity": 1300, "overrunPercent": 25.49, "thresholdPercent": 10,
      "recordedWastageQuantity": 150, "estimatedLoss": 513500, "status": "OVERRUN" }
  ] } }
```
`status`: `OK`, `OVERRUN`, `NO_BASELINE` (progress is 0 but consumption exists). Sorted by status then `estimatedLoss` desc.

**GET `/wastage/overview`** (Admin): `?limit=10` → flat list of the same items plus `projectId`, `projectName`.

### 3.10 Bills and payments

**POST `/bills`**
```jsonc
{ "projectId": 3, "vendorId": 2, "billNumber": "INV-2026-0451", "billDate": "2026-10-01",
  "dueDate": "2026-10-31", "category": "MATERIAL", "description": "Cement 800 bags",
  "baseAmount": 318400, "gstPercent": 18 }
```
Response includes server-computed `gstAmount: 57312`, `totalAmount: 375712`, `status: "PENDING"`, `submittedBy`. Errors: `409` (vendor, billNumber) duplicate; `403` PM not assigned; `422` project `COMPLETED`.

**GET `/bills`** filters: `projectId`, `vendorId`, `status` (comma list), `category`, `overdue=true`, `from`, `to` (bill date), `search` (bill no./vendor), plus pagination. Each row includes `vendor`, `project`, `paidAmount`, `outstandingAmount`, `isOverdue`. `meta` additionally includes `totals: { totalAmount, paidAmount, outstandingAmount }` for the filtered set.

**PATCH `/bills/:id`** editable: `vendorId, billNumber, billDate, dueDate, category, description, baseAmount, gstPercent`. Only `PENDING`/`REJECTED`; PM only own bills. Editing a `REJECTED` bill sets `status=PENDING` and clears `rejectionReason`.

**POST `/bills/:id/approve`** → `200` bill with `status: "APPROVED"`, `approvedBy`, `approvedAt`. `422` if not `PENDING`.

**POST `/bills/:id/reject`** body `{ "reason": "Quantity doesn't match challan" }` (required, min 5 chars).

**POST `/bills/:id/payments`** (Admin)
```jsonc
{ "amount": 200000, "paymentDate": "2026-10-04", "mode": "BANK_TRANSFER",
  "referenceNumber": "UTR123456789", "remarks": "Part payment" }
```
Response: `{ payment, bill: { status: "PARTIALLY_PAID", paidAmount, outstandingAmount } }`. Errors: `422` bill not payable (not `APPROVED`/`PARTIALLY_PAID`); `422` amount > outstanding.

### 3.11 Dashboards

**GET `/dashboard/admin`**
```jsonc
{ "success": true, "data": {
  "projectCounts": { "total": 4, "planning": 1, "active": 2, "onHold": 0, "completed": 1 },
  "financials": { "totalBudget": 380000000, "committed": 112000000, "paid": 84000000,
                  "outstanding": 28000000, "pendingExposure": 9500000 },
  "pendingApprovals": { "count": 5, "amount": 3150000 },
  "overdueBills": { "count": 2, "amount": 1250000 },
  "wastageAlerts": [ { "projectId": 3, "projectName": "Skyline Heights Tower A",
                       "materialName": "OPC 53 Cement", "overrunPercent": 25.49, "estimatedLoss": 513500 } ],
  "projects": [ { "id": 3, "name": "...", "status": "ACTIVE", "pm": "Anil Kumar",
                  "progressPercent": 42.5, "budget": 120000000, "committed": 38500000,
                  "paid": 29000000, "lastLogDate": "2026-10-03", "openAlerts": 3 } ],
  "spendByProject": [ { "projectName": "Tower A", "committed": 38500000, "paid": 29000000 } ]
} }
```

**GET `/dashboard/pm`**
```jsonc
{ "success": true, "data": {
  "projects": [ { "id": 3, "name": "...", "status": "ACTIVE", "progressPercent": 42.5,
                  "lastLogDate": "2026-10-03", "logDueToday": true } ],
  "lowStock": [ { "projectId": 3, "materialName": "OPC 53 Cement", "balance": 450, "threshold": 500, "unit": "BAG" } ],
  "wastageAlerts": [ ... ],
  "myBills": { "pending": 3, "rejected": 1, "rejectedItems": [ { "id": 17, "billNumber": "INV-...", "reason": "..." } ] }
} }
```

### 3.12 Audit

**GET `/audit-logs`** filters: `entityType`, `entityId`, `userId`, `action`, `from`, `to`. Items: `{ id, user: {id,name}|null, action, entityType, entityId, oldValues, newValues, createdAt }`.

### 3.13 Stretch endpoints (outline)

- **Export (S1)** `GET /reports/export/bills?format=xlsx&projectId=3&status=APPROVED` → file stream with `Content-Disposition: attachment`. Accepts the same filters as the corresponding list endpoint.
- **Notifications (S2)** item: `{ id, type, title, message, projectId, link, isRead, createdAt }`; list response `meta.unreadCount`.
- **Attachments (S2)** `POST /attachments` multipart fields `file` + exactly one of `dailyLogId` / `billId`. Allowed MIME: `image/jpeg`, `image/png`, `application/pdf`; max `MAX_UPLOAD_MB`. Returns `{ id, fileName, mimeType, sizeBytes, createdAt }`.

---

## 4. Status transition reference

**Project:** `PLANNING→ACTIVE`, `ACTIVE→ON_HOLD`, `ON_HOLD→ACTIVE`, `ACTIVE→COMPLETED`. All others → `422`.

**Bill:** `PENDING→APPROVED|REJECTED` (Admin), `REJECTED→PENDING` (via edit), `APPROVED→PARTIALLY_PAID|PAID`, `PARTIALLY_PAID→PARTIALLY_PAID|PAID` (via payment). Nothing else.

---

## 5. Frontend integration notes

- One typed function per endpoint in `client/src/features/<name>/api.ts`. Components never call Axios directly.
- Axios response interceptor: unwrap `data`, normalise errors to `ApiError { code, message, details, status }`, and on `401` clear the token and redirect to `/login`.
- Query keys: `['projects', params]`, `['projects', id]`, `['projects', id, 'summary']`, `['stock', projectId, 'balances']`, `['bills', params]`, etc. Mutations invalidate the related keys (see `06-frontend-guide.md` §7).
- While the backend is unfinished, develop against mock responses that exactly follow this document (e.g. MSW), then switch to the real API.
