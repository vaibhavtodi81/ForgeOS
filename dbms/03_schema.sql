-- ForgeOS PostgreSQL schema documentation.
-- Derived directly from the Prisma migrations in server/prisma/migrations/.
-- Prisma remains the source of truth. This file is executable on a fresh PostgreSQL 16 database.

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PM'); -- Defines the allowed role values.

-- CreateEnum
CREATE TYPE "AreaUnit" AS ENUM ('SQFT', 'SQYD', 'SQM', 'ACRE'); -- Defines the allowed area unit values.

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED'); -- Defines the allowed project status values.

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED'); -- Defines the allowed milestone status values.

-- CreateEnum
CREATE TYPE "MaterialCategory" AS ENUM ('CEMENT', 'STEEL', 'SAND_AGGREGATE', 'BRICKS_BLOCKS', 'TIMBER', 'ELECTRICAL', 'PLUMBING', 'PAINT_FINISH', 'OTHER'); -- Defines the allowed material category values.

-- CreateEnum
CREATE TYPE "StockTxnType" AS ENUM ('IN', 'OUT', 'ADJUSTMENT'); -- Defines the allowed stock transaction type values.

-- CreateEnum
CREATE TYPE "AdjustmentDirection" AS ENUM ('INCREASE', 'DECREASE'); -- Defines the allowed adjustment direction values.

-- CreateEnum
CREATE TYPE "OutReason" AS ENUM ('USED', 'DAMAGED', 'LOST'); -- Defines the allowed out reason values.

-- CreateEnum
CREATE TYPE "BillCategory" AS ENUM ('MATERIAL', 'LABOUR', 'MACHINERY', 'SERVICES', 'OTHER'); -- Defines the allowed bill category values.

-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PARTIALLY_PAID', 'PAID'); -- Defines the allowed bill status values.

-- CreateEnum
CREATE TYPE "VendorType" AS ENUM ('MATERIAL_SUPPLIER', 'LABOUR_CONTRACTOR', 'MACHINERY_RENTAL', 'SERVICE_PROVIDER', 'OTHER'); -- Defines the allowed vendor type values.

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'OTHER'); -- Defines the allowed payment mode values.

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'VOID', 'LOGIN'); -- Defines the allowed audit action values.

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('LOW_STOCK', 'WASTAGE_ALERT', 'BILL_OVERDUE', 'BILL_SUBMITTED', 'BILL_APPROVED', 'BILL_REJECTED', 'BUDGET_ALERT'); -- Defines the allowed notification type values.

-- CreateTable
CREATE TABLE "users" ( -- Starts the users table definition.
    "id" SERIAL NOT NULL, -- Defines the id column as SERIAL and requires a value.
    "name" TEXT NOT NULL, -- Defines the name column as TEXT and requires a value.
    "email" TEXT NOT NULL, -- Defines the email column as TEXT and requires a value.
    "password_hash" TEXT NOT NULL, -- Defines the password hash column as TEXT and requires a value.
    "role" "Role" NOT NULL DEFAULT 'PM', -- Adds the next part of this database definition.
    "phone" TEXT, -- Defines the phone column as TEXT.
    "is_active" BOOLEAN NOT NULL DEFAULT true, -- Defines the is active column as BOOLEAN and requires a value (default true).
    "last_login_at" TIMESTAMP(3), -- Defines the last login at column as TIMESTAMP(3).
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Defines the created at column as TIMESTAMP(3) and requires a value (default CURRENT_TIMESTAMP).
    "updated_at" TIMESTAMP(3) NOT NULL, -- Defines the updated at column as TIMESTAMP(3) and requires a value.

    CONSTRAINT "users_pkey" PRIMARY KEY ("id") -- Adds the users pkey table rule: PRIMARY KEY ("id").
); -- Finishes the users table definition.

-- CreateTable
CREATE TABLE "lands" ( -- Starts the lands table definition.
    "id" SERIAL NOT NULL, -- Defines the id column as SERIAL and requires a value.
    "name" TEXT NOT NULL, -- Defines the name column as TEXT and requires a value.
    "address_line" TEXT, -- Defines the address line column as TEXT.
    "city" TEXT NOT NULL, -- Defines the city column as TEXT and requires a value.
    "state" TEXT NOT NULL, -- Defines the state column as TEXT and requires a value.
    "pincode" TEXT, -- Defines the pincode column as TEXT.
    "area_value" DECIMAL(14,2) NOT NULL, -- Defines the area value column as DECIMAL(14,2) and requires a value.
    "area_unit" "AreaUnit" NOT NULL, -- Adds the next part of this database definition.
    "survey_number" TEXT, -- Defines the survey number column as TEXT.
    "owner_name" TEXT, -- Defines the owner name column as TEXT.
    "purchase_date" DATE, -- Defines the purchase date column as DATE.
    "purchase_cost" DECIMAL(16,2), -- Defines the purchase cost column as DECIMAL(16,2).
    "notes" TEXT, -- Defines the notes column as TEXT.
    "created_by_id" INTEGER NOT NULL, -- Defines the created by id column as INTEGER and requires a value.
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Defines the created at column as TIMESTAMP(3) and requires a value (default CURRENT_TIMESTAMP).
    "updated_at" TIMESTAMP(3) NOT NULL, -- Defines the updated at column as TIMESTAMP(3) and requires a value.

    CONSTRAINT "lands_pkey" PRIMARY KEY ("id") -- Adds the lands pkey table rule: PRIMARY KEY ("id").
); -- Finishes the lands table definition.

