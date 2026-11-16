-- ForgeOS application query documentation
-- These are SQL equivalents of the Prisma operations in server/src.
-- Parameters use PostgreSQL positional placeholders ($1, $2, ...); the application supplies each value safely.
-- READ labels mean the statement retrieves data; WRITE labels mean it changes data.

-- Q01 READ
-- Authenticate a user by its normalized unique email.
SELECT id, name, email, password_hash, role, phone, is_active, -- Return the account details needed to identify and authenticate the user.
       last_login_at, created_at, updated_at -- Also return login and record timestamps for the caller.
FROM users -- Look for the account in the table that stores users.
WHERE email = $1; -- Match the supplied email exactly; the application normalizes it before querying.

-- Q02 WRITE
-- Record the successful login timestamp for the authenticated user.
UPDATE users -- Change an existing user record.
SET last_login_at = CURRENT_TIMESTAMP, -- Save the database's current time as the successful login time.
    updated_at = CURRENT_TIMESTAMP -- Keep the general modification time in sync with this update.
WHERE id = $1 -- Update only the user whose ID the application supplies.
RETURNING id, name, email, role, phone, is_active, created_at, updated_at; -- Return the updated account fields without returning the password hash.

-- Q03 READ
-- Paginated user list used by the user-management service.
SELECT id, name, email, role, phone, is_active, created_at, updated_at -- Return user-list fields while leaving out sensitive password data.
FROM users -- Read records from the users table.
WHERE ($1 IS NULL OR name ILIKE '%' || $1 || '%' -- If no search text is supplied, keep every user; otherwise search names case-insensitively.
       OR email ILIKE '%' || $1 || '%') -- Also match the same search text anywhere inside an email address.
ORDER BY created_at DESC -- Show the newest-created users first.
LIMIT $2 OFFSET $3; -- Return at most the requested page size, skipping rows from earlier pages.

-- Q04 READ
-- List lands visible to a PM through assigned projects.
SELECT DISTINCT l.* -- Return each land record once, even if several assigned projects refer to it.
FROM lands AS l -- Read the land records and give this table the short name l.
JOIN projects AS p ON p.land_id = l.id -- Match each land to projects that reference its ID.
WHERE p.assigned_pm_id = $1 -- Keep only lands linked to a project assigned to the supplied project manager.
ORDER BY l.created_at DESC -- Show the newest land records first.
LIMIT $2 OFFSET $3; -- Return one page of results using the requested size and starting offset.

-- Q05 READ
-- List projects with their land and assigned PM, scoped for a PM.
SELECT p.*, l.name AS land_name, l.city AS land_city, -- Return every project field plus readable location details from its land.
       u.id AS pm_id, u.name AS pm_name, u.email AS pm_email -- Include the assigned manager's identifying details under clear output names.
FROM projects AS p -- Use projects as the main records and abbreviate the table as p.
JOIN lands AS l ON l.id = p.land_id -- Add the land linked to each project; a project must have a matching land.
LEFT JOIN users AS u ON u.id = p.assigned_pm_id -- Add the manager when assigned, while still allowing projects with no manager.
WHERE p.assigned_pm_id = $1 -- Limit results to projects assigned to the supplied project manager.
ORDER BY p.created_at DESC -- Show recently created projects first.
LIMIT $2 OFFSET $3; -- Return only the requested page of projects.

-- Q06 WRITE
-- Create a project after the service has validated its land and assigned PM.
INSERT INTO projects ( -- Create a new row in the projects table.
  land_id, code, name, description, status, start_date, expected_end_date, -- Name the first group of columns that receive input or default values.
  actual_end_date, total_budget, wastage_threshold_pct, assigned_pm_id, -- Name additional project fields, including budget and manager.
  created_by_id, created_at, updated_at -- Record who created the project and when it was created or last updated.
) -- Finish listing the destination columns before supplying values.
VALUES ($1, $2, $3, $4, COALESCE($5, 'PLANNING'), $6, $7, $8, $9, $10, -- Fill the columns in the same order; use PLANNING if no status was provided.
        $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) -- Supply creator and manager IDs, then set both timestamps to the current time.
RETURNING *; -- Return the newly created project row, including its generated ID.

