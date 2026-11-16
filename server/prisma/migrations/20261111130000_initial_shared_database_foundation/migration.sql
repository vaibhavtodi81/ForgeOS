-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PM'); -- Creates the `Role` enum so database columns can accept only its listed values.

-- CreateEnum
CREATE TYPE "AreaUnit" AS ENUM ('SQFT', 'SQYD', 'SQM', 'ACRE'); -- Creates the `AreaUnit` enum so database columns can accept only its listed values.

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED'); -- Creates the `ProjectStatus` enum so database columns can accept only its listed values.

-- CreateEnum
CREATE TYPE "MaterialCategory" AS ENUM ('CEMENT', 'STEEL', 'SAND_AGGREGATE', 'BRICKS_BLOCKS', 'TIMBER', 'ELECTRICAL', 'PLUMBING', 'PAINT_FINISH', 'OTHER'); -- Creates the `MaterialCategory` enum so database columns can accept only its listed values.

-- CreateEnum
CREATE TYPE "StockTxnType" AS ENUM ('IN', 'OUT'); -- Creates the `StockTxnType` enum so database columns can accept only its listed values.

-- CreateEnum
CREATE TYPE "OutReason" AS ENUM ('USED', 'DAMAGED', 'LOST'); -- Creates the `OutReason` enum so database columns can accept only its listed values.

-- CreateEnum
CREATE TYPE "BillCategory" AS ENUM ('MATERIAL', 'LABOUR', 'MACHINERY', 'SERVICES', 'OTHER'); -- Creates the `BillCategory` enum so database columns can accept only its listed values.

-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PARTIALLY_PAID', 'PAID'); -- Creates the `BillStatus` enum so database columns can accept only its listed values.

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'OTHER'); -- Creates the `PaymentMode` enum so database columns can accept only its listed values.

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'VOID', 'LOGIN'); -- Creates the `AuditAction` enum so database columns can accept only its listed values.

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('LOW_STOCK', 'WASTAGE_ALERT', 'BILL_OVERDUE', 'BILL_SUBMITTED', 'BILL_APPROVED', 'BILL_REJECTED', 'BUDGET_ALERT'); -- Creates the `NotificationType` enum so database columns can accept only its listed values.

-- CreateTable
CREATE TABLE "users" ( -- Creates the `users` table to store records for this feature.
    "id" SERIAL NOT NULL, -- Stores the unique identifier for this record in `id` on `users`. This column is required.
    "name" TEXT NOT NULL, -- Stores the human-readable name in `name` on `users`. This column is required.
    "email" TEXT NOT NULL, -- Stores the contact or sign-in email address in `email` on `users`. This column is required.
    "password_hash" TEXT NOT NULL, -- Stores the securely hashed password rather than the plain-text password in `password_hash` on `users`. This column is required.
    "role" "Role" NOT NULL DEFAULT 'PM', -- Stores the account's permission level in `role` on `users`. This column is required. The database supplies a default when an insert omits it.
    "phone" TEXT, -- Stores the phone value in `phone` on `users`. This column may be left empty.
    "is_active" BOOLEAN NOT NULL DEFAULT true, -- Stores whether the account or record can currently be used in `is_active` on `users`. This column is required. The database supplies a default when an insert omits it.
    "last_login_at" TIMESTAMP(3), -- Stores when the account last signed in in `last_login_at` on `users`. This column may be left empty.
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Stores when the record was created in `created_at` on `users`. This column is required. The database supplies a default when an insert omits it.
    "updated_at" TIMESTAMP(3) NOT NULL, -- Stores when the record was last changed in `updated_at` on `users`. This column is required.

    CONSTRAINT "users_pkey" PRIMARY KEY ("id") -- Marks the record identifier as the primary key so each row can be uniquely referenced.
); -- Ends this table or enum definition so the next migration statement can run.

-- CreateTable
CREATE TABLE "lands" ( -- Creates the `lands` table to store records for this feature.
    "id" SERIAL NOT NULL, -- Stores the unique identifier for this record in `id` on `lands`. This column is required.
    "name" TEXT NOT NULL, -- Stores the human-readable name in `name` on `lands`. This column is required.
    "address_line" TEXT, -- Stores the street address for the site in `address_line` on `lands`. This column may be left empty.
    "city" TEXT NOT NULL, -- Stores the city where the site is located in `city` on `lands`. This column is required.
    "state" TEXT NOT NULL, -- Stores the state where the site is located in `state` on `lands`. This column is required.
    "pincode" TEXT, -- Stores the postal code for the site in `pincode` on `lands`. This column may be left empty.
    "area_value" DECIMAL(14,2) NOT NULL, -- Stores the measured size of the land in `area_value` on `lands`. This column is required.
    "area_unit" "AreaUnit" NOT NULL, -- Stores the unit used to measure the land in `area_unit` on `lands`. This column is required.
    "survey_number" TEXT, -- Stores the official land survey reference in `survey_number` on `lands`. This column may be left empty.
    "owner_name" TEXT, -- Stores the land owner's name in `owner_name` on `lands`. This column may be left empty.
    "purchase_date" DATE, -- Stores when the land was purchased in `purchase_date` on `lands`. This column may be left empty.
    "purchase_cost" DECIMAL(16,2), -- Stores the amount paid for the land in `purchase_cost` on `lands`. This column may be left empty.
    "notes" TEXT, -- Stores the notes value in `notes` on `lands`. This column may be left empty.
    "created_by_id" INTEGER NOT NULL, -- Stores the user who created this record in `created_by_id` on `lands`. This column is required.
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Stores when the record was created in `created_at` on `lands`. This column is required. The database supplies a default when an insert omits it.
    "updated_at" TIMESTAMP(3) NOT NULL, -- Stores when the record was last changed in `updated_at` on `lands`. This column is required.

    CONSTRAINT "lands_pkey" PRIMARY KEY ("id") -- Marks the record identifier as the primary key so each row can be uniquely referenced.
); -- Ends this table or enum definition so the next migration statement can run.