-- CreateTable
CREATE TABLE "projects" ( -- Starts the projects table definition.
    "id" SERIAL NOT NULL, -- Defines the id column as SERIAL and requires a value.
    "land_id" INTEGER NOT NULL, -- Defines the land id column as INTEGER and requires a value.
    "code" TEXT NOT NULL, -- Defines the code column as TEXT and requires a value.
    "name" TEXT NOT NULL, -- Defines the name column as TEXT and requires a value.
    "description" TEXT, -- Defines the description column as TEXT.
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNING', -- Adds the next part of this database definition.
    "start_date" DATE, -- Defines the start date column as DATE.
    "expected_end_date" DATE, -- Defines the expected end date column as DATE.
    "actual_end_date" DATE, -- Defines the actual end date column as DATE.
    "total_budget" DECIMAL(16,2) NOT NULL DEFAULT 0, -- Defines the total budget column as DECIMAL(16,2) and requires a value (default 0).
    "wastage_threshold_pct" DECIMAL(5,2) NOT NULL DEFAULT 10, -- Defines the wastage threshold pct column as DECIMAL(5,2) and requires a value (default 10).
    "assigned_pm_id" INTEGER, -- Defines the assigned pm id column as INTEGER.
    "created_by_id" INTEGER NOT NULL, -- Defines the created by id column as INTEGER and requires a value.
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Defines the created at column as TIMESTAMP(3) and requires a value (default CURRENT_TIMESTAMP).
    "updated_at" TIMESTAMP(3) NOT NULL, -- Defines the updated at column as TIMESTAMP(3) and requires a value.

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id") -- Adds the projects pkey table rule: PRIMARY KEY ("id").
); -- Finishes the projects table definition.

-- CreateTable
CREATE TABLE "project_milestones" ( -- Starts the project milestones table definition.
    "id" SERIAL NOT NULL, -- Defines the id column as SERIAL and requires a value.
    "project_id" INTEGER NOT NULL, -- Defines the project id column as INTEGER and requires a value.
    "name" TEXT NOT NULL, -- Defines the name column as TEXT and requires a value.
    "description" TEXT, -- Defines the description column as TEXT.
    "sequence" INTEGER NOT NULL, -- Defines the sequence column as INTEGER and requires a value.
    "planned_start_date" DATE, -- Defines the planned start date column as DATE.
    "planned_end_date" DATE, -- Defines the planned end date column as DATE.
    "actual_start_date" DATE, -- Defines the actual start date column as DATE.
    "actual_end_date" DATE, -- Defines the actual end date column as DATE.
    "status" "MilestoneStatus" NOT NULL DEFAULT 'PLANNED', -- Adds the next part of this database definition.
    "progress_percent" DECIMAL(5,2) NOT NULL DEFAULT 0, -- Defines the progress percent column as DECIMAL(5,2) and requires a value (default 0).
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Defines the created at column as TIMESTAMP(3) and requires a value (default CURRENT_TIMESTAMP).
    "updated_at" TIMESTAMP(3) NOT NULL, -- Defines the updated at column as TIMESTAMP(3) and requires a value.

    CONSTRAINT "project_milestones_pkey" PRIMARY KEY ("id") -- Adds the project milestones pkey table rule: PRIMARY KEY ("id").
); -- Finishes the project milestones table definition.

-- CreateTable
CREATE TABLE "materials" ( -- Starts the materials table definition.
    "id" SERIAL NOT NULL, -- Defines the id column as SERIAL and requires a value.
    "name" TEXT NOT NULL, -- Defines the name column as TEXT and requires a value.
    "category" "MaterialCategory" NOT NULL, -- Adds the next part of this database definition.
    "unit" TEXT NOT NULL, -- Defines the unit column as TEXT and requires a value.
    "description" TEXT, -- Defines the description column as TEXT.
    "is_active" BOOLEAN NOT NULL DEFAULT true, -- Defines the is active column as BOOLEAN and requires a value (default true).
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Defines the created at column as TIMESTAMP(3) and requires a value (default CURRENT_TIMESTAMP).
    "updated_at" TIMESTAMP(3) NOT NULL, -- Defines the updated at column as TIMESTAMP(3) and requires a value.

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id") -- Adds the materials pkey table rule: PRIMARY KEY ("id").
); -- Finishes the materials table definition.

-- CreateTable
CREATE TABLE "vendors" ( -- Starts the vendors table definition.
    "id" SERIAL NOT NULL, -- Defines the id column as SERIAL and requires a value.
    "name" TEXT NOT NULL, -- Defines the name column as TEXT and requires a value.
    "vendor_type" "VendorType" NOT NULL DEFAULT 'OTHER', -- Adds the next part of this database definition.
    "contact_person" TEXT, -- Defines the contact person column as TEXT.
    "phone" TEXT, -- Defines the phone column as TEXT.
    "email" TEXT, -- Defines the email column as TEXT.
    "gstin" TEXT, -- Defines the gstin column as TEXT.
    "address" TEXT, -- Defines the address column as TEXT.
    "is_active" BOOLEAN NOT NULL DEFAULT true, -- Defines the is active column as BOOLEAN and requires a value (default true).
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Defines the created at column as TIMESTAMP(3) and requires a value (default CURRENT_TIMESTAMP).
    "updated_at" TIMESTAMP(3) NOT NULL, -- Defines the updated at column as TIMESTAMP(3) and requires a value.

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id") -- Adds the vendors pkey table rule: PRIMARY KEY ("id").
); -- Finishes the vendors table definition.

-- CreateTable
CREATE TABLE "project_vendor_assignments" ( -- Starts the project vendor assignments table definition.
    "id" SERIAL NOT NULL, -- Defines the id column as SERIAL and requires a value.
    "project_id" INTEGER NOT NULL, -- Defines the project id column as INTEGER and requires a value.
    "vendor_id" INTEGER NOT NULL, -- Defines the vendor id column as INTEGER and requires a value.
    "assigned_by_id" INTEGER NOT NULL, -- Defines the assigned by id column as INTEGER and requires a value.
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Defines the assigned at column as TIMESTAMP(3) and requires a value (default CURRENT_TIMESTAMP).
    "unassigned_at" TIMESTAMP(3), -- Defines the unassigned at column as TIMESTAMP(3).

    CONSTRAINT "project_vendor_assignments_pkey" PRIMARY KEY ("id") -- Adds the project vendor assignments pkey table rule: PRIMARY KEY ("id").
); -- Finishes the project vendor assignments table definition.