-- Q07 READ
-- Paginated daily logs for one project, including labour and machinery
-- aggregate values used by the application response.
SELECT dl.*, -- Return every field from each daily log.
       COALESCE(l.labour_head_count_total, 0) AS labour_head_count_total, -- Show the summed worker count, or zero when the log has no labour entries.
       COALESCE(m.machinery_hours_total, 0) AS machinery_hours_total -- Show summed machine hours, or zero when the log has no machinery entries.
FROM daily_logs AS dl -- Read daily logs and use dl as a short table name.
LEFT JOIN ( -- Attach optional labour totals while keeping logs that have no labour entries.
  SELECT daily_log_id, SUM(head_count) AS labour_head_count_total -- Add up worker head counts separately for each daily log.
  FROM labour_entries -- Read the individual labour records.
  GROUP BY daily_log_id -- Make one total row for each daily log ID.
) AS l ON l.daily_log_id = dl.id -- Link the labour totals back to their daily log.
LEFT JOIN ( -- Attach optional machinery totals without dropping logs that have no machinery entries.
  SELECT daily_log_id, SUM(hours_used) AS machinery_hours_total -- Add up machine-use hours separately for each daily log.
  FROM machinery_entries -- Read the individual machinery records.
  GROUP BY daily_log_id -- Make one total row for each daily log ID.
) AS m ON m.daily_log_id = dl.id -- Link the machinery totals back to their daily log.
WHERE dl.project_id = $1 -- Include only daily logs belonging to the supplied project.
  AND ($2 IS NULL OR dl.log_date >= $2) -- If a start date is supplied, exclude logs before it.
  AND ($3 IS NULL OR dl.log_date <= $3) -- If an end date is supplied, exclude logs after it.
ORDER BY dl.log_date DESC -- Show the most recent log dates first.
LIMIT $4 OFFSET $5; -- Return the requested page of logs.

-- Q08 WRITE
-- Create a daily log and its nested labour and machinery rows atomically.
-- The application performs this as one Prisma transaction.
WITH new_log AS ( -- Start a common table expression (CTE) that keeps the new log's ID available below.
  INSERT INTO daily_logs ( -- Create the main daily-log row first.
    project_id, log_date, progress_percent, work_summary, weather, issues, -- Specify the log details to store.
    created_by_id, created_at, updated_at -- Also store its creator and creation/update times.
  ) -- Finish listing columns for the daily-log row.
  VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) -- Fill those columns from inputs and set both timestamps now.
  RETURNING id -- Make the generated daily-log ID available to later parts of this statement.
), -- End the first CTE and separate it from the next one.
new_labour AS ( -- Start a second CTE to create the labour entry linked to the new log.
  INSERT INTO labour_entries -- Add a row describing the labour used on the log date.
    (daily_log_id, trade, contractor_name, head_count, hours_worked, remarks) -- Specify the foreign key and labour details to save.
  SELECT id, $8, $9, $10, $11, $12 -- Use the new log ID followed by the supplied labour values.
  FROM new_log -- Read the ID produced by the first CTE.
  RETURNING daily_log_id -- Return the linked log ID; this CTE also ensures the labour insert runs.
) -- End the labour CTE before the final insert.
INSERT INTO machinery_entries -- Add the machinery row associated with the same new daily log.
  (daily_log_id, machine_name, operator_name, hours_used, fuel_litres, remarks) -- Specify the link and machinery details to save.
SELECT id, $13, $14, $15, $16, $17 -- Pair the new log ID with the supplied machinery values.
FROM new_log -- Read the generated ID so this entry points to the log created above.
RETURNING *; -- Return the inserted machinery row so the caller can confirm what was created.

-- Q09 READ
-- Return a daily log with its labour, machinery, and linked stock rows.
SELECT dl.*, le.id AS labour_id, le.trade, le.head_count, le.hours_worked, -- Return the log and selected labour details, with a distinct name for each labour row ID.
       me.id AS machinery_id, me.machine_name, me.hours_used, me.fuel_litres, -- Include machinery details and label its ID distinctly from other IDs.
       st.id AS stock_transaction_id, st.txn_type, st.quantity, st.txn_date -- Include linked stock movement details and clearly label its ID.