-- CreateTable
CREATE TABLE "projects" ( -- Creates the `projects` table to store records for this feature.
    "id" SERIAL NOT NULL, -- Stores the unique identifier for this record in `id` on `projects`. This column is required.
    "land_id" INTEGER NOT NULL, -- Stores the land site linked to the project in `land_id` on `projects`. This column is required.
    "code" TEXT NOT NULL, -- Stores the short business reference in `code` on `projects`. This column is required.
    "name" TEXT NOT NULL, -- Stores the human-readable name in `name` on `projects`. This column is required.
    "description" TEXT, -- Stores the description value in `description` on `projects`. This column may be left empty.
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNING', -- Stores the current workflow state in `status` on `projects`. This column is required. The database supplies a default when an insert omits it.
    "start_date" DATE, -- Stores when the work is planned to begin in `start_date` on `projects`. This column may be left empty.
    "expected_end_date" DATE, -- Stores the planned completion date in `expected_end_date` on `projects`. This column may be left empty.
    "actual_end_date" DATE, -- Stores the date work was actually completed in `actual_end_date` on `projects`. This column may be left empty.
    "total_budget" DECIMAL(16,2) NOT NULL DEFAULT 0, -- Stores the approved project budget in `total_budget` on `projects`. This column is required. The database supplies a default when an insert omits it.
    "wastage_threshold_pct" DECIMAL(5,2) NOT NULL DEFAULT 10, -- Stores the wastage percentage that triggers an alert in `wastage_threshold_pct` on `projects`. This column is required. The database supplies a default when an insert omits it.
    "assigned_pm_id" INTEGER, -- Stores the project manager responsible for the project in `assigned_pm_id` on `projects`. This column may be left empty.
    "created_by_id" INTEGER NOT NULL, -- Stores the user who created this record in `created_by_id` on `projects`. This column is required.
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Stores when the record was created in `created_at` on `projects`. This column is required. The database supplies a default when an insert omits it.
    "updated_at" TIMESTAMP(3) NOT NULL, -- Stores when the record was last changed in `updated_at` on `projects`. This column is required.

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id") -- Marks the record identifier as the primary key so each row can be uniquely referenced.
); -- Ends this table or enum definition so the next migration statement can run.

-- CreateTable
CREATE TABLE "materials" ( -- Creates the `materials` table to store records for this feature.
    "id" SERIAL NOT NULL, -- Stores the unique identifier for this record in `id` on `materials`. This column is required.
    "name" TEXT NOT NULL, -- Stores the human-readable name in `name` on `materials`. This column is required.
    "category" "MaterialCategory" NOT NULL, -- Stores the business category of this record in `category` on `materials`. This column is required.
    "unit" TEXT NOT NULL, -- Stores the unit value in `unit` on `materials`. This column is required.
    "is_active" BOOLEAN NOT NULL DEFAULT true, -- Stores whether the account or record can currently be used in `is_active` on `materials`. This column is required. The database supplies a default when an insert omits it.
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Stores when the record was created in `created_at` on `materials`. This column is required. The database supplies a default when an insert omits it.
    "updated_at" TIMESTAMP(3) NOT NULL, -- Stores when the record was last changed in `updated_at` on `materials`. This column is required.

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id") -- Marks the record identifier as the primary key so each row can be uniquely referenced.
); -- Ends this table or enum definition so the next migration statement can run.

-- CreateTable
CREATE TABLE "vendors" ( -- Creates the `vendors` table to store records for this feature.
    "id" SERIAL NOT NULL, -- Stores the unique identifier for this record in `id` on `vendors`. This column is required.
    "name" TEXT NOT NULL, -- Stores the human-readable name in `name` on `vendors`. This column is required.
    "contact_person" TEXT, -- Stores the vendor's primary contact in `contact_person` on `vendors`. This column may be left empty.
    "phone" TEXT, -- Stores the phone value in `phone` on `vendors`. This column may be left empty.
    "email" TEXT, -- Stores the contact or sign-in email address in `email` on `vendors`. This column may be left empty.
    "gstin" TEXT, -- Stores the vendor's tax registration number in `gstin` on `vendors`. This column may be left empty.
    "address" TEXT, -- Stores the address value in `address` on `vendors`. This column may be left empty.
    "is_active" BOOLEAN NOT NULL DEFAULT true, -- Stores whether the account or record can currently be used in `is_active` on `vendors`. This column is required. The database supplies a default when an insert omits it.
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Stores when the record was created in `created_at` on `vendors`. This column is required. The database supplies a default when an insert omits it.
    "updated_at" TIMESTAMP(3) NOT NULL, -- Stores when the record was last changed in `updated_at` on `vendors`. This column is required.

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id") -- Marks the record identifier as the primary key so each row can be uniquely referenced.
); -- Ends this table or enum definition so the next migration statement can run.

-- CreateTable
CREATE TABLE "project_material_plans" ( -- Creates the `project_material_plans` table to store records for this feature.
    "id" SERIAL NOT NULL, -- Stores the unique identifier for this record in `id` on `project_material_plans`. This column is required.
    "project_id" INTEGER NOT NULL, -- Stores the project this record belongs to in `project_id` on `project_material_plans`. This column is required.
    "material_id" INTEGER NOT NULL, -- Stores the material referenced by this record in `material_id` on `project_material_plans`. This column is required.
    "planned_quantity" DECIMAL(14,3) NOT NULL, -- Stores the planned quantity value in `planned_quantity` on `project_material_plans`. This column is required.
    "planned_unit_rate" DECIMAL(12,2), -- Stores the planned unit rate value in `planned_unit_rate` on `project_material_plans`. This column may be left empty.
    "low_stock_threshold" DECIMAL(14,3), -- Stores the low stock threshold value in `low_stock_threshold` on `project_material_plans`. This column may be left empty.
    "wastage_threshold_pct" DECIMAL(5,2), -- Stores the wastage percentage that triggers an alert in `wastage_threshold_pct` on `project_material_plans`. This column may be left empty.
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Stores when the record was created in `created_at` on `project_material_plans`. This column is required. The database supplies a default when an insert omits it.
    "updated_at" TIMESTAMP(3) NOT NULL, -- Stores when the record was last changed in `updated_at` on `project_material_plans`. This column is required.

    CONSTRAINT "project_material_plans_pkey" PRIMARY KEY ("id") -- Marks the record identifier as the primary key so each row can be uniquely referenced.
); -- Ends this table or enum definition so the next migration statement can run.