-- CreateTable
CREATE TABLE "project_material_plans" ( -- Starts the project material plans table definition.
    "id" SERIAL NOT NULL, -- Defines the id column as SERIAL and requires a value.
    "project_id" INTEGER NOT NULL, -- Defines the project id column as INTEGER and requires a value.
    "material_id" INTEGER NOT NULL, -- Defines the material id column as INTEGER and requires a value.
    "opening_quantity" DECIMAL(14,3) NOT NULL DEFAULT 0, -- Defines the opening quantity column as DECIMAL(14,3) and requires a value (default 0).
    "planned_quantity" DECIMAL(14,3) NOT NULL, -- Defines the planned quantity column as DECIMAL(14,3) and requires a value.
    "planned_unit_rate" DECIMAL(12,2), -- Defines the planned unit rate column as DECIMAL(12,2).
    "low_stock_threshold" DECIMAL(14,3), -- Defines the low stock threshold column as DECIMAL(14,3).
    "wastage_threshold_pct" DECIMAL(5,2), -- Defines the wastage threshold pct column as DECIMAL(5,2).
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Defines the created at column as TIMESTAMP(3) and requires a value (default CURRENT_TIMESTAMP).
    "updated_at" TIMESTAMP(3) NOT NULL, -- Defines the updated at column as TIMESTAMP(3) and requires a value.

    CONSTRAINT "project_material_plans_pkey" PRIMARY KEY ("id") -- Adds the project material plans pkey table rule: PRIMARY KEY ("id").
); -- Finishes the project material plans table definition.

-- CreateTable
CREATE TABLE "daily_logs" ( -- Starts the daily logs table definition.
    "id" SERIAL NOT NULL, -- Defines the id column as SERIAL and requires a value.
    "project_id" INTEGER NOT NULL, -- Defines the project id column as INTEGER and requires a value.
    "log_date" DATE NOT NULL, -- Defines the log date column as DATE and requires a value.
    "progress_percent" DECIMAL(5,2) NOT NULL, -- Defines the progress percent column as DECIMAL(5,2) and requires a value.
    "work_summary" TEXT NOT NULL, -- Defines the work summary column as TEXT and requires a value.
    "weather" TEXT, -- Defines the weather column as TEXT.
    "issues" TEXT, -- Defines the issues column as TEXT.
    "created_by_id" INTEGER NOT NULL, -- Defines the created by id column as INTEGER and requires a value.
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Defines the created at column as TIMESTAMP(3) and requires a value (default CURRENT_TIMESTAMP).
    "updated_at" TIMESTAMP(3) NOT NULL, -- Defines the updated at column as TIMESTAMP(3) and requires a value.

    CONSTRAINT "daily_logs_pkey" PRIMARY KEY ("id") -- Adds the daily logs pkey table rule: PRIMARY KEY ("id").
); -- Finishes the daily logs table definition.

-- CreateTable
CREATE TABLE "labour_entries" ( -- Starts the labour entries table definition.
    "id" SERIAL NOT NULL, -- Defines the id column as SERIAL and requires a value.
    "daily_log_id" INTEGER NOT NULL, -- Defines the daily log id column as INTEGER and requires a value.
    "trade" TEXT NOT NULL, -- Defines the trade column as TEXT and requires a value.
    "contractor_name" TEXT, -- Defines the contractor name column as TEXT.
    "head_count" INTEGER NOT NULL, -- Defines the head count column as INTEGER and requires a value.
    "hours_worked" DECIMAL(4,1) NOT NULL DEFAULT 8, -- Defines the hours worked column as DECIMAL(4,1) and requires a value (default 8).
    "remarks" TEXT, -- Defines the remarks column as TEXT.

    CONSTRAINT "labour_entries_pkey" PRIMARY KEY ("id") -- Adds the labour entries pkey table rule: PRIMARY KEY ("id").
); -- Finishes the labour entries table definition.

-- CreateTable
CREATE TABLE "machinery_entries" ( -- Starts the machinery entries table definition.
    "id" SERIAL NOT NULL, -- Defines the id column as SERIAL and requires a value.
    "daily_log_id" INTEGER NOT NULL, -- Defines the daily log id column as INTEGER and requires a value.
    "machine_name" TEXT NOT NULL, -- Defines the machine name column as TEXT and requires a value.
    "operator_name" TEXT, -- Defines the operator name column as TEXT.
    "hours_used" DECIMAL(5,2) NOT NULL, -- Defines the hours used column as DECIMAL(5,2) and requires a value.
    "fuel_litres" DECIMAL(8,2), -- Defines the fuel litres column as DECIMAL(8,2).
    "remarks" TEXT, -- Defines the remarks column as TEXT.

    CONSTRAINT "machinery_entries_pkey" PRIMARY KEY ("id") -- Adds the machinery entries pkey table rule: PRIMARY KEY ("id").
); -- Finishes the machinery entries table definition.

-- CreateTable
CREATE TABLE "stock_transactions" ( -- Starts the stock transactions table definition.
    "id" SERIAL NOT NULL, -- Defines the id column as SERIAL and requires a value.
    "project_id" INTEGER NOT NULL, -- Defines the project id column as INTEGER and requires a value.
    "material_id" INTEGER NOT NULL, -- Defines the material id column as INTEGER and requires a value.
    "txn_type" "StockTxnType" NOT NULL, -- Adds the next part of this database definition.
    "quantity" DECIMAL(14,3) NOT NULL, -- Defines the quantity column as DECIMAL(14,3) and requires a value.
    "unit_rate" DECIMAL(12,2), -- Defines the unit rate column as DECIMAL(12,2).
    "vendor_id" INTEGER, -- Defines the vendor id column as INTEGER.
    "bill_id" INTEGER, -- Defines the bill id column as INTEGER.
    "challan_number" TEXT, -- Defines the challan number column as TEXT.
    "out_reason" "OutReason", -- Adds the next part of this database definition.
    "adjustment_direction" "AdjustmentDirection", -- Adds the next part of this database definition.
    "txn_date" DATE NOT NULL, -- Defines the txn date column as DATE and requires a value.
    "daily_log_id" INTEGER, -- Defines the daily log id column as INTEGER.
    "remarks" TEXT, -- Defines the remarks column as TEXT.
    "created_by_id" INTEGER NOT NULL, -- Defines the created by id column as INTEGER and requires a value.
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Defines the created at column as TIMESTAMP(3) and requires a value (default CURRENT_TIMESTAMP).
    "is_voided" BOOLEAN NOT NULL DEFAULT false, -- Defines the is voided column as BOOLEAN and requires a value (default false).
    "voided_by_id" INTEGER, -- Defines the voided by id column as INTEGER.
    "voided_at" TIMESTAMP(3), -- Defines the voided at column as TIMESTAMP(3).
    "void_reason" TEXT, -- Defines the void reason column as TEXT.

    CONSTRAINT "stock_transactions_pkey" PRIMARY KEY ("id") -- Adds the stock transactions pkey table rule: PRIMARY KEY ("id").
); -- Finishes the stock transactions table definition.