FROM daily_logs AS dl -- Use the daily log as the main record being retrieved.
LEFT JOIN labour_entries AS le ON le.daily_log_id = dl.id -- Include labour rows when present, without losing a log that has none.
LEFT JOIN machinery_entries AS me ON me.daily_log_id = dl.id -- Include machinery rows when present, without requiring any.
LEFT JOIN stock_transactions AS st ON st.daily_log_id = dl.id -- Include stock transactions linked to the log, if there are any.
WHERE dl.id = $1; -- Retrieve only the log with the supplied ID.

-- Q10 WRITE
-- Replace nested labour and machinery rows during a daily-log update.
-- The deletes and update/inserts are executed in one transaction.
WITH deleted_labour AS ( -- Start a CTE that removes the log's old labour rows as part of this statement.
  DELETE FROM labour_entries WHERE daily_log_id = $1 RETURNING id -- Delete labour rows for this log and return their IDs to the CTE.
), -- Separate this deletion CTE from the next CTE.
deleted_machinery AS ( -- Start another CTE to remove the log's old machinery rows.
  DELETE FROM machinery_entries WHERE daily_log_id = $1 RETURNING id -- Delete machinery rows for this log and return their IDs to the CTE.
) -- Finish the CTE list before updating the daily log.
UPDATE daily_logs -- Change the main daily-log row.
SET progress_percent = COALESCE($2, progress_percent), -- Use new progress when provided; otherwise leave the current value unchanged.
    work_summary = COALESCE($3, work_summary), -- Replace the summary only when a non-NULL value was supplied.
    weather = COALESCE($4, weather), -- Replace the weather only when a non-NULL value was supplied.
    issues = COALESCE($5, issues), -- Replace the issues only when a non-NULL value was supplied.
    updated_at = CURRENT_TIMESTAMP -- Record when this update was made.
WHERE id = $1 -- Update only the daily log whose ID was supplied.
RETURNING *; -- Return the updated daily log row.

-- Q11 WRITE
-- Delete an ADMIN-authorized daily log; child labour and machinery rows
-- cascade according to the foreign keys, while stock links are set NULL.
DELETE FROM daily_logs -- Remove the selected daily-log record.
WHERE id = $1 -- Delete only the log with this supplied ID.
RETURNING id, project_id, log_date; -- Return key details so the caller knows which log was deleted.

-- Q12 WRITE
-- Create a project milestone and its CREATE audit event atomically.
WITH new_milestone AS ( -- Start a CTE that creates a milestone and exposes its saved fields to the audit insert.
  INSERT INTO project_milestones ( -- Add a new milestone to the project.
    project_id, name, description, sequence, planned_start_date, -- Specify its parent project, description, order, and planned start.
    planned_end_date, actual_start_date, actual_end_date, status, -- Specify its remaining dates and initial status.
    progress_percent, created_at, updated_at -- Specify its progress and record timestamps.
  ) -- Finish listing the columns that will receive values.
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, 'PLANNED'), -- Fill milestone fields from inputs; default a missing status to PLANNED.
          COALESCE($10, 0), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) -- Default missing progress to zero and set both timestamps to now.
  RETURNING * -- Pass the saved milestone, including its generated ID, to the next part.
) -- Finish defining the CTE before inserting the audit record.
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values) -- Create an audit record describing this milestone creation.
SELECT $11, 'CREATE', 'ProjectMilestone', id, -- Record the acting user, action, entity type, and new milestone ID.
       jsonb_build_object('id', id, 'projectId', project_id, 'name', name, -- Build a JSON snapshot containing important milestone fields.
                          'sequence', sequence, 'status', status, -- Add ordering and current status to the audit snapshot.
                          'progressPercent', progress_percent) -- Add the milestone's progress value to the snapshot.
FROM new_milestone -- Read the new milestone's fields from the CTE.
RETURNING *; -- Return the audit row so the caller can confirm the write.

-- Q13 READ
-- List milestones for a project in sequence and planned-date order.
SELECT id, project_id, name, description, sequence, planned_start_date, -- Return milestone identity, description, order, and planned start date.
       planned_end_date, actual_start_date, actual_end_date, status, -- Also return planned/actual dates and the current status.
       progress_percent, created_at, updated_at -- Include progress and record timestamps.