-- CreateTable
CREATE TABLE "daily_logs" ( -- Creates the `daily_logs` table to store records for this feature.
    "id" SERIAL NOT NULL, -- Stores the unique identifier for this record in `id` on `daily_logs`. This column is required.
    "project_id" INTEGER NOT NULL, -- Stores the project this record belongs to in `project_id` on `daily_logs`. This column is required.
    "log_date" DATE NOT NULL, -- Stores the date covered by the daily report in `log_date` on `daily_logs`. This column is required.
    "progress_percent" DECIMAL(5,2) NOT NULL, -- Stores the reported project completion percentage in `progress_percent` on `daily_logs`. This column is required.
    "work_summary" TEXT NOT NULL, -- Stores the work completed that day in `work_summary` on `daily_logs`. This column is required.
    "weather" TEXT, -- Stores the weather value in `weather` on `daily_logs`. This column may be left empty.
    "issues" TEXT, -- Stores the issues value in `issues` on `daily_logs`. This column may be left empty.
    "created_by_id" INTEGER NOT NULL, -- Stores the user who created this record in `created_by_id` on `daily_logs`. This column is required.
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Stores when the record was created in `created_at` on `daily_logs`. This column is required. The database supplies a default when an insert omits it.
    "updated_at" TIMESTAMP(3) NOT NULL, -- Stores when the record was last changed in `updated_at` on `daily_logs`. This column is required.

    CONSTRAINT "daily_logs_pkey" PRIMARY KEY ("id") -- Marks the record identifier as the primary key so each row can be uniquely referenced.
); -- Ends this table or enum definition so the next migration statement can run.

-- CreateTable
CREATE TABLE "labour_entries" ( -- Creates the `labour_entries` table to store records for this feature.
    "id" SERIAL NOT NULL, -- Stores the unique identifier for this record in `id` on `labour_entries`. This column is required.
    "daily_log_id" INTEGER NOT NULL, -- Stores the daily report associated with this entry in `daily_log_id` on `labour_entries`. This column is required.
    "trade" TEXT NOT NULL, -- Stores the trade value in `trade` on `labour_entries`. This column is required.
    "contractor_name" TEXT, -- Stores the contractor name value in `contractor_name` on `labour_entries`. This column may be left empty.
    "head_count" INTEGER NOT NULL, -- Stores the number of workers recorded in `head_count` on `labour_entries`. This column is required.
    "hours_worked" DECIMAL(4,1) NOT NULL DEFAULT 8, -- Stores the labour hours recorded in `hours_worked` on `labour_entries`. This column is required. The database supplies a default when an insert omits it.
    "remarks" TEXT, -- Stores the remarks value in `remarks` on `labour_entries`. This column may be left empty.

    CONSTRAINT "labour_entries_pkey" PRIMARY KEY ("id") -- Marks the record identifier as the primary key so each row can be uniquely referenced.
); -- Ends this table or enum definition so the next migration statement can run.

-- CreateTable
CREATE TABLE "machinery_entries" ( -- Creates the `machinery_entries` table to store records for this feature.
    "id" SERIAL NOT NULL, -- Stores the unique identifier for this record in `id` on `machinery_entries`. This column is required.
    "daily_log_id" INTEGER NOT NULL, -- Stores the daily report associated with this entry in `daily_log_id` on `machinery_entries`. This column is required.
    "machine_name" TEXT NOT NULL, -- Stores the machine used on site in `machine_name` on `machinery_entries`. This column is required.
    "operator_name" TEXT, -- Stores the operator name value in `operator_name` on `machinery_entries`. This column may be left empty.
    "hours_used" DECIMAL(5,2) NOT NULL, -- Stores how long the machine was used in `hours_used` on `machinery_entries`. This column is required.
    "fuel_litres" DECIMAL(8,2), -- Stores the amount of fuel consumed in `fuel_litres` on `machinery_entries`. This column may be left empty.
    "remarks" TEXT, -- Stores the remarks value in `remarks` on `machinery_entries`. This column may be left empty.

    CONSTRAINT "machinery_entries_pkey" PRIMARY KEY ("id") -- Marks the record identifier as the primary key so each row can be uniquely referenced.
); -- Ends this table or enum definition so the next migration statement can run.

-- CreateTable
CREATE TABLE "stock_transactions" ( -- Creates the `stock_transactions` table to store records for this feature.
    "id" SERIAL NOT NULL, -- Stores the unique identifier for this record in `id` on `stock_transactions`. This column is required.
    "project_id" INTEGER NOT NULL, -- Stores the project this record belongs to in `project_id` on `stock_transactions`. This column is required.
    "material_id" INTEGER NOT NULL, -- Stores the material referenced by this record in `material_id` on `stock_transactions`. This column is required.
    "txn_type" "StockTxnType" NOT NULL, -- Stores whether stock is entering, leaving, or being adjusted in `txn_type` on `stock_transactions`. This column is required.
    "quantity" DECIMAL(14,3) NOT NULL, -- Stores the amount of material involved in `quantity` on `stock_transactions`. This column is required.
    "unit_rate" DECIMAL(12,2), -- Stores the price for one unit in `unit_rate` on `stock_transactions`. This column may be left empty.
    "vendor_id" INTEGER, -- Stores the supplier or contractor linked to this record in `vendor_id` on `stock_transactions`. This column may be left empty.
    "bill_id" INTEGER, -- Stores the bill linked to this transaction or payment in `bill_id` on `stock_transactions`. This column may be left empty.
    "challan_number" TEXT, -- Stores the challan number value in `challan_number` on `stock_transactions`. This column may be left empty.
    "out_reason" "OutReason", -- Stores the out reason value in `out_reason` on `stock_transactions`. This column may be left empty.
    "txn_date" DATE NOT NULL, -- Stores when the stock movement occurred in `txn_date` on `stock_transactions`. This column is required.
    "daily_log_id" INTEGER, -- Stores the daily report associated with this entry in `daily_log_id` on `stock_transactions`. This column may be left empty.
    "remarks" TEXT, -- Stores the remarks value in `remarks` on `stock_transactions`. This column may be left empty.
    "created_by_id" INTEGER NOT NULL, -- Stores the user who created this record in `created_by_id` on `stock_transactions`. This column is required.
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Stores when the record was created in `created_at` on `stock_transactions`. This column is required. The database supplies a default when an insert omits it.
    "is_voided" BOOLEAN NOT NULL DEFAULT false, -- Stores the is voided value in `is_voided` on `stock_transactions`. This column is required. The database supplies a default when an insert omits it.
    "voided_by_id" INTEGER, -- Stores the voided by id value in `voided_by_id` on `stock_transactions`. This column may be left empty.
    "voided_at" TIMESTAMP(3), -- Stores the voided at value in `voided_at` on `stock_transactions`. This column may be left empty.
    "void_reason" TEXT, -- Stores the void reason value in `void_reason` on `stock_transactions`. This column may be left empty.

    CONSTRAINT "stock_transactions_pkey" PRIMARY KEY ("id") -- Marks the record identifier as the primary key so each row can be uniquely referenced.
); -- Ends this table or enum definition so the next migration statement can run.

