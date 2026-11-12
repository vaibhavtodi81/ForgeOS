-- ForgeOS application query documentation
-- These are SQL equivalents of the Prisma operations in server/src.
-- Parameters use PostgreSQL positional placeholders ($1, $2, ...).
-- READ and WRITE labels identify the operation type.

-- Q01 READ
-- Authenticate a user by its normalized unique email.
SELECT id, name, email, password_hash, role, phone, is_active,
       last_login_at, created_at, updated_at
FROM users
WHERE email = $1;

-- Q02 WRITE
-- Record the successful login timestamp for the authenticated user.
UPDATE users
SET last_login_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING id, name, email, role, phone, is_active, created_at, updated_at;

-- Q03 READ
-- Paginated user list used by the user-management service.
SELECT id, name, email, role, phone, is_active, created_at, updated_at
FROM users
WHERE ($1 IS NULL OR name ILIKE '%' || $1 || '%'
       OR email ILIKE '%' || $1 || '%')
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- Q04 READ
-- List lands visible to a PM through assigned projects.
SELECT DISTINCT l.*
FROM lands AS l
JOIN projects AS p ON p.land_id = l.id
WHERE p.assigned_pm_id = $1
ORDER BY l.created_at DESC
LIMIT $2 OFFSET $3;

-- Q05 READ
-- List projects with their land and assigned PM, scoped for a PM.
SELECT p.*, l.name AS land_name, l.city AS land_city,
       u.id AS pm_id, u.name AS pm_name, u.email AS pm_email
FROM projects AS p
JOIN lands AS l ON l.id = p.land_id
LEFT JOIN users AS u ON u.id = p.assigned_pm_id
WHERE p.assigned_pm_id = $1
ORDER BY p.created_at DESC
LIMIT $2 OFFSET $3;