FROM project_milestones -- Read the rows from the milestone table.
WHERE project_id = $1 -- Include only milestones belonging to the supplied project.
ORDER BY sequence ASC, planned_start_date ASC NULLS LAST, id ASC; -- Sort by sequence and date (undated milestones last), then ID for stable ordering.

-- Q18 READ
-- List the project inventory balances derived from the project/material plan
-- and non-voided stock ledger.
SELECT pmp.material_id, m.name AS material_name, m.unit, -- Return the material ID, readable material name, and measurement unit.
       pmp.opening_quantity, -- Include the starting quantity from the project's material plan.
       COALESCE(SUM(st.quantity) FILTER (WHERE st.txn_type = 'IN'), 0) AS total_in, -- Sum incoming stock only; show zero if there are no such entries.
       COALESCE(SUM(st.quantity) FILTER (WHERE st.txn_type = 'OUT'), 0) AS total_out, -- Sum outgoing stock only; show zero when none exists.
       COALESCE(SUM(st.quantity) FILTER (WHERE st.txn_type = 'ADJUSTMENT' -- Begin summing adjustment rows, restricted to this transaction type.
         AND st.adjustment_direction = 'INCREASE'), 0) AS adjustment_in, -- Count increases only and show zero if none exist.
       COALESCE(SUM(st.quantity) FILTER (WHERE st.txn_type = 'ADJUSTMENT' -- Begin a separate sum for adjustment transactions.
         AND st.adjustment_direction = 'DECREASE'), 0) AS adjustment_out -- Count decreases only and show zero if none exist.
FROM project_material_plans AS pmp -- Start with the project's planned material quantities.
JOIN materials AS m ON m.id = pmp.material_id -- Add the material's name and unit by matching its ID.
LEFT JOIN stock_transactions AS st -- Add ledger entries when they exist; keep planned materials that have none.
  ON st.project_id = pmp.project_id AND st.material_id = pmp.material_id -- Match each ledger row to the same project and material.
 AND st.is_voided = false -- Exclude voided transactions from the totals.
WHERE pmp.project_id = $1 -- Calculate balances only for the supplied project.
GROUP BY pmp.material_id, m.name, m.unit, pmp.opening_quantity -- Produce one aggregate result per planned material and its descriptive fields.
ORDER BY m.name; -- Present the material balances alphabetically by name.