-- CreateTable
CREATE TABLE "bills" ( -- Starts the bills table definition.
    "id" SERIAL NOT NULL, -- Defines the id column as SERIAL and requires a value.
    "project_id" INTEGER NOT NULL, -- Defines the project id column as INTEGER and requires a value.
    "vendor_id" INTEGER NOT NULL, -- Defines the vendor id column as INTEGER and requires a value.
    "bill_number" TEXT NOT NULL, -- Defines the bill number column as TEXT and requires a value.
    "bill_date" DATE NOT NULL, -- Defines the bill date column as DATE and requires a value.
    "due_date" DATE, -- Defines the due date column as DATE.
    "category" "BillCategory" NOT NULL, -- Adds the next part of this database definition.
    "description" TEXT, -- Defines the description column as TEXT.
    "base_amount" DECIMAL(14,2) NOT NULL, -- Defines the base amount column as DECIMAL(14,2) and requires a value.
    "gst_percent" DECIMAL(5,2) NOT NULL DEFAULT 0, -- Defines the gst percent column as DECIMAL(5,2) and requires a value (default 0).
    "gst_amount" DECIMAL(14,2) NOT NULL, -- Defines the gst amount column as DECIMAL(14,2) and requires a value.
    "total_amount" DECIMAL(14,2) NOT NULL, -- Defines the total amount column as DECIMAL(14,2) and requires a value.
    "status" "BillStatus" NOT NULL DEFAULT 'PENDING', -- Adds the next part of this database definition.
    "submitted_by_id" INTEGER NOT NULL, -- Defines the submitted by id column as INTEGER and requires a value.
    "approved_by_id" INTEGER, -- Defines the approved by id column as INTEGER.
    "approved_at" TIMESTAMP(3), -- Defines the approved at column as TIMESTAMP(3).
    "rejection_reason" TEXT, -- Defines the rejection reason column as TEXT.
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Defines the created at column as TIMESTAMP(3) and requires a value (default CURRENT_TIMESTAMP).
    "updated_at" TIMESTAMP(3) NOT NULL, -- Defines the updated at column as TIMESTAMP(3) and requires a value.

    CONSTRAINT "bills_pkey" PRIMARY KEY ("id") -- Adds the bills pkey table rule: PRIMARY KEY ("id").
); -- Finishes the bills table definition.

-- CreateTable
CREATE TABLE "payments" ( -- Starts the payments table definition.
    "id" SERIAL NOT NULL, -- Defines the id column as SERIAL and requires a value.
    "bill_id" INTEGER NOT NULL, -- Defines the bill id column as INTEGER and requires a value.
    "amount" DECIMAL(14,2) NOT NULL, -- Defines the amount column as DECIMAL(14,2) and requires a value.
    "payment_date" DATE NOT NULL, -- Defines the payment date column as DATE and requires a value.
    "mode" "PaymentMode" NOT NULL, -- Adds the next part of this database definition.
    "reference_number" TEXT, -- Defines the reference number column as TEXT.
    "remarks" TEXT, -- Defines the remarks column as TEXT.
    "recorded_by_id" INTEGER NOT NULL, -- Defines the recorded by id column as INTEGER and requires a value.
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Defines the created at column as TIMESTAMP(3) and requires a value (default CURRENT_TIMESTAMP).

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id") -- Adds the payments pkey table rule: PRIMARY KEY ("id").
); -- Finishes the payments table definition.

-- CreateTable
CREATE TABLE "audit_logs" ( -- Starts the audit logs table definition.
    "id" SERIAL NOT NULL, -- Defines the id column as SERIAL and requires a value.
    "user_id" INTEGER, -- Defines the user id column as INTEGER.
    "action" "AuditAction" NOT NULL, -- Adds the next part of this database definition.
    "entity_type" TEXT NOT NULL, -- Defines the entity type column as TEXT and requires a value.
    "entity_id" INTEGER, -- Defines the entity id column as INTEGER.
    "old_values" JSONB, -- Defines the old values column as JSONB.
    "new_values" JSONB, -- Defines the new values column as JSONB.
    "ip_address" TEXT, -- Defines the ip address column as TEXT.
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Defines the created at column as TIMESTAMP(3) and requires a value (default CURRENT_TIMESTAMP).

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id") -- Adds the audit logs pkey table rule: PRIMARY KEY ("id").
); -- Finishes the audit logs table definition.

-- CreateTable
CREATE TABLE "notifications" ( -- Starts the notifications table definition.
    "id" SERIAL NOT NULL, -- Defines the id column as SERIAL and requires a value.
    "user_id" INTEGER NOT NULL, -- Defines the user id column as INTEGER and requires a value.
    "type" "NotificationType" NOT NULL, -- Adds the next part of this database definition.
    "title" TEXT NOT NULL, -- Defines the title column as TEXT and requires a value.
    "message" TEXT NOT NULL, -- Defines the message column as TEXT and requires a value.
    "project_id" INTEGER, -- Defines the project id column as INTEGER.
    "link" TEXT, -- Defines the link column as TEXT.
    "is_read" BOOLEAN NOT NULL DEFAULT false, -- Defines the is read column as BOOLEAN and requires a value (default false).
    "dedupe_key" TEXT, -- Defines the dedupe key column as TEXT.
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Defines the created at column as TIMESTAMP(3) and requires a value (default CURRENT_TIMESTAMP).

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id") -- Adds the notifications pkey table rule: PRIMARY KEY ("id").
); -- Finishes the notifications table definition.

-- CreateTable
CREATE TABLE "attachments" ( -- Starts the attachments table definition.
    "id" SERIAL NOT NULL, -- Defines the id column as SERIAL and requires a value.
    "daily_log_id" INTEGER, -- Defines the daily log id column as INTEGER.
    "bill_id" INTEGER, -- Defines the bill id column as INTEGER.
    "file_name" TEXT NOT NULL, -- Defines the file name column as TEXT and requires a value.
    "stored_path" TEXT NOT NULL, -- Defines the stored path column as TEXT and requires a value.
    "mime_type" TEXT NOT NULL, -- Defines the mime type column as TEXT and requires a value.
    "size_bytes" INTEGER NOT NULL, -- Defines the size bytes column as INTEGER and requires a value.
    "uploaded_by_id" INTEGER NOT NULL, -- Defines the uploaded by id column as INTEGER and requires a value.
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Defines the created at column as TIMESTAMP(3) and requires a value (default CURRENT_TIMESTAMP).

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id") -- Adds the attachments pkey table rule: PRIMARY KEY ("id").
); -- Finishes the attachments table definition.

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email"); -- Creates a unique index named users_email_key for faster lookups or uniqueness.