-- Q06 WRITE
-- Create a project after the service has validated its land and assigned PM.
INSERT INTO projects (
  land_id, code, name, description, status, start_date, expected_end_date,
  actual_end_date, total_budget, wastage_threshold_pct, assigned_pm_id,
  created_by_id, created_at, updated_at
)
VALUES ($1, $2, $3, $4, COALESCE($5, 'PLANNING'), $6, $7, $8, $9, $10,
        $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
RETURNING *;

-- Q07 READ
-- Paginated daily logs for one project, including labour and machinery
-- aggregate values used by the application response.
SELECT dl.*,
       COALESCE(l.labour_head_count_total, 0) AS labour_head_count_total,
       COALESCE(m.machinery_hours_total, 0) AS machinery_hours_total
FROM daily_logs AS dl
LEFT JOIN (
  SELECT daily_log_id, SUM(head_count) AS labour_head_count_total
  FROM labour_entries
  GROUP BY daily_log_id
) AS l ON l.daily_log_id = dl.id
LEFT JOIN (
  SELECT daily_log_id, SUM(hours_used) AS machinery_hours_total
  FROM machinery_entries
  GROUP BY daily_log_id
) AS m ON m.daily_log_id = dl.id
WHERE dl.project_id = $1
  AND ($2 IS NULL OR dl.log_date >= $2)
  AND ($3 IS NULL OR dl.log_date <= $3)
ORDER BY dl.log_date DESC
LIMIT $4 OFFSET $5;

-- Q08 WRITE
-- Create a daily log and its nested labour and machinery rows atomically.
-- The application performs this as one Prisma transaction.
WITH new_log AS (
  INSERT INTO daily_logs (
    project_id, log_date, progress_percent, work_summary, weather, issues,
    created_by_id, created_at, updated_at
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  RETURNING id
),
new_labour AS (
  INSERT INTO labour_entries
    (daily_log_id, trade, contractor_name, head_count, hours_worked, remarks)
  SELECT id, $8, $9, $10, $11, $12
  FROM new_log
  RETURNING daily_log_id
)
INSERT INTO machinery_entries
  (daily_log_id, machine_name, operator_name, hours_used, fuel_litres, remarks)
SELECT id, $13, $14, $15, $16, $17
FROM new_log
RETURNING *;

-- Q09 READ
-- Return a daily log with its labour, machinery, and linked stock rows.
SELECT dl.*, le.id AS labour_id, le.trade, le.head_count, le.hours_worked,
       me.id AS machinery_id, me.machine_name, me.hours_used, me.fuel_litres,
       st.id AS stock_transaction_id, st.txn_type, st.quantity, st.txn_date
FROM daily_logs AS dl
LEFT JOIN labour_entries AS le ON le.daily_log_id = dl.id
LEFT JOIN machinery_entries AS me ON me.daily_log_id = dl.id
LEFT JOIN stock_transactions AS st ON st.daily_log_id = dl.id
WHERE dl.id = $1;

-- Q10 WRITE
-- Replace nested labour and machinery rows during a daily-log update.
-- The deletes and update/inserts are executed in one transaction.
WITH deleted_labour AS (
  DELETE FROM labour_entries WHERE daily_log_id = $1 RETURNING id
),
deleted_machinery AS (
  DELETE FROM machinery_entries WHERE daily_log_id = $1 RETURNING id
)
UPDATE daily_logs
SET progress_percent = COALESCE($2, progress_percent),
    work_summary = COALESCE($3, work_summary),
    weather = COALESCE($4, weather),
    issues = COALESCE($5, issues),
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;

-- Q11 WRITE
-- Delete an ADMIN-authorized daily log; child labour and machinery rows
-- cascade according to the foreign keys, while stock links are set NULL.
DELETE FROM daily_logs
WHERE id = $1
RETURNING id, project_id, log_date;

-- Q12 WRITE
-- Create a project milestone and its CREATE audit event atomically.
WITH new_milestone AS (
  INSERT INTO project_milestones (
    project_id, name, description, sequence, planned_start_date,
    planned_end_date, actual_start_date, actual_end_date, status,
    progress_percent, created_at, updated_at
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, 'PLANNED'),
          COALESCE($10, 0), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  RETURNING *
)
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
SELECT $11, 'CREATE', 'ProjectMilestone', id,
       jsonb_build_object('id', id, 'projectId', project_id, 'name', name,
                          'sequence', sequence, 'status', status,
                          'progressPercent', progress_percent)
FROM new_milestone
RETURNING *;

-- Q13 READ
-- List milestones for a project in sequence and planned-date order.
SELECT id, project_id, name, description, sequence, planned_start_date,
       planned_end_date, actual_start_date, actual_end_date, status,
       progress_percent, created_at, updated_at
FROM project_milestones
WHERE project_id = $1
ORDER BY sequence ASC, planned_start_date ASC NULLS LAST, id ASC;

-- Q18 READ
-- List the project inventory balances derived from the project/material plan
-- and non-voided stock ledger.
SELECT pmp.material_id, m.name AS material_name, m.unit,
       pmp.opening_quantity,
       COALESCE(SUM(st.quantity) FILTER (WHERE st.txn_type = 'IN'), 0) AS total_in,
       COALESCE(SUM(st.quantity) FILTER (WHERE st.txn_type = 'OUT'), 0) AS total_out,
       COALESCE(SUM(st.quantity) FILTER (WHERE st.txn_type = 'ADJUSTMENT'
         AND st.adjustment_direction = 'INCREASE'), 0) AS adjustment_in,
       COALESCE(SUM(st.quantity) FILTER (WHERE st.txn_type = 'ADJUSTMENT'
         AND st.adjustment_direction = 'DECREASE'), 0) AS adjustment_out
FROM project_material_plans AS pmp
JOIN materials AS m ON m.id = pmp.material_id
LEFT JOIN stock_transactions AS st
  ON st.project_id = pmp.project_id AND st.material_id = pmp.material_id
 AND st.is_voided = false
WHERE pmp.project_id = $1
GROUP BY pmp.material_id, m.name, m.unit, pmp.opening_quantity
ORDER BY m.name;

-- Q19 WRITE
-- Record a stock transaction and its audit event in one transaction. The
-- service obtains a project/material advisory lock and checks the balance
-- before executing this write.
WITH new_transaction AS (
  INSERT INTO stock_transactions (
    project_id, material_id, txn_type, quantity, unit_rate, vendor_id, bill_id,
    challan_number, out_reason, adjustment_direction, txn_date, daily_log_id,
    remarks, created_by_id
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
  RETURNING *
)
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
SELECT $14, 'CREATE', 'StockTransaction', id,
       jsonb_build_object('id', id, 'projectId', project_id,
                          'materialId', material_id, 'txnType', txn_type,
                          'quantity', quantity, 'txnDate', txn_date)
FROM new_transaction
RETURNING *;

-- Q20 READ
-- Return wastage inputs from the project plans and non-voided OUT ledger.
SELECT pmp.material_id, m.name AS material_name, m.unit,
       pmp.planned_quantity, pmp.planned_unit_rate,
       COALESCE(SUM(st.quantity), 0) AS consumed_quantity,
       COALESCE(SUM(st.quantity) FILTER
         (WHERE st.out_reason IN ('DAMAGED', 'LOST')), 0) AS recorded_wastage_quantity
FROM project_material_plans AS pmp
JOIN materials AS m ON m.id = pmp.material_id
LEFT JOIN stock_transactions AS st
  ON st.project_id = pmp.project_id AND st.material_id = pmp.material_id
 AND st.txn_type = 'OUT' AND st.is_voided = false
WHERE pmp.project_id = $1
GROUP BY pmp.material_id, m.name, m.unit, pmp.planned_quantity,
         pmp.planned_unit_rate;

-- Q21 WRITE
-- Update milestone fields. The application records changed fields in its
-- surrounding audit transaction.
UPDATE project_milestones
SET name = COALESCE($2, name),
    description = COALESCE($3, description),
    sequence = COALESCE($4, sequence),
    status = COALESCE($5, status),
    progress_percent = COALESCE($6, progress_percent),
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;

-- Q22 WRITE
-- Delete a milestone. The application retains the old snapshot in its
-- surrounding audit transaction.
DELETE FROM project_milestones
WHERE id = $1
RETURNING *;

-- Q23 READ
-- List vendors visible to an actor. PM visibility is implemented by the
-- service through active assignments on projects assigned to that PM.
SELECT DISTINCT v.*
FROM vendors AS v
LEFT JOIN project_vendor_assignments AS pva
  ON pva.vendor_id = v.id AND pva.unassigned_at IS NULL
LEFT JOIN projects AS p ON p.id = pva.project_id
WHERE ($1 = 'ADMIN' OR p.assigned_pm_id = $2)
  AND ($3 IS NULL OR v.is_active = $3)
  AND ($4 IS NULL OR v.name ILIKE '%' || $4 || '%')
ORDER BY v.name;

-- Q24 WRITE
-- Create a bill with server-computed GST and total, then audit it atomically.
WITH new_bill AS (
  INSERT INTO bills (
    project_id, vendor_id, bill_number, bill_date, due_date, category,
    description, base_amount, gst_percent, gst_amount, total_amount,
    status, submitted_by_id, updated_at
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,
          ROUND($8 * $9 / 100, 2),
          $8 + ROUND($8 * $9 / 100, 2),
          'PENDING', $10, CURRENT_TIMESTAMP)
  RETURNING *
)
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
SELECT $10, 'CREATE', 'Bill', id,
       jsonb_build_object('id', id, 'projectId', project_id,
                          'vendorId', vendor_id, 'billNumber', bill_number,
                          'totalAmount', total_amount, 'status', status)
FROM new_bill
RETURNING *;

-- Q25 READ
-- Calculate paid and outstanding amounts without payment join fan-out.
SELECT b.id, b.bill_number, b.total_amount,
       COALESCE(p.paid_amount, 0) AS paid_amount,
       b.total_amount - COALESCE(p.paid_amount, 0) AS outstanding_amount
FROM bills AS b
LEFT JOIN (
  SELECT bill_id, SUM(amount) AS paid_amount
  FROM payments
  GROUP BY bill_id
) AS p ON p.bill_id = b.id
WHERE b.project_id = $1;

-- Q26 WRITE
-- Record a payment row. The application updates bill status and writes the
-- audit event in its surrounding transaction.
INSERT INTO payments (
  bill_id, amount, payment_date, mode, reference_number, remarks, recorded_by_id
)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- Q27 READ
-- Payment history with optional date filtering and project scoping.
SELECT pay.*, b.bill_number, b.project_id, v.name AS vendor_name
FROM payments AS pay
JOIN bills AS b ON b.id = pay.bill_id
JOIN vendors AS v ON v.id = b.vendor_id
WHERE ($1 IS NULL OR pay.payment_date >= $1)
  AND ($2 IS NULL OR pay.payment_date <= $2)
ORDER BY pay.payment_date DESC, pay.id DESC;