-- Q19 WRITE
-- Record a stock transaction and its audit event in one transaction. The
-- service obtains a project/material advisory lock and checks the balance
-- before executing this write.
WITH new_transaction AS ( -- Start a CTE that creates the stock row and makes its saved fields available to the audit insert.
  INSERT INTO stock_transactions ( -- Record one stock movement in the inventory ledger.
    project_id, material_id, txn_type, quantity, unit_rate, vendor_id, bill_id, -- Specify its project, material, movement type, quantity, rate, vendor, and bill.
    challan_number, out_reason, adjustment_direction, txn_date, daily_log_id, -- Specify delivery reference, reason/direction, date, and optional linked daily log.
    remarks, created_by_id -- Store additional notes and the user who recorded this transaction.
  ) -- Finish listing columns for the stock transaction.
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) -- Supply values for those columns in the same order.
  RETURNING * -- Make the inserted transaction's generated ID and details available to the audit insert.
) -- Finish defining the CTE.
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values) -- Add an audit record for this stock transaction in the same statement.
SELECT $14, 'CREATE', 'StockTransaction', id, -- Record the actor ($14 is also the transaction's created_by_id), action, entity type, and transaction ID.
       jsonb_build_object('id', id, 'projectId', project_id, -- Begin a JSON snapshot with the transaction ID and project ID.
                          'materialId', material_id, 'txnType', txn_type, -- Add which material moved and the movement type.
                          'quantity', quantity, 'txnDate', txn_date) -- Add the moved quantity and transaction date to the snapshot.
FROM new_transaction -- Read the inserted transaction's values from the CTE.
RETURNING *; -- Return the audit row so the caller can confirm the operation.

-- Q20 READ
-- Return wastage inputs from the project plans and non-voided OUT ledger.
SELECT pmp.material_id, m.name AS material_name, m.unit, -- Return each planned material's ID, readable name, and measurement unit.
       pmp.planned_quantity, pmp.planned_unit_rate, -- Include the planned amount and the planned cost per unit for comparison.
       COALESCE(SUM(st.quantity), 0) AS consumed_quantity, -- Sum qualifying outgoing quantities, using zero when there are no matching stock rows.
       COALESCE(SUM(st.quantity) FILTER -- Start a separate sum that counts only outgoing stock marked as wastage.
         (WHERE st.out_reason IN ('DAMAGED', 'LOST')), 0) AS recorded_wastage_quantity -- Include only damaged/lost quantities and return zero if none were recorded.
FROM project_material_plans AS pmp -- Start with the project's planned material records.
JOIN materials AS m ON m.id = pmp.material_id -- Add the material's display name and unit by matching its ID.
LEFT JOIN stock_transactions AS st -- Include matching ledger rows when present while retaining plans without transactions.
  ON st.project_id = pmp.project_id AND st.material_id = pmp.material_id -- Match ledger rows to the same project and material plan.
 AND st.txn_type = 'OUT' AND st.is_voided = false -- Count only non-voided outgoing stock, not incoming or adjustment rows.
WHERE pmp.project_id = $1 -- Calculate these values for the supplied project only.
GROUP BY pmp.material_id, m.name, m.unit, pmp.planned_quantity, -- Group the output so each material plan gets its own aggregate totals.
         pmp.planned_unit_rate; -- Also group by planned unit cost because it is returned above.

-- Q21 WRITE
-- Update milestone fields. The application records changed fields in its
-- surrounding audit transaction.
UPDATE project_milestones -- Modify an existing project milestone.
SET name = COALESCE($2, name), -- Change the name if supplied; otherwise preserve the existing name.
    description = COALESCE($3, description), -- Change the description only when the input is not NULL.
    sequence = COALESCE($4, sequence), -- Change the milestone's order only when a new order is supplied.
    status = COALESCE($5, status), -- Change the status only when a new status is supplied.
    progress_percent = COALESCE($6, progress_percent), -- Change progress only when a new percentage is supplied.
    updated_at = CURRENT_TIMESTAMP -- Record the time this milestone was modified.
WHERE id = $1 -- Apply the changes only to the milestone with this ID.
RETURNING *; -- Return all fields of the updated milestone.

-- Q22 WRITE
-- Delete a milestone. The application retains the old snapshot in its
-- surrounding audit transaction.
DELETE FROM project_milestones -- Remove the selected project milestone.
WHERE id = $1 -- Delete only the milestone with the supplied ID.
RETURNING *; -- Return the deleted values so the caller can retain its before-delete snapshot.

-- Q23 READ
-- List vendors visible to an actor. PM visibility is implemented by the
-- service through active assignments on projects assigned to that PM.
SELECT DISTINCT v.* -- Return each matching vendor once, even if it has several active project assignments.
FROM vendors AS v -- Start with vendor records and refer to this table using v.
LEFT JOIN project_vendor_assignments AS pva -- Look up assignments so project managers can see vendors assigned to their projects.
  ON pva.vendor_id = v.id AND pva.unassigned_at IS NULL -- Match the vendor and consider only assignments that have not ended.
LEFT JOIN projects AS p ON p.id = pva.project_id -- Find each assignment's project to check its assigned manager.
WHERE ($1 = 'ADMIN' OR p.assigned_pm_id = $2) -- Allow admins to see vendors, or limit other actors to the supplied manager's projects.
  AND ($3 IS NULL OR v.is_active = $3) -- If an active-state filter is supplied, require the vendor to match it.
  AND ($4 IS NULL OR v.name ILIKE '%' || $4 || '%') -- If search text is supplied, match it anywhere in the vendor name, ignoring case.
ORDER BY v.name; -- List matching vendors alphabetically.

-- Q24 WRITE
-- Create a bill with server-computed GST and total, then audit it atomically.
WITH new_bill AS ( -- Start a CTE that creates the bill and exposes its saved fields for the audit insert.
  INSERT INTO bills ( -- Add a bill record for a project and vendor.
    project_id, vendor_id, bill_number, bill_date, due_date, category, -- Specify the bill's project, vendor, identifying number, dates, and category.
    description, base_amount, gst_percent, gst_amount, total_amount, -- Specify its description and pre-tax/tax/final amounts.
    status, submitted_by_id, updated_at -- Specify initial status, submitting user, and last-updated time.
  ) -- Finish listing the bill columns.
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, -- Supply the project, vendor, bill details, base amount, and GST rate.
          ROUND($8 * $9 / 100, 2), -- Calculate GST as base amount times rate, rounded to two decimal places.
          $8 + ROUND($8 * $9 / 100, 2), -- Calculate the total by adding the rounded GST to the base amount.
          'PENDING', $10, CURRENT_TIMESTAMP) -- Start the bill as pending and record its submitter and update time.
  RETURNING * -- Make the inserted bill fields available for creating the audit record.
) -- Finish the bill CTE before inserting its audit event.
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values) -- Record the bill creation in the audit table.
SELECT $10, 'CREATE', 'Bill', id, -- Record the submitter ($10 is also submitted_by_id above), create action, bill type, and new bill ID.
       jsonb_build_object('id', id, 'projectId', project_id, -- Start a JSON snapshot with the bill ID and project.
                          'vendorId', vendor_id, 'billNumber', bill_number, -- Add the vendor and bill number to the snapshot.
                          'totalAmount', total_amount, 'status', status) -- Add the calculated total and initial status.