-- CreateIndex
CREATE INDEX "lands_city_state_idx" ON "lands"("city", "state"); -- Creates a index named lands_city_state_idx for faster lookups or uniqueness.

-- CreateIndex
CREATE UNIQUE INDEX "projects_code_key" ON "projects"("code"); -- Creates a unique index named projects_code_key for faster lookups or uniqueness.

-- CreateIndex
CREATE INDEX "projects_land_id_idx" ON "projects"("land_id"); -- Creates a index named projects_land_id_idx for faster lookups or uniqueness.

-- CreateIndex
CREATE INDEX "projects_assigned_pm_id_idx" ON "projects"("assigned_pm_id"); -- Creates a index named projects_assigned_pm_id_idx for faster lookups or uniqueness.

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status"); -- Creates a index named projects_status_idx for faster lookups or uniqueness.

-- CreateIndex
CREATE INDEX "project_milestones_project_id_sequence_idx" ON "project_milestones"("project_id", "sequence"); -- Creates a index named project_milestones_project_id_sequence_idx for faster lookups or uniqueness.

-- CreateIndex
CREATE INDEX "project_milestones_project_id_status_idx" ON "project_milestones"("project_id", "status"); -- Creates a index named project_milestones_project_id_status_idx for faster lookups or uniqueness.

-- CreateIndex
CREATE UNIQUE INDEX "project_milestones_project_id_sequence_key" ON "project_milestones"("project_id", "sequence"); -- Creates a unique index named project_milestones_project_id_sequence_key for faster lookups or uniqueness.

-- CreateIndex
CREATE UNIQUE INDEX "materials_name_key" ON "materials"("name"); -- Creates a unique index named materials_name_key for faster lookups or uniqueness.

-- CreateIndex
CREATE UNIQUE INDEX "vendors_name_key" ON "vendors"("name"); -- Creates a unique index named vendors_name_key for faster lookups or uniqueness.

-- CreateIndex
CREATE UNIQUE INDEX "vendors_gstin_key" ON "vendors"("gstin"); -- Creates a unique index named vendors_gstin_key for faster lookups or uniqueness.

-- CreateIndex
CREATE INDEX "project_vendor_assignments_project_id_vendor_id_unassigned__idx" -- Creates a index named project_vendor_assignments_project_id_vendor_id_unassigned__idx for faster lookups or uniqueness.
  ON "project_vendor_assignments"("project_id", "vendor_id", "unassigned_at"); -- Chooses the table and columns the index covers.

-- CreateIndex
CREATE INDEX "project_vendor_assignments_vendor_id_assigned_at_idx" -- Creates a index named project_vendor_assignments_vendor_id_assigned_at_idx for faster lookups or uniqueness.
  ON "project_vendor_assignments"("vendor_id", "assigned_at"); -- Chooses the table and columns the index covers.

-- CreateIndex
CREATE UNIQUE INDEX "project_material_plans_project_id_material_id_key" ON "project_material_plans"("project_id", "material_id"); -- Creates a unique index named project_material_plans_project_id_material_id_key for faster lookups or uniqueness.

-- CreateIndex
CREATE INDEX "daily_logs_project_id_log_date_idx" ON "daily_logs"("project_id", "log_date" DESC); -- Creates a index named daily_logs_project_id_log_date_idx for faster lookups or uniqueness.

-- CreateIndex
CREATE UNIQUE INDEX "daily_logs_project_id_log_date_key" ON "daily_logs"("project_id", "log_date"); -- Creates a unique index named daily_logs_project_id_log_date_key for faster lookups or uniqueness.

-- CreateIndex
CREATE INDEX "labour_entries_daily_log_id_idx" ON "labour_entries"("daily_log_id"); -- Creates a index named labour_entries_daily_log_id_idx for faster lookups or uniqueness.

-- CreateIndex
CREATE INDEX "machinery_entries_daily_log_id_idx" ON "machinery_entries"("daily_log_id"); -- Creates a index named machinery_entries_daily_log_id_idx for faster lookups or uniqueness.

-- CreateIndex
CREATE INDEX "stock_transactions_project_id_material_id_txn_date_idx" ON "stock_transactions"("project_id", "material_id", "txn_date"); -- Creates a index named stock_transactions_project_id_material_id_txn_date_idx for faster lookups or uniqueness.

-- CreateIndex
CREATE INDEX "stock_transactions_vendor_id_idx" ON "stock_transactions"("vendor_id"); -- Creates a index named stock_transactions_vendor_id_idx for faster lookups or uniqueness.

-- CreateIndex
CREATE INDEX "stock_transactions_bill_id_idx" ON "stock_transactions"("bill_id"); -- Creates a index named stock_transactions_bill_id_idx for faster lookups or uniqueness.

-- CreateIndex
CREATE INDEX "bills_project_id_status_idx" ON "bills"("project_id", "status"); -- Creates a index named bills_project_id_status_idx for faster lookups or uniqueness.

-- CreateIndex
CREATE INDEX "bills_status_due_date_idx" ON "bills"("status", "due_date"); -- Creates a index named bills_status_due_date_idx for faster lookups or uniqueness.

-- CreateIndex
CREATE UNIQUE INDEX "bills_vendor_id_bill_number_key" ON "bills"("vendor_id", "bill_number"); -- Creates a unique index named bills_vendor_id_bill_number_key for faster lookups or uniqueness.

-- CreateIndex
CREATE INDEX "payments_bill_id_idx" ON "payments"("bill_id"); -- Creates a index named payments_bill_id_idx for faster lookups or uniqueness.

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id"); -- Creates a index named audit_logs_entity_type_entity_id_idx for faster lookups or uniqueness.