-- CreateTable
CREATE TABLE "bills" ( -- Creates the `bills` table to store records for this feature.
    "id" SERIAL NOT NULL, -- Stores the unique identifier for this record in `id` on `bills`. This column is required.
    "project_id" INTEGER NOT NULL, -- Stores the project this record belongs to in `project_id` on `bills`. This column is required.
    "vendor_id" INTEGER NOT NULL, -- Stores the supplier or contractor linked to this record in `vendor_id` on `bills`. This column is required.
    "bill_number" TEXT NOT NULL, -- Stores the vendor's invoice reference in `bill_number` on `bills`. This column is required.
    "bill_date" DATE NOT NULL, -- Stores the date on the vendor's bill in `bill_date` on `bills`. This column is required.
    "due_date" DATE, -- Stores when payment is due in `due_date` on `bills`. This column may be left empty.
    "category" "BillCategory" NOT NULL, -- Stores the business category of this record in `category` on `bills`. This column is required.
    "description" TEXT, -- Stores the description value in `description` on `bills`. This column may be left empty.
    "base_amount" DECIMAL(14,2) NOT NULL, -- Stores the bill amount before tax in `base_amount` on `bills`. This column is required.
    "gst_percent" DECIMAL(5,2) NOT NULL DEFAULT 0, -- Stores the tax rate applied to the bill in `gst_percent` on `bills`. This column is required. The database supplies a default when an insert omits it.
    "gst_amount" DECIMAL(14,2) NOT NULL, -- Stores the calculated tax amount in `gst_amount` on `bills`. This column is required.
    "total_amount" DECIMAL(14,2) NOT NULL, -- Stores the full amount including tax in `total_amount` on `bills`. This column is required.
    "status" "BillStatus" NOT NULL DEFAULT 'PENDING', -- Stores the current workflow state in `status` on `bills`. This column is required. The database supplies a default when an insert omits it.
    "submitted_by_id" INTEGER NOT NULL, -- Stores the user who submitted the bill in `submitted_by_id` on `bills`. This column is required.
    "approved_by_id" INTEGER, -- Stores the user who approved the bill in `approved_by_id` on `bills`. This column may be left empty.
    "approved_at" TIMESTAMP(3), -- Stores the approved at value in `approved_at` on `bills`. This column may be left empty.
    "rejection_reason" TEXT, -- Stores the rejection reason value in `rejection_reason` on `bills`. This column may be left empty.
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Stores when the record was created in `created_at` on `bills`. This column is required. The database supplies a default when an insert omits it.
    "updated_at" TIMESTAMP(3) NOT NULL, -- Stores when the record was last changed in `updated_at` on `bills`. This column is required.

    CONSTRAINT "bills_pkey" PRIMARY KEY ("id") -- Marks the record identifier as the primary key so each row can be uniquely referenced.
); -- Ends this table or enum definition so the next migration statement can run.

-- CreateTable
CREATE TABLE "payments" ( -- Creates the `payments` table to store records for this feature.
    "id" SERIAL NOT NULL, -- Stores the unique identifier for this record in `id` on `payments`. This column is required.
    "bill_id" INTEGER NOT NULL, -- Stores the bill linked to this transaction or payment in `bill_id` on `payments`. This column is required.
    "amount" DECIMAL(14,2) NOT NULL, -- Stores the amount value in `amount` on `payments`. This column is required.
    "payment_date" DATE NOT NULL, -- Stores the payment date value in `payment_date` on `payments`. This column is required.
    "mode" "PaymentMode" NOT NULL, -- Stores the mode value in `mode` on `payments`. This column is required.
    "reference_number" TEXT, -- Stores the reference number value in `reference_number` on `payments`. This column may be left empty.
    "remarks" TEXT, -- Stores the remarks value in `remarks` on `payments`. This column may be left empty.
    "recorded_by_id" INTEGER NOT NULL, -- Stores the recorded by id value in `recorded_by_id` on `payments`. This column is required.
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Stores when the record was created in `created_at` on `payments`. This column is required. The database supplies a default when an insert omits it.

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id") -- Marks the record identifier as the primary key so each row can be uniquely referenced.
); -- Ends this table or enum definition so the next migration statement can run.

-- CreateTable
CREATE TABLE "audit_logs" ( -- Creates the `audit_logs` table to store records for this feature.
    "id" SERIAL NOT NULL, -- Stores the unique identifier for this record in `id` on `audit_logs`. This column is required.
    "user_id" INTEGER, -- Stores the user id value in `user_id` on `audit_logs`. This column may be left empty.
    "action" "AuditAction" NOT NULL, -- Stores the activity performed on the record in `action` on `audit_logs`. This column is required.
    "entity_type" TEXT NOT NULL, -- Stores the kind of record that changed in `entity_type` on `audit_logs`. This column is required.
    "entity_id" INTEGER, -- Stores the identifier of the record that changed in `entity_id` on `audit_logs`. This column may be left empty.
    "old_values" JSONB, -- Stores the record values before the change in `old_values` on `audit_logs`. This column may be left empty.
    "new_values" JSONB, -- Stores the record values after the change in `new_values` on `audit_logs`. This column may be left empty.
    "ip_address" TEXT, -- Stores the ip address value in `ip_address` on `audit_logs`. This column may be left empty.
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Stores when the record was created in `created_at` on `audit_logs`. This column is required. The database supplies a default when an insert omits it.

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id") -- Marks the record identifier as the primary key so each row can be uniquely referenced.
); -- Ends this table or enum definition so the next migration statement can run.

