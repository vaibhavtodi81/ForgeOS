# ForgeOS Database Normalization

This document describes the database that is actually defined by
[`server/prisma/schema.prisma`](../server/prisma/schema.prisma) and the initial
PostgreSQL migration. Prisma remains the application source of truth; the SQL
and diagram in this folder are documentation artifacts.

## Entities and keys

ForgeOS has these tables:

`users`, `lands`, `projects`, `materials`, `vendors`,
`project_material_plans`, `project_milestones`, `daily_logs`, `labour_entries`,
`machinery_entries`, `stock_transactions`, `bills`, `payments`,
`audit_logs`, `notifications`, `attachments`, and
`project_vendor_assignments`.

Every table has a surrogate integer primary key named `id`. Additional
candidate keys include:

- `users.email`
- `projects.code`
- `materials.name`
- `vendors.name`
- `vendors.gstin`
- `(project_id, material_id)` in `project_material_plans`
- `(project_id, sequence)` in `project_milestones`
- `(project_id, log_date)` in `daily_logs`
- `(vendor_id, bill_number)` in `bills`
- `(project_id, vendor_id)` while `unassigned_at IS NULL` in
  `project_vendor_assignments` (enforced by a partial unique index)
- `notifications.dedupe_key`

Foreign keys represent relationships rather than copying descriptive data.
For example, `projects.land_id` identifies a land record, while the land name
remains in `lands`; `daily_logs.project_id` identifies a project, while project
attributes remain in `projects`.

## First Normal Form (1NF)

The schema satisfies 1NF because:

1. Each table has rows identified by a primary key.
2. Each column stores one atomic value of its declared PostgreSQL type.
3. Repeating groups are represented by child tables.

Examples:

- Multiple labour rows for one daily log are stored in `labour_entries`, not
  in columns such as `trade_1`, `trade_2`, or a comma-separated field.
- Multiple machinery rows are stored in `machinery_entries`.
- Multiple milestones are stored in `project_milestones`, with one row per
  project milestone and no repeating milestone columns on `projects`.
- A project can have many material plans through
  `project_material_plans`.
- A project can have many historical vendor assignments through
  `project_vendor_assignments`; an active project/vendor pair has one current
  assignment.
- A bill can have many payments through `payments`.
- JSON audit snapshots are intentionally semi-structured historical payloads;
  they are not used as the normalized operational attributes of users,
  projects, or financial records.

The attributes `head_count`, `hours_worked`, `hours_used`, and monetary
amounts are scalar numeric values. PostgreSQL enums represent controlled
single-valued states such as `ProjectStatus` and `BillStatus`.

## Second Normal Form (2NF)

2NF requires 1NF and that every non-key attribute depend on the whole
candidate key, not only part of a composite key.

The operational tables use surrogate primary keys, so their non-key columns
depend on the complete row identifier. The important composite business keys
also satisfy this rule:

- In `project_material_plans`, `(project_id, material_id)` identifies one
  plan row. `planned_quantity`, `planned_unit_rate`, and threshold values
  describe that project-material combination, not only the project or only
  the material.
- In `daily_logs`, `(project_id, log_date)` identifies the one log for a
  project on a date. Progress and work details depend on both values.
- In `project_milestones`, `(project_id, sequence)` identifies a milestone's
  position within a project. Its name, dates, status, and progress depend on
  that project-position pair.
- In `bills`, `(vendor_id, bill_number)` identifies a vendor's bill number;
  the bill's dates, amounts, status, and project depend on the complete pair.

Attributes that depend only on a referenced entity are kept in that entity.
For example, material category and unit are in `materials`, not repeated in
every project plan or stock transaction.

## Third Normal Form (3NF)

3NF requires 2NF and no non-key attribute transitively depending on another
non-key attribute.

The schema separates the main functional dependencies:

- `user_id -> name, email, role, is_active, ...` in `users`
- `land_id -> land attributes` in `lands`
- `project_id -> project attributes` in `projects`
- `material_id -> material attributes` in `materials`
- `vendor_id -> vendor attributes` in `vendors`
- `daily_log_id -> daily-log attributes` in `daily_logs`
- `milestone_id -> milestone attributes` in `project_milestones`
- `bill_id -> bill attributes` in `bills`
- `assignment_id -> assignment attributes` in
  `project_vendor_assignments`

A project stores `land_id`, `assigned_pm_id`, and `created_by_id` as foreign
keys rather than storing land or user names. A payment stores `bill_id` and
`recorded_by_id`, rather than copying bill or user details. A stock
transaction stores references to project, material, vendor, bill, daily log,
and users, rather than duplicating their descriptive attributes.

Some values are deliberately stored because they are facts of the
transaction or a controlled snapshot:

- `bills.gst_amount` and `bills.total_amount` are validated by database checks
  because they are financial transaction values.
- `audit_logs.old_values` and `new_values` preserve historical snapshots.
- `projects.wastage_threshold_pct` and
  `project_material_plans.wastage_threshold_pct` represent configured
  project-level and per-material policy values.

The analytics views `v_stock_balance`, `v_wastage_status`, and
`v_project_financials` are derived read models. They do not introduce a second
source of operational data.

Inventory remains normalized by separating material master data
(`materials`), the project/material inventory-plan identity
(`project_material_plans`), and the immutable stock ledger
(`stock_transactions`). Opening stock is a fact on the project/material row;
received, consumed, and adjustment quantities remain ledger facts. Available
stock is derived from these rows, while wastage is derived from OUT rows whose
reason is `DAMAGED` or `LOST`.

## Boyce-Codd Normal Form (BCNF)

The ordinary entity tables are BCNF-compatible under their declared
functional dependencies: each non-trivial determinant is a primary key or a
declared candidate key. The composite unique constraints listed above provide
the business determinants for plan rows, daily logs, and bills.

BCNF is less directly applicable to `audit_logs`, because its JSON snapshot
columns intentionally record historical event data rather than a fully
normalized current-state relation. The analytics views are also derived
relations, not independently maintained base tables.

## Integrity beyond normalization

Normalization alone does not enforce every business rule. The migration also
defines:

- Foreign-key actions such as cascade, restrict, and set-null.
- Unique indexes, including case-insensitive material and vendor name indexes.
- Range and positivity checks for budgets, progress, quantities, hours, bills,
  payments, and attachment targets.
- The three read-only analytics views.