-- CreateIndex
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at"); -- Creates a index named audit_logs_user_id_created_at_idx for faster lookups or uniqueness.

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at"); -- Creates a index named audit_logs_created_at_idx for faster lookups or uniqueness.

-- CreateIndex
CREATE UNIQUE INDEX "notifications_dedupe_key_key" ON "notifications"("dedupe_key"); -- Creates a unique index named notifications_dedupe_key_key for faster lookups or uniqueness.

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_created_at_idx" ON "notifications"("user_id", "is_read", "created_at"); -- Creates a index named notifications_user_id_is_read_created_at_idx for faster lookups or uniqueness.

-- CreateIndex
CREATE INDEX "attachments_daily_log_id_idx" ON "attachments"("daily_log_id"); -- Creates a index named attachments_daily_log_id_idx for faster lookups or uniqueness.

-- CreateIndex
CREATE INDEX "attachments_bill_id_idx" ON "attachments"("bill_id"); -- Creates a index named attachments_bill_id_idx for faster lookups or uniqueness.

-- AddForeignKey
ALTER TABLE "lands" ADD CONSTRAINT "lands_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE; -- Links lands rows to their referenced parent rows.

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_land_id_fkey" FOREIGN KEY ("land_id") REFERENCES "lands"("id") ON DELETE RESTRICT ON UPDATE CASCADE; -- Links projects rows to their referenced parent rows.

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_assigned_pm_id_fkey" FOREIGN KEY ("assigned_pm_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE; -- Links projects rows to their referenced parent rows.

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE; -- Links projects rows to their referenced parent rows.

-- AddForeignKey
ALTER TABLE "project_milestones" ADD CONSTRAINT "project_milestones_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE; -- Links project milestones rows to their referenced parent rows.

-- AddForeignKey
ALTER TABLE "project_vendor_assignments" ADD CONSTRAINT "project_vendor_assignments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE; -- Links project vendor assignments rows to their referenced parent rows.

-- AddForeignKey
ALTER TABLE "project_vendor_assignments" ADD CONSTRAINT "project_vendor_assignments_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE; -- Links project vendor assignments rows to their referenced parent rows.

-- AddForeignKey
ALTER TABLE "project_vendor_assignments" ADD CONSTRAINT "project_vendor_assignments_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE; -- Links project vendor assignments rows to their referenced parent rows.

-- AddForeignKey
ALTER TABLE "project_material_plans" ADD CONSTRAINT "project_material_plans_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE; -- Links project material plans rows to their referenced parent rows.

-- AddForeignKey
ALTER TABLE "project_material_plans" ADD CONSTRAINT "project_material_plans_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE; -- Links project material plans rows to their referenced parent rows.

-- AddForeignKey
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE; -- Links daily logs rows to their referenced parent rows.

-- AddForeignKey
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE; -- Links daily logs rows to their referenced parent rows.

-- AddForeignKey
ALTER TABLE "labour_entries" ADD CONSTRAINT "labour_entries_daily_log_id_fkey" FOREIGN KEY ("daily_log_id") REFERENCES "daily_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE; -- Links labour entries rows to their referenced parent rows.

-- AddForeignKey
ALTER TABLE "machinery_entries" ADD CONSTRAINT "machinery_entries_daily_log_id_fkey" FOREIGN KEY ("daily_log_id") REFERENCES "daily_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE; -- Links machinery entries rows to their referenced parent rows.

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE; -- Links stock transactions rows to their referenced parent rows.

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE; -- Links stock transactions rows to their referenced parent rows.

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE; -- Links stock transactions rows to their referenced parent rows.

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE SET NULL ON UPDATE CASCADE; -- Links stock transactions rows to their referenced parent rows.

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_daily_log_id_fkey" FOREIGN KEY ("daily_log_id") REFERENCES "daily_logs"("id") ON DELETE SET NULL ON UPDATE CASCADE; -- Links stock transactions rows to their referenced parent rows.

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE; -- Links stock transactions rows to their referenced parent rows.

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_voided_by_id_fkey" FOREIGN KEY ("voided_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE; -- Links stock transactions rows to their referenced parent rows.

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE; -- Links bills rows to their referenced parent rows.

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE; -- Links bills rows to their referenced parent rows.

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE; -- Links bills rows to their referenced parent rows.

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE; -- Links bills rows to their referenced parent rows.

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE RESTRICT ON UPDATE CASCADE; -- Links payments rows to their referenced parent rows.

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE; -- Links payments rows to their referenced parent rows.

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE; -- Links audit logs rows to their referenced parent rows.

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE; -- Links notifications rows to their referenced parent rows.

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE; -- Links notifications rows to their referenced parent rows.

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_daily_log_id_fkey" FOREIGN KEY ("daily_log_id") REFERENCES "daily_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE; -- Links attachments rows to their referenced parent rows.

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE CASCADE ON UPDATE CASCADE; -- Links attachments rows to their referenced parent rows.

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE; -- Links attachments rows to their referenced parent rows.

-- PostgreSQL integrity constraints not expressible in Prisma schema syntax.
ALTER TABLE "projects" -- Starts adding a database integrity rule to projects.
  ADD CONSTRAINT "chk_projects_budget" CHECK ("total_budget" >= 0), -- Adds the chk projects budget integrity check to the current table.
  ADD CONSTRAINT "chk_projects_threshold" CHECK ("wastage_threshold_pct" BETWEEN 0 AND 100); -- Adds the chk projects threshold integrity check to the current table.
ALTER TABLE "project_material_plans" -- Starts adding a database integrity rule to project material plans.
  ADD CONSTRAINT "chk_plan_opening_quantity" CHECK ("opening_quantity" >= 0), -- Adds the chk plan opening quantity integrity check to the current table.
  ADD CONSTRAINT "chk_plan_qty" CHECK ("planned_quantity" > 0); -- Adds the chk plan qty integrity check to the current table.
ALTER TABLE "daily_logs" -- Starts adding a database integrity rule to daily logs.
  ADD CONSTRAINT "chk_log_progress" CHECK ("progress_percent" BETWEEN 0 AND 100); -- Adds the chk log progress integrity check to the current table.