-- CreateTable
CREATE TABLE "notifications" ( -- Creates the `notifications` table to store records for this feature.
    "id" SERIAL NOT NULL, -- Stores the unique identifier for this record in `id` on `notifications`. This column is required.
    "user_id" INTEGER NOT NULL, -- Stores the user id value in `user_id` on `notifications`. This column is required.
    "type" "NotificationType" NOT NULL, -- Stores the type value in `type` on `notifications`. This column is required.
    "title" TEXT NOT NULL, -- Stores the title value in `title` on `notifications`. This column is required.
    "message" TEXT NOT NULL, -- Stores the text shown in the notification in `message` on `notifications`. This column is required.
    "project_id" INTEGER, -- Stores the project this record belongs to in `project_id` on `notifications`. This column may be left empty.
    "link" TEXT, -- Stores the link value in `link` on `notifications`. This column may be left empty.
    "is_read" BOOLEAN NOT NULL DEFAULT false, -- Stores the is read value in `is_read` on `notifications`. This column is required. The database supplies a default when an insert omits it.
    "dedupe_key" TEXT, -- Stores the dedupe key value in `dedupe_key` on `notifications`. This column may be left empty.
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Stores when the record was created in `created_at` on `notifications`. This column is required. The database supplies a default when an insert omits it.

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id") -- Marks the record identifier as the primary key so each row can be uniquely referenced.
); -- Ends this table or enum definition so the next migration statement can run.

-- CreateTable
CREATE TABLE "attachments" ( -- Creates the `attachments` table to store records for this feature.
    "id" SERIAL NOT NULL, -- Stores the unique identifier for this record in `id` on `attachments`. This column is required.
    "daily_log_id" INTEGER, -- Stores the daily report associated with this entry in `daily_log_id` on `attachments`. This column may be left empty.
    "bill_id" INTEGER, -- Stores the bill linked to this transaction or payment in `bill_id` on `attachments`. This column may be left empty.
    "file_name" TEXT NOT NULL, -- Stores the file name value in `file_name` on `attachments`. This column is required.
    "stored_path" TEXT NOT NULL, -- Stores the stored path value in `stored_path` on `attachments`. This column is required.
    "mime_type" TEXT NOT NULL, -- Stores the mime type value in `mime_type` on `attachments`. This column is required.
    "size_bytes" INTEGER NOT NULL, -- Stores the size bytes value in `size_bytes` on `attachments`. This column is required.
    "uploaded_by_id" INTEGER NOT NULL, -- Stores the uploaded by id value in `uploaded_by_id` on `attachments`. This column is required.
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Stores when the record was created in `created_at` on `attachments`. This column is required. The database supplies a default when an insert omits it.

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id") -- Marks the record identifier as the primary key so each row can be uniquely referenced.
); -- Ends this table or enum definition so the next migration statement can run.

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email"); -- Adds an index so the database can find or check these records efficiently.

-- CreateIndex
CREATE INDEX "lands_city_state_idx" ON "lands"("city", "state"); -- Adds an index so the database can find or check these records efficiently.

-- CreateIndex
CREATE UNIQUE INDEX "projects_code_key" ON "projects"("code"); -- Adds an index so the database can find or check these records efficiently.

-- CreateIndex
CREATE INDEX "projects_land_id_idx" ON "projects"("land_id"); -- Adds an index so the database can find or check these records efficiently.

-- CreateIndex
CREATE INDEX "projects_assigned_pm_id_idx" ON "projects"("assigned_pm_id"); -- Adds an index so the database can find or check these records efficiently.

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status"); -- Adds an index so the database can find or check these records efficiently.

-- CreateIndex
CREATE UNIQUE INDEX "materials_name_key" ON "materials"("name"); -- Adds an index so the database can find or check these records efficiently.

-- CreateIndex
CREATE UNIQUE INDEX "vendors_name_key" ON "vendors"("name"); -- Adds an index so the database can find or check these records efficiently.

-- CreateIndex
CREATE UNIQUE INDEX "vendors_gstin_key" ON "vendors"("gstin"); -- Adds an index so the database can find or check these records efficiently.

-- CreateIndex
CREATE UNIQUE INDEX "project_material_plans_project_id_material_id_key" ON "project_material_plans"("project_id", "material_id"); -- Adds an index so the database can find or check these records efficiently.

-- CreateIndex
CREATE INDEX "daily_logs_project_id_log_date_idx" ON "daily_logs"("project_id", "log_date" DESC); -- Adds an index so the database can find or check these records efficiently.

-- CreateIndex
CREATE UNIQUE INDEX "daily_logs_project_id_log_date_key" ON "daily_logs"("project_id", "log_date"); -- Adds an index so the database can find or check these records efficiently.

-- CreateIndex
CREATE INDEX "labour_entries_daily_log_id_idx" ON "labour_entries"("daily_log_id"); -- Adds an index so the database can find or check these records efficiently.

-- CreateIndex
CREATE INDEX "machinery_entries_daily_log_id_idx" ON "machinery_entries"("daily_log_id"); -- Adds an index so the database can find or check these records efficiently.

-- CreateIndex
CREATE INDEX "stock_transactions_project_id_material_id_txn_date_idx" ON "stock_transactions"("project_id", "material_id", "txn_date"); -- Adds an index so the database can find or check these records efficiently.

-- CreateIndex
CREATE INDEX "stock_transactions_vendor_id_idx" ON "stock_transactions"("vendor_id"); -- Adds an index so the database can find or check these records efficiently.

-- CreateIndex
CREATE INDEX "stock_transactions_bill_id_idx" ON "stock_transactions"("bill_id"); -- Adds an index so the database can find or check these records efficiently.

-- CreateIndex
CREATE INDEX "bills_project_id_status_idx" ON "bills"("project_id", "status"); -- Adds an index so the database can find or check these records efficiently.

-- CreateIndex
CREATE INDEX "bills_status_due_date_idx" ON "bills"("status", "due_date"); -- Adds an index so the database can find or check these records efficiently.

-- CreateIndex
CREATE UNIQUE INDEX "bills_vendor_id_bill_number_key" ON "bills"("vendor_id", "bill_number"); -- Adds an index so the database can find or check these records efficiently.

-- CreateIndex
CREATE INDEX "payments_bill_id_idx" ON "payments"("bill_id"); -- Adds an index so the database can find or check these records efficiently.

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id"); -- Adds an index so the database can find or check these records efficiently.

-- CreateIndex
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at"); -- Adds an index so the database can find or check these records efficiently.

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at"); -- Adds an index so the database can find or check these records efficiently.

-- CreateIndex
CREATE UNIQUE INDEX "notifications_dedupe_key_key" ON "notifications"("dedupe_key"); -- Adds an index so the database can find or check these records efficiently.

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_created_at_idx" ON "notifications"("user_id", "is_read", "created_at"); -- Adds an index so the database can find or check these records efficiently.

-- CreateIndex
CREATE INDEX "attachments_daily_log_id_idx" ON "attachments"("daily_log_id"); -- Adds an index so the database can find or check these records efficiently.

-- CreateIndex
CREATE INDEX "attachments_bill_id_idx" ON "attachments"("bill_id"); -- Adds an index so the database can find or check these records efficiently.