FROM new_bill -- Read the bill details just inserted by the CTE.
RETURNING *; -- Return the new audit record.

-- Q25 READ
-- Calculate paid and outstanding amounts without payment join fan-out.
SELECT b.id, b.bill_number, b.total_amount, -- Return the bill's identifier, number, and full amount owed.
       COALESCE(p.paid_amount, 0) AS paid_amount, -- Show the summed payments, treating a bill with none as paid amount zero.
       b.total_amount - COALESCE(p.paid_amount, 0) AS outstanding_amount -- Subtract payments from the total to calculate the remaining balance.
FROM bills AS b -- Use bills as the main rows and abbreviate the table as b.
LEFT JOIN ( -- Attach one pre-calculated payment total per bill to avoid duplicating bill rows.
  SELECT bill_id, SUM(amount) AS paid_amount -- Add together all payment amounts for each bill.
  FROM payments -- Read the individual payment records.
  GROUP BY bill_id -- Produce one total per bill rather than one row per payment.
) AS p ON p.bill_id = b.id -- Match each payment total with its bill.
WHERE b.project_id = $1; -- Return balances only for bills in the supplied project.

-- Q26 WRITE
-- Record a payment row. The application updates bill status and writes the
-- audit event in its surrounding transaction.
INSERT INTO payments ( -- Add a payment record to the payments table.
  bill_id, amount, payment_date, mode, reference_number, remarks, recorded_by_id -- Specify which bill was paid, how much, when, how, and by whom.
) -- Finish listing the payment columns.
VALUES ($1, $2, $3, $4, $5, $6, $7) -- Supply values for the listed columns in exactly the same order.
RETURNING *; -- Return the inserted payment row, including its generated ID.

-- Q27 READ
-- Payment history with optional date filtering and project scoping.
SELECT pay.*, b.bill_number, b.project_id, v.name AS vendor_name -- Return payment details plus bill and vendor context for each payment.
FROM payments AS pay -- Read the payment history and abbreviate its table as pay.
JOIN bills AS b ON b.id = pay.bill_id -- Find the bill associated with each payment.
JOIN vendors AS v ON v.id = b.vendor_id -- Find the vendor associated with that bill.
WHERE ($1 IS NULL OR pay.payment_date >= $1) -- If a start date is supplied, include payments on or after it.
  AND ($2 IS NULL OR pay.payment_date <= $2) -- If an end date is supplied, include payments on or before it.
ORDER BY pay.payment_date DESC, pay.id DESC; -- Show newest payments first, using ID to break ties consistently.
-- File purpose: Documents SQL query patterns used to study ForgeOS data access.