ALTER TABLE "labour_entries" -- Starts adding a database integrity rule to labour entries.
  ADD CONSTRAINT "chk_labour_headcount" CHECK ("head_count" > 0), -- Adds the chk labour headcount integrity check to the current table.
  ADD CONSTRAINT "chk_labour_hours" CHECK ("hours_worked" BETWEEN 0 AND 24); -- Adds the chk labour hours integrity check to the current table.
ALTER TABLE "machinery_entries" -- Starts adding a database integrity rule to machinery entries.
  ADD CONSTRAINT "chk_machinery_hours" CHECK ("hours_used" BETWEEN 0 AND 24); -- Adds the chk machinery hours integrity check to the current table.
ALTER TABLE "bills" -- Starts adding a database integrity rule to bills.
  ADD CONSTRAINT "chk_bill_amounts" CHECK ( -- Adds the chk bill amounts integrity check to the current table.
    "base_amount" >= 0 AND "gst_percent" BETWEEN 0 AND 100 -- Continues the definition of this database rule or read-only view.
    AND "gst_amount" >= 0 AND "total_amount" = "base_amount" + "gst_amount" -- Continues the definition of this database rule or read-only view.
  ), -- Closes this nested query or expression.
  ADD CONSTRAINT "chk_bill_due" CHECK ("due_date" IS NULL OR "due_date" >= "bill_date"), -- Adds the chk bill due integrity check to the current table.
  ADD CONSTRAINT "chk_bill_approval" CHECK ( -- Adds the chk bill approval integrity check to the current table.
    "status" NOT IN ('APPROVED', 'PARTIALLY_PAID', 'PAID') -- Defines the status column as NOT.
    OR ("approved_by_id" IS NOT NULL AND "approved_at" IS NOT NULL) -- Continues the definition of this database rule or read-only view.
  ); -- Finishes the bills table definition.
ALTER TABLE "stock_transactions" -- Starts adding a database integrity rule to stock transactions.
  ADD CONSTRAINT "chk_stock_qty_positive" CHECK ("quantity" > 0), -- Adds the chk stock qty positive integrity check to the current table.
  ADD CONSTRAINT "chk_stock_reason" CHECK ( -- Adds the chk stock reason integrity check to the current table.
    ("txn_type" = 'IN' AND "out_reason" IS NULL -- Continues the definition of this database rule or read-only view.
      AND "adjustment_direction" IS NULL) -- Continues the definition of this database rule or read-only view.
    OR ("txn_type" = 'OUT' AND "out_reason" IS NOT NULL -- Continues the definition of this database rule or read-only view.
      AND "adjustment_direction" IS NULL) -- Continues the definition of this database rule or read-only view.
    OR ("txn_type"::text = 'ADJUSTMENT' AND "out_reason" IS NULL -- Continues the definition of this database rule or read-only view.
      AND "adjustment_direction" IS NOT NULL -- Continues the definition of this database rule or read-only view.
      AND "vendor_id" IS NULL AND "bill_id" IS NULL -- Continues the definition of this database rule or read-only view.
      AND "unit_rate" IS NULL) -- Continues the definition of this database rule or read-only view.
  ), -- Closes this nested query or expression.
  ADD CONSTRAINT "chk_stock_in_only_links" CHECK ( -- Adds the chk stock in only links integrity check to the current table.
    "txn_type" = 'IN' -- Continues the definition of this database rule or read-only view.
    OR ("vendor_id" IS NULL AND "bill_id" IS NULL AND "unit_rate" IS NULL) -- Continues the definition of this database rule or read-only view.
  ), -- Closes this nested query or expression.
  ADD CONSTRAINT "chk_stock_void_fields" CHECK ( -- Adds the chk stock void fields integrity check to the current table.
    "is_voided" = true -- Continues the definition of this database rule or read-only view.
    OR ("voided_by_id" IS NULL AND "voided_at" IS NULL AND "void_reason" IS NULL) -- Continues the definition of this database rule or read-only view.
  ); -- Finishes the stock transactions table definition.
ALTER TABLE "payments" -- Starts adding a database integrity rule to payments.
  ADD CONSTRAINT "chk_payment_amount" CHECK ("amount" > 0); -- Adds the chk payment amount integrity check to the current table.
ALTER TABLE "attachments" -- Starts adding a database integrity rule to attachments.
  ADD CONSTRAINT "chk_attachment_target" CHECK ( -- Adds the chk attachment target integrity check to the current table.
    (CASE WHEN "daily_log_id" IS NOT NULL THEN 1 ELSE 0 END) -- Continues the definition of this database rule or read-only view.
    + (CASE WHEN "bill_id" IS NOT NULL THEN 1 ELSE 0 END) = 1 -- Continues the definition of this database rule or read-only view.
  ); -- Finishes the attachments table definition.

-- Preserve the SQL schema's case-insensitive uniqueness guarantees.
CREATE UNIQUE INDEX "materials_name_ci_key" ON "materials" (lower("name")); -- Creates a unique index named materials_name_ci_key for faster lookups or uniqueness.
CREATE UNIQUE INDEX "vendors_name_ci_key" ON "vendors" (lower("name")); -- Creates a unique index named vendors_name_ci_key for faster lookups or uniqueness.
CREATE UNIQUE INDEX "project_vendor_assignments_active_unique" -- Creates a unique index named project_vendor_assignments_active_unique for faster lookups or uniqueness.
  ON "project_vendor_assignments" ("project_id", "vendor_id") -- Chooses the table and columns the index covers.
  WHERE "unassigned_at" IS NULL; -- Filters out rows that do not meet this condition.
CREATE INDEX "bills_open_due_date_idx" -- Creates a index named bills_open_due_date_idx for faster lookups or uniqueness.
  ON "bills" ("due_date") -- Chooses the table and columns the index covers.
  WHERE "status" IN ('APPROVED', 'PARTIALLY_PAID'); -- Filters out rows that do not meet this condition.

-- Analytics views retained as database-level read models.
CREATE VIEW "v_stock_balance" AS -- Creates the v stock balance read-only view.
SELECT -- Starts the query used to build this read-only view.
  t."project_id", -- Adds the next part of this database definition.
  t."material_id", -- Adds the next part of this database definition.
  COALESCE(SUM(t."quantity") FILTER (WHERE t."txn_type" = 'IN'), 0) AS "total_in", -- Calculates the total in result for each row.
  COALESCE(SUM(t."quantity") FILTER (WHERE t."txn_type" = 'OUT'), 0) AS "total_out", -- Calculates the total out result for each row.
  COALESCE(SUM(CASE WHEN t."txn_type" = 'IN' THEN t."quantity" ELSE -t."quantity" END), 0) AS "balance" -- Calculates the balance result for each row.