-- AddForeignKey
ALTER TABLE "lands" ADD CONSTRAINT "lands_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE; -- Changes the database structure or adds a rule required by this migration.

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_land_id_fkey" FOREIGN KEY ("land_id") REFERENCES "lands"("id") ON DELETE RESTRICT ON UPDATE CASCADE; -- Changes the database structure or adds a rule required by this migration.

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_assigned_pm_id_fkey" FOREIGN KEY ("assigned_pm_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE; -- Changes the database structure or adds a rule required by this migration.

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE; -- Changes the database structure or adds a rule required by this migration.

-- AddForeignKey
ALTER TABLE "project_material_plans" ADD CONSTRAINT "project_material_plans_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE; -- Changes the database structure or adds a rule required by this migration.

-- AddForeignKey
ALTER TABLE "project_material_plans" ADD CONSTRAINT "project_material_plans_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE; -- Changes the database structure or adds a rule required by this migration.

-- AddForeignKey
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE; -- Changes the database structure or adds a rule required by this migration.

-- AddForeignKey
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE; -- Changes the database structure or adds a rule required by this migration.

-- AddForeignKey
ALTER TABLE "labour_entries" ADD CONSTRAINT "labour_entries_daily_log_id_fkey" FOREIGN KEY ("daily_log_id") REFERENCES "daily_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE; -- Changes the database structure or adds a rule required by this migration.

-- AddForeignKey
ALTER TABLE "machinery_entries" ADD CONSTRAINT "machinery_entries_daily_log_id_fkey" FOREIGN KEY ("daily_log_id") REFERENCES "daily_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE; -- Changes the database structure or adds a rule required by this migration.

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE; -- Changes the database structure or adds a rule required by this migration.

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE; -- Changes the database structure or adds a rule required by this migration.

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE; -- Changes the database structure or adds a rule required by this migration.

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE SET NULL ON UPDATE CASCADE; -- Changes the database structure or adds a rule required by this migration.

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_daily_log_id_fkey" FOREIGN KEY ("daily_log_id") REFERENCES "daily_logs"("id") ON DELETE SET NULL ON UPDATE CASCADE; -- Changes the database structure or adds a rule required by this migration.

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE; -- Changes the database structure or adds a rule required by this migration.

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_voided_by_id_fkey" FOREIGN KEY ("voided_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE; -- Changes the database structure or adds a rule required by this migration.

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE; -- Changes the database structure or adds a rule required by this migration.

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE; -- Changes the database structure or adds a rule required by this migration.

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE; -- Changes the database structure or adds a rule required by this migration.

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE; -- Changes the database structure or adds a rule required by this migration.

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE RESTRICT ON UPDATE CASCADE; -- Changes the database structure or adds a rule required by this migration.

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE; -- Changes the database structure or adds a rule required by this migration.

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE; -- Changes the database structure or adds a rule required by this migration.

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE; -- Changes the database structure or adds a rule required by this migration.

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE; -- Changes the database structure or adds a rule required by this migration.

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_daily_log_id_fkey" FOREIGN KEY ("daily_log_id") REFERENCES "daily_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE; -- Changes the database structure or adds a rule required by this migration.

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE CASCADE ON UPDATE CASCADE; -- Changes the database structure or adds a rule required by this migration.

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE; -- Changes the database structure or adds a rule required by this migration.

-- PostgreSQL integrity constraints not expressible in Prisma schema syntax.
ALTER TABLE "projects" -- Changes the database structure or adds a rule required by this migration.
  ADD CONSTRAINT "chk_projects_budget" CHECK ("total_budget" >= 0), -- Changes the database structure or adds a rule required by this migration.
  ADD CONSTRAINT "chk_projects_threshold" CHECK ("wastage_threshold_pct" BETWEEN 0 AND 100); -- Changes the database structure or adds a rule required by this migration.
ALTER TABLE "project_material_plans" -- Changes the database structure or adds a rule required by this migration.
  ADD CONSTRAINT "chk_plan_qty" CHECK ("planned_quantity" > 0); -- Changes the database structure or adds a rule required by this migration.
ALTER TABLE "daily_logs" -- Changes the database structure or adds a rule required by this migration.
  ADD CONSTRAINT "chk_log_progress" CHECK ("progress_percent" BETWEEN 0 AND 100); -- Changes the database structure or adds a rule required by this migration.
ALTER TABLE "labour_entries" -- Changes the database structure or adds a rule required by this migration.
  ADD CONSTRAINT "chk_labour_headcount" CHECK ("head_count" > 0), -- Changes the database structure or adds a rule required by this migration.
  ADD CONSTRAINT "chk_labour_hours" CHECK ("hours_worked" BETWEEN 0 AND 24); -- Changes the database structure or adds a rule required by this migration.
ALTER TABLE "machinery_entries" -- Changes the database structure or adds a rule required by this migration.
  ADD CONSTRAINT "chk_machinery_hours" CHECK ("hours_used" BETWEEN 0 AND 24); -- Changes the database structure or adds a rule required by this migration.
ALTER TABLE "bills" -- Changes the database structure or adds a rule required by this migration.
  ADD CONSTRAINT "chk_bill_amounts" CHECK ( -- Changes the database structure or adds a rule required by this migration.
    "base_amount" >= 0 AND "gst_percent" BETWEEN 0 AND 100 -- Stores the bill amount before tax in `base_amount` on `this table`. This column may be left empty.
    AND "gst_amount" >= 0 AND "total_amount" = "base_amount" + "gst_amount" -- Applies this database migration statement: `AND "gst_amount" >= 0 AND "total_amount" = "base_amount" + "gst_amount"`.
  ), -- Separates this column or constraint from the next item in the definition.
  ADD CONSTRAINT "chk_bill_due" CHECK ("due_date" IS NULL OR "due_date" >= "bill_date"), -- Changes the database structure or adds a rule required by this migration.
  ADD CONSTRAINT "chk_bill_approval" CHECK ( -- Changes the database structure or adds a rule required by this migration.
    "status" NOT IN ('APPROVED', 'PARTIALLY_PAID', 'PAID') -- Stores the current workflow state in `status` on `this table`. This column may be left empty.
    OR ("approved_by_id" IS NOT NULL AND "approved_at" IS NOT NULL) -- Applies this database migration statement: `OR ("approved_by_id" IS NOT NULL AND "approved_at" IS NOT NULL)`.
  ); -- Ends this table or enum definition so the next migration statement can run.
ALTER TABLE "stock_transactions" -- Changes the database structure or adds a rule required by this migration.
  ADD CONSTRAINT "chk_stock_qty_positive" CHECK ("quantity" > 0), -- Changes the database structure or adds a rule required by this migration.
  ADD CONSTRAINT "chk_stock_reason" CHECK ( -- Changes the database structure or adds a rule required by this migration.
    ("txn_type" = 'IN' AND "out_reason" IS NULL) -- Applies this database migration statement: `("txn_type" = 'IN' AND "out_reason" IS NULL)`.
    OR ("txn_type" = 'OUT' AND "out_reason" IS NOT NULL) -- Applies this database migration statement: `OR ("txn_type" = 'OUT' AND "out_reason" IS NOT NULL)`.
  ), -- Separates this column or constraint from the next item in the definition.
  ADD CONSTRAINT "chk_stock_in_only_links" CHECK ( -- Changes the database structure or adds a rule required by this migration.
    "txn_type" = 'IN' -- Stores whether stock is entering, leaving, or being adjusted in `txn_type` on `this table`. This column may be left empty.
    OR ("vendor_id" IS NULL AND "bill_id" IS NULL AND "unit_rate" IS NULL) -- Applies this database migration statement: `OR ("vendor_id" IS NULL AND "bill_id" IS NULL AND "unit_rate" IS NULL)`.
  ), -- Separates this column or constraint from the next item in the definition.
  ADD CONSTRAINT "chk_stock_void_fields" CHECK ( -- Changes the database structure or adds a rule required by this migration.
    "is_voided" = true -- Stores the is voided value in `is_voided` on `this table`. This column may be left empty.
    OR ("voided_by_id" IS NULL AND "voided_at" IS NULL AND "void_reason" IS NULL) -- Applies this database migration statement: `OR ("voided_by_id" IS NULL AND "voided_at" IS NULL AND "void_reason" IS NULL)`.
  ); -- Ends this table or enum definition so the next migration statement can run.
ALTER TABLE "payments" -- Changes the database structure or adds a rule required by this migration.
  ADD CONSTRAINT "chk_payment_amount" CHECK ("amount" > 0); -- Changes the database structure or adds a rule required by this migration.
ALTER TABLE "attachments" -- Changes the database structure or adds a rule required by this migration.
  ADD CONSTRAINT "chk_attachment_target" CHECK ( -- Changes the database structure or adds a rule required by this migration.
    (CASE WHEN "daily_log_id" IS NOT NULL THEN 1 ELSE 0 END) -- Applies this database migration statement: `(CASE WHEN "daily_log_id" IS NOT NULL THEN 1 ELSE 0 END)`.
    + (CASE WHEN "bill_id" IS NOT NULL THEN 1 ELSE 0 END) = 1 -- Applies this database migration statement: `+ (CASE WHEN "bill_id" IS NOT NULL THEN 1 ELSE 0 END) = 1`.
  ); -- Ends this table or enum definition so the next migration statement can run.

-- Preserve the SQL schema's case-insensitive uniqueness guarantees.
CREATE UNIQUE INDEX "materials_name_ci_key" ON "materials" (lower("name")); -- Adds an index so the database can find or check these records efficiently.
CREATE UNIQUE INDEX "vendors_name_ci_key" ON "vendors" (lower("name")); -- Adds an index so the database can find or check these records efficiently.
CREATE INDEX "bills_open_due_date_idx" -- Adds an index so the database can find or check these records efficiently.
  ON "bills" ("due_date") -- Applies this database migration statement: `ON "bills" ("due_date")`.
  WHERE "status" IN ('APPROVED', 'PARTIALLY_PAID'); -- Applies this database migration statement: `WHERE "status" IN ('APPROVED', 'PARTIALLY_PAID')`.

-- Analytics views retained as database-level read models.
CREATE VIEW "v_stock_balance" AS -- Applies this database migration statement: `CREATE VIEW "v_stock_balance" AS`.
SELECT -- Applies this database migration statement: `SELECT`.
  t."project_id", -- Separates this column or constraint from the next item in the definition.
  t."material_id", -- Separates this column or constraint from the next item in the definition.
  COALESCE(SUM(t."quantity") FILTER (WHERE t."txn_type" = 'IN'), 0) AS "total_in", -- Separates this column or constraint from the next item in the definition.
  COALESCE(SUM(t."quantity") FILTER (WHERE t."txn_type" = 'OUT'), 0) AS "total_out", -- Separates this column or constraint from the next item in the definition.
  COALESCE(SUM(CASE WHEN t."txn_type" = 'IN' THEN t."quantity" ELSE -t."quantity" END), 0) AS "balance" -- Applies this database migration statement: `COALESCE(SUM(CASE WHEN t."txn_type" = 'IN' THEN t."quantity" ELSE -t."quantity" END), 0) AS "balance"`.
FROM "stock_transactions" t -- Applies this database migration statement: `FROM "stock_transactions" t`.
WHERE t."is_voided" = false -- Applies this database migration statement: `WHERE t."is_voided" = false`.
GROUP BY t."project_id", t."material_id"; -- Applies this database migration statement: `GROUP BY t."project_id", t."material_id"`.