FROM "stock_transactions" t -- Reads source rows from this table or query.
WHERE t."is_voided" = false -- Filters out rows that do not meet this condition.
GROUP BY t."project_id", t."material_id"; -- Groups or sorts the results using these columns.

CREATE VIEW "v_wastage_status" AS -- Creates the v wastage status read-only view.
WITH "latest_progress" AS ( -- Starts the query used to build this read-only view.
  SELECT DISTINCT ON ("project_id") "project_id", "progress_percent" -- Starts the query used to build this read-only view.
  FROM "daily_logs" -- Reads source rows from this table or query.
  ORDER BY "project_id", "log_date" DESC -- Groups or sorts the results using these columns.
), -- Closes this nested query or expression.
"usage" AS ( -- Continues the definition of this database rule or read-only view.
  SELECT -- Starts the query used to build this read-only view.
    "project_id", -- Adds the next part of this database definition.
    "material_id", -- Adds the next part of this database definition.
    COALESCE(SUM("quantity") FILTER (WHERE "txn_type" = 'OUT'), 0) AS "consumed_qty", -- Calculates the consumed qty result for each row.
    COALESCE(SUM("quantity") FILTER (WHERE "txn_type" = 'OUT' AND "out_reason" IN ('DAMAGED', 'LOST')), 0) AS "recorded_wastage_qty" -- Calculates the recorded wastage qty result for each row.
  FROM "stock_transactions" -- Reads source rows from this table or query.
  WHERE "is_voided" = false -- Filters out rows that do not meet this condition.
  GROUP BY "project_id", "material_id" -- Groups or sorts the results using these columns.
) -- Closes this nested query or expression.
SELECT -- Starts the query used to build this read-only view.
  pl."project_id", -- Adds the next part of this database definition.
  pl."material_id", -- Adds the next part of this database definition.
  pl."planned_quantity", -- Adds the next part of this database definition.
  pl."planned_unit_rate", -- Adds the next part of this database definition.
  COALESCE(lp."progress_percent", 0) AS "progress_percent", -- Calculates the progress percent result for each row.
  ROUND(pl."planned_quantity" * COALESCE(lp."progress_percent", 0) / 100, 3) AS "expected_qty", -- Calculates the expected qty result for each row.
  COALESCE(u."consumed_qty", 0) AS "consumed_qty", -- Calculates the consumed qty result for each row.
  COALESCE(u."recorded_wastage_qty", 0) AS "recorded_wastage_qty", -- Calculates the recorded wastage qty result for each row.
  GREATEST(COALESCE(u."consumed_qty", 0) - ROUND(pl."planned_quantity" * COALESCE(lp."progress_percent", 0) / 100, 3), 0) AS "overrun_qty", -- Calculates the overrun qty result for each row.
  COALESCE(pl."wastage_threshold_pct", p."wastage_threshold_pct") AS "threshold_pct" -- Calculates the threshold pct result for each row.
FROM "project_material_plans" pl -- Reads source rows from this table or query.
JOIN "projects" p ON p."id" = pl."project_id" -- Combines related rows using the stated key columns.
LEFT JOIN "latest_progress" lp ON lp."project_id" = pl."project_id" -- Combines related rows using the stated key columns.
LEFT JOIN "usage" u ON u."project_id" = pl."project_id" AND u."material_id" = pl."material_id"; -- Combines related rows using the stated key columns.

CREATE VIEW "v_project_financials" AS -- Creates the v project financials read-only view.
WITH "bill_totals" AS ( -- Starts the query used to build this read-only view.
  SELECT -- Starts the query used to build this read-only view.
    "project_id", -- Adds the next part of this database definition.
    COALESCE(SUM("total_amount") FILTER (WHERE "status" IN ('APPROVED', 'PARTIALLY_PAID', 'PAID')), 0) AS "committed_amount", -- Calculates the committed amount result for each row.
    COALESCE(SUM("total_amount") FILTER (WHERE "status" = 'PENDING'), 0) AS "pending_exposure", -- Calculates the pending exposure result for each row.
    COUNT(*) AS "total_bills_count" -- Calculates the total bills count result for each row.
  FROM "bills" -- Reads source rows from this table or query.
  GROUP BY "project_id" -- Groups or sorts the results using these columns.
), -- Closes this nested query or expression.
"payment_totals" AS ( -- Continues the definition of this database rule or read-only view.
  SELECT b."project_id", COALESCE(SUM(p."amount"), 0) AS "total_paid" -- Starts the query used to build this read-only view.
  FROM "payments" p -- Reads source rows from this table or query.
  JOIN "bills" b ON b."id" = p."bill_id" -- Combines related rows using the stated key columns.
  GROUP BY b."project_id" -- Groups or sorts the results using these columns.
) -- Closes this nested query or expression.
SELECT -- Starts the query used to build this read-only view.
  p."id" AS "project_id", -- Calculates the project id result for each row.
  p."code" AS "project_code", -- Calculates the project code result for each row.
  p."name" AS "project_name", -- Calculates the project name result for each row.
  p."total_budget", -- Adds the next part of this database definition.
  COALESCE(bt."committed_amount", 0) AS "committed_amount", -- Calculates the committed amount result for each row.
  COALESCE(bt."pending_exposure", 0) AS "pending_exposure", -- Calculates the pending exposure result for each row.
  COALESCE(pt."total_paid", 0) AS "total_paid", -- Calculates the total paid result for each row.
  (p."total_budget" - COALESCE(bt."committed_amount", 0)) AS "remaining_budget", -- Calculates the remaining budget result for each row.
  COALESCE(bt."total_bills_count", 0) AS "total_bills_count" -- Calculates the total bills count result for each row.
FROM "projects" p -- Reads source rows from this table or query.
LEFT JOIN "bill_totals" bt ON bt."project_id" = p."id" -- Combines related rows using the stated key columns.
LEFT JOIN "payment_totals" pt ON pt."project_id" = p."id"; -- Combines related rows using the stated key columns.
-- File purpose: Defines the database schema used by the DBMS coursework deliverable.