CREATE VIEW "v_wastage_status" AS -- Applies this database migration statement: `CREATE VIEW "v_wastage_status" AS`.
WITH "latest_progress" AS ( -- Applies this database migration statement: `WITH "latest_progress" AS (`.
  SELECT DISTINCT ON ("project_id") "project_id", "progress_percent" -- Applies this database migration statement: `SELECT DISTINCT ON ("project_id") "project_id", "progress_percent"`.
  FROM "daily_logs" -- Applies this database migration statement: `FROM "daily_logs"`.
  ORDER BY "project_id", "log_date" DESC -- Applies this database migration statement: `ORDER BY "project_id", "log_date" DESC`.
), -- Separates this column or constraint from the next item in the definition.
"usage" AS ( -- Stores the usage value in `usage` on `this table`. This column may be left empty.
  SELECT -- Applies this database migration statement: `SELECT`.
    "project_id", -- Separates this column or constraint from the next item in the definition.
    "material_id", -- Separates this column or constraint from the next item in the definition.
    COALESCE(SUM("quantity") FILTER (WHERE "txn_type" = 'OUT'), 0) AS "consumed_qty", -- Separates this column or constraint from the next item in the definition.
    COALESCE(SUM("quantity") FILTER (WHERE "txn_type" = 'OUT' AND "out_reason" IN ('DAMAGED', 'LOST')), 0) AS "recorded_wastage_qty" -- Applies this database migration statement: `COALESCE(SUM("quantity") FILTER (WHERE "txn_type" = 'OUT' AND "out_reason" IN ('DAMAGED', 'LOST')), 0) AS "recorded_wastage_qty"`.
  FROM "stock_transactions" -- Applies this database migration statement: `FROM "stock_transactions"`.
  WHERE "is_voided" = false -- Applies this database migration statement: `WHERE "is_voided" = false`.
  GROUP BY "project_id", "material_id" -- Applies this database migration statement: `GROUP BY "project_id", "material_id"`.
) -- Applies this database migration statement: `)`.
SELECT -- Applies this database migration statement: `SELECT`.
  pl."project_id", -- Separates this column or constraint from the next item in the definition.
  pl."material_id", -- Separates this column or constraint from the next item in the definition.
  pl."planned_quantity", -- Separates this column or constraint from the next item in the definition.
  pl."planned_unit_rate", -- Separates this column or constraint from the next item in the definition.
  COALESCE(lp."progress_percent", 0) AS "progress_percent", -- Separates this column or constraint from the next item in the definition.
  ROUND(pl."planned_quantity" * COALESCE(lp."progress_percent", 0) / 100, 3) AS "expected_qty", -- Separates this column or constraint from the next item in the definition.
  COALESCE(u."consumed_qty", 0) AS "consumed_qty", -- Separates this column or constraint from the next item in the definition.
  COALESCE(u."recorded_wastage_qty", 0) AS "recorded_wastage_qty", -- Separates this column or constraint from the next item in the definition.
  GREATEST(COALESCE(u."consumed_qty", 0) - ROUND(pl."planned_quantity" * COALESCE(lp."progress_percent", 0) / 100, 3), 0) AS "overrun_qty", -- Separates this column or constraint from the next item in the definition.
  COALESCE(pl."wastage_threshold_pct", p."wastage_threshold_pct") AS "threshold_pct" -- Applies this database migration statement: `COALESCE(pl."wastage_threshold_pct", p."wastage_threshold_pct") AS "threshold_pct"`.
FROM "project_material_plans" pl -- Applies this database migration statement: `FROM "project_material_plans" pl`.
JOIN "projects" p ON p."id" = pl."project_id" -- Applies this database migration statement: `JOIN "projects" p ON p."id" = pl."project_id"`.
LEFT JOIN "latest_progress" lp ON lp."project_id" = pl."project_id" -- Applies this database migration statement: `LEFT JOIN "latest_progress" lp ON lp."project_id" = pl."project_id"`.
LEFT JOIN "usage" u ON u."project_id" = pl."project_id" AND u."material_id" = pl."material_id"; -- Applies this database migration statement: `LEFT JOIN "usage" u ON u."project_id" = pl."project_id" AND u."material_id" = pl."material_id"`.

CREATE VIEW "v_project_financials" AS -- Applies this database migration statement: `CREATE VIEW "v_project_financials" AS`.
WITH "bill_totals" AS ( -- Applies this database migration statement: `WITH "bill_totals" AS (`.
  SELECT -- Applies this database migration statement: `SELECT`.
    "project_id", -- Separates this column or constraint from the next item in the definition.
    COALESCE(SUM("total_amount") FILTER (WHERE "status" IN ('APPROVED', 'PARTIALLY_PAID', 'PAID')), 0) AS "committed_amount", -- Separates this column or constraint from the next item in the definition.
    COALESCE(SUM("total_amount") FILTER (WHERE "status" = 'PENDING'), 0) AS "pending_exposure", -- Separates this column or constraint from the next item in the definition.
    COUNT(*) AS "total_bills_count" -- Applies this database migration statement: `COUNT(*) AS "total_bills_count"`.
  FROM "bills" -- Applies this database migration statement: `FROM "bills"`.
  GROUP BY "project_id" -- Applies this database migration statement: `GROUP BY "project_id"`.
), -- Separates this column or constraint from the next item in the definition.
"payment_totals" AS ( -- Stores the payment totals value in `payment_totals` on `this table`. This column may be left empty.
  SELECT b."project_id", COALESCE(SUM(p."amount"), 0) AS "total_paid" -- Applies this database migration statement: `SELECT b."project_id", COALESCE(SUM(p."amount"), 0) AS "total_paid"`.
  FROM "payments" p -- Applies this database migration statement: `FROM "payments" p`.
  JOIN "bills" b ON b."id" = p."bill_id" -- Applies this database migration statement: `JOIN "bills" b ON b."id" = p."bill_id"`.
  GROUP BY b."project_id" -- Applies this database migration statement: `GROUP BY b."project_id"`.
) -- Applies this database migration statement: `)`.
SELECT -- Applies this database migration statement: `SELECT`.
  p."id" AS "project_id", -- Separates this column or constraint from the next item in the definition.
  p."code" AS "project_code", -- Separates this column or constraint from the next item in the definition.
  p."name" AS "project_name", -- Separates this column or constraint from the next item in the definition.
  p."total_budget", -- Separates this column or constraint from the next item in the definition.
  COALESCE(bt."committed_amount", 0) AS "committed_amount", -- Separates this column or constraint from the next item in the definition.
  COALESCE(bt."pending_exposure", 0) AS "pending_exposure", -- Separates this column or constraint from the next item in the definition.
  COALESCE(pt."total_paid", 0) AS "total_paid", -- Separates this column or constraint from the next item in the definition.
  (p."total_budget" - COALESCE(bt."committed_amount", 0)) AS "remaining_budget", -- Separates this column or constraint from the next item in the definition.
  COALESCE(bt."total_bills_count", 0) AS "total_bills_count" -- Applies this database migration statement: `COALESCE(bt."total_bills_count", 0) AS "total_bills_count"`.
FROM "projects" p -- Applies this database migration statement: `FROM "projects" p`.
LEFT JOIN "bill_totals" bt ON bt."project_id" = p."id" -- Applies this database migration statement: `LEFT JOIN "bill_totals" bt ON bt."project_id" = p."id"`.
LEFT JOIN "payment_totals" pt ON pt."project_id" = p."id"; -- Applies this database migration statement: `LEFT JOIN "payment_totals" pt ON pt."project_id" = p."id"`.
-- File purpose: Creates the initial shared ForgeOS tables, constraints, and database views.
