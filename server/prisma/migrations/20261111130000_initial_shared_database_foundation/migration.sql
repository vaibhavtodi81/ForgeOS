-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PM');

-- CreateEnum
CREATE TYPE "AreaUnit" AS ENUM ('SQFT', 'SQYD', 'SQM', 'ACRE');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MaterialCategory" AS ENUM ('CEMENT', 'STEEL', 'SAND_AGGREGATE', 'BRICKS_BLOCKS', 'TIMBER', 'ELECTRICAL', 'PLUMBING', 'PAINT_FINISH', 'OTHER');

-- CreateEnum
CREATE TYPE "StockTxnType" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "OutReason" AS ENUM ('USED', 'DAMAGED', 'LOST');

-- CreateEnum
CREATE TYPE "BillCategory" AS ENUM ('MATERIAL', 'LABOUR', 'MACHINERY', 'SERVICES', 'OTHER');

-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PARTIALLY_PAID', 'PAID');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'OTHER');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'VOID', 'LOGIN');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('LOW_STOCK', 'WASTAGE_ALERT', 'BILL_OVERDUE', 'BILL_SUBMITTED', 'BILL_APPROVED', 'BILL_REJECTED', 'BUDGET_ALERT');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PM',
    "phone" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lands" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address_line" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT,
    "area_value" DECIMAL(14,2) NOT NULL,
    "area_unit" "AreaUnit" NOT NULL,
    "survey_number" TEXT,
    "owner_name" TEXT,
    "purchase_date" DATE,
    "purchase_cost" DECIMAL(16,2),
    "notes" TEXT,
    "created_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" SERIAL NOT NULL,
    "land_id" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "start_date" DATE,
    "expected_end_date" DATE,
    "actual_end_date" DATE,
    "total_budget" DECIMAL(16,2) NOT NULL DEFAULT 0,
    "wastage_threshold_pct" DECIMAL(5,2) NOT NULL DEFAULT 10,
    "assigned_pm_id" INTEGER,
    "created_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materials" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" "MaterialCategory" NOT NULL,
    "unit" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "contact_person" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "gstin" TEXT,
    "address" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_material_plans" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "material_id" INTEGER NOT NULL,
    "planned_quantity" DECIMAL(14,3) NOT NULL,
    "planned_unit_rate" DECIMAL(12,2),
    "low_stock_threshold" DECIMAL(14,3),
    "wastage_threshold_pct" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_material_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_logs" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "log_date" DATE NOT NULL,
    "progress_percent" DECIMAL(5,2) NOT NULL,
    "work_summary" TEXT NOT NULL,
    "weather" TEXT,
    "issues" TEXT,
    "created_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "labour_entries" (
    "id" SERIAL NOT NULL,
    "daily_log_id" INTEGER NOT NULL,
    "trade" TEXT NOT NULL,
    "contractor_name" TEXT,
    "head_count" INTEGER NOT NULL,
    "hours_worked" DECIMAL(4,1) NOT NULL DEFAULT 8,
    "remarks" TEXT,

    CONSTRAINT "labour_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machinery_entries" (
    "id" SERIAL NOT NULL,
    "daily_log_id" INTEGER NOT NULL,
    "machine_name" TEXT NOT NULL,
    "operator_name" TEXT,
    "hours_used" DECIMAL(5,2) NOT NULL,
    "fuel_litres" DECIMAL(8,2),
    "remarks" TEXT,

    CONSTRAINT "machinery_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_transactions" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "material_id" INTEGER NOT NULL,
    "txn_type" "StockTxnType" NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL,
    "unit_rate" DECIMAL(12,2),
    "vendor_id" INTEGER,
    "bill_id" INTEGER,
    "challan_number" TEXT,
    "out_reason" "OutReason",
    "txn_date" DATE NOT NULL,
    "daily_log_id" INTEGER,
    "remarks" TEXT,
    "created_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_voided" BOOLEAN NOT NULL DEFAULT false,
    "voided_by_id" INTEGER,
    "voided_at" TIMESTAMP(3),
    "void_reason" TEXT,

    CONSTRAINT "stock_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bills" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "vendor_id" INTEGER NOT NULL,
    "bill_number" TEXT NOT NULL,
    "bill_date" DATE NOT NULL,
    "due_date" DATE,
    "category" "BillCategory" NOT NULL,
    "description" TEXT,
    "base_amount" DECIMAL(14,2) NOT NULL,
    "gst_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "gst_amount" DECIMAL(14,2) NOT NULL,
    "total_amount" DECIMAL(14,2) NOT NULL,
    "status" "BillStatus" NOT NULL DEFAULT 'PENDING',
    "submitted_by_id" INTEGER NOT NULL,
    "approved_by_id" INTEGER,
    "approved_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "bill_id" INTEGER NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "payment_date" DATE NOT NULL,
    "mode" "PaymentMode" NOT NULL,
    "reference_number" TEXT,
    "remarks" TEXT,
    "recorded_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "action" "AuditAction" NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" INTEGER,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "project_id" INTEGER,
    "link" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "dedupe_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" SERIAL NOT NULL,
    "daily_log_id" INTEGER,
    "bill_id" INTEGER,
    "file_name" TEXT NOT NULL,
    "stored_path" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "uploaded_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "lands_city_state_idx" ON "lands"("city", "state");

-- CreateIndex
CREATE UNIQUE INDEX "projects_code_key" ON "projects"("code");

-- CreateIndex
CREATE INDEX "projects_land_id_idx" ON "projects"("land_id");

-- CreateIndex
CREATE INDEX "projects_assigned_pm_id_idx" ON "projects"("assigned_pm_id");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE UNIQUE INDEX "materials_name_key" ON "materials"("name");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_name_key" ON "vendors"("name");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_gstin_key" ON "vendors"("gstin");

-- CreateIndex
CREATE UNIQUE INDEX "project_material_plans_project_id_material_id_key" ON "project_material_plans"("project_id", "material_id");

-- CreateIndex
CREATE INDEX "daily_logs_project_id_log_date_idx" ON "daily_logs"("project_id", "log_date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "daily_logs_project_id_log_date_key" ON "daily_logs"("project_id", "log_date");

-- CreateIndex
CREATE INDEX "labour_entries_daily_log_id_idx" ON "labour_entries"("daily_log_id");

-- CreateIndex
CREATE INDEX "machinery_entries_daily_log_id_idx" ON "machinery_entries"("daily_log_id");

-- CreateIndex
CREATE INDEX "stock_transactions_project_id_material_id_txn_date_idx" ON "stock_transactions"("project_id", "material_id", "txn_date");

-- CreateIndex
CREATE INDEX "stock_transactions_vendor_id_idx" ON "stock_transactions"("vendor_id");

-- CreateIndex
CREATE INDEX "stock_transactions_bill_id_idx" ON "stock_transactions"("bill_id");

-- CreateIndex
CREATE INDEX "bills_project_id_status_idx" ON "bills"("project_id", "status");

-- CreateIndex
CREATE INDEX "bills_status_due_date_idx" ON "bills"("status", "due_date");

-- CreateIndex
CREATE UNIQUE INDEX "bills_vendor_id_bill_number_key" ON "bills"("vendor_id", "bill_number");

-- CreateIndex
CREATE INDEX "payments_bill_id_idx" ON "payments"("bill_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_dedupe_key_key" ON "notifications"("dedupe_key");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_created_at_idx" ON "notifications"("user_id", "is_read", "created_at");

-- CreateIndex
CREATE INDEX "attachments_daily_log_id_idx" ON "attachments"("daily_log_id");

-- CreateIndex
CREATE INDEX "attachments_bill_id_idx" ON "attachments"("bill_id");

-- AddForeignKey
ALTER TABLE "lands" ADD CONSTRAINT "lands_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_land_id_fkey" FOREIGN KEY ("land_id") REFERENCES "lands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_assigned_pm_id_fkey" FOREIGN KEY ("assigned_pm_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_material_plans" ADD CONSTRAINT "project_material_plans_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_material_plans" ADD CONSTRAINT "project_material_plans_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "labour_entries" ADD CONSTRAINT "labour_entries_daily_log_id_fkey" FOREIGN KEY ("daily_log_id") REFERENCES "daily_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machinery_entries" ADD CONSTRAINT "machinery_entries_daily_log_id_fkey" FOREIGN KEY ("daily_log_id") REFERENCES "daily_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_daily_log_id_fkey" FOREIGN KEY ("daily_log_id") REFERENCES "daily_logs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transactions" ADD CONSTRAINT "stock_transactions_voided_by_id_fkey" FOREIGN KEY ("voided_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_daily_log_id_fkey" FOREIGN KEY ("daily_log_id") REFERENCES "daily_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- PostgreSQL integrity constraints not expressible in Prisma schema syntax.
ALTER TABLE "projects"
  ADD CONSTRAINT "chk_projects_budget" CHECK ("total_budget" >= 0),
  ADD CONSTRAINT "chk_projects_threshold" CHECK ("wastage_threshold_pct" BETWEEN 0 AND 100);
ALTER TABLE "project_material_plans"
  ADD CONSTRAINT "chk_plan_qty" CHECK ("planned_quantity" > 0);
ALTER TABLE "daily_logs"
  ADD CONSTRAINT "chk_log_progress" CHECK ("progress_percent" BETWEEN 0 AND 100);
ALTER TABLE "labour_entries"
  ADD CONSTRAINT "chk_labour_headcount" CHECK ("head_count" > 0),
  ADD CONSTRAINT "chk_labour_hours" CHECK ("hours_worked" BETWEEN 0 AND 24);
ALTER TABLE "machinery_entries"
  ADD CONSTRAINT "chk_machinery_hours" CHECK ("hours_used" BETWEEN 0 AND 24);
ALTER TABLE "bills"
  ADD CONSTRAINT "chk_bill_amounts" CHECK (
    "base_amount" >= 0 AND "gst_percent" BETWEEN 0 AND 100
    AND "gst_amount" >= 0 AND "total_amount" = "base_amount" + "gst_amount"
  ),
  ADD CONSTRAINT "chk_bill_due" CHECK ("due_date" IS NULL OR "due_date" >= "bill_date"),
  ADD CONSTRAINT "chk_bill_approval" CHECK (
    "status" NOT IN ('APPROVED', 'PARTIALLY_PAID', 'PAID')
    OR ("approved_by_id" IS NOT NULL AND "approved_at" IS NOT NULL)
  );
ALTER TABLE "stock_transactions"
  ADD CONSTRAINT "chk_stock_qty_positive" CHECK ("quantity" > 0),
  ADD CONSTRAINT "chk_stock_reason" CHECK (
    ("txn_type" = 'IN' AND "out_reason" IS NULL)
    OR ("txn_type" = 'OUT' AND "out_reason" IS NOT NULL)
  ),
  ADD CONSTRAINT "chk_stock_in_only_links" CHECK (
    "txn_type" = 'IN'
    OR ("vendor_id" IS NULL AND "bill_id" IS NULL AND "unit_rate" IS NULL)
  ),
  ADD CONSTRAINT "chk_stock_void_fields" CHECK (
    "is_voided" = true
    OR ("voided_by_id" IS NULL AND "voided_at" IS NULL AND "void_reason" IS NULL)
  );
ALTER TABLE "payments"
  ADD CONSTRAINT "chk_payment_amount" CHECK ("amount" > 0);
ALTER TABLE "attachments"
  ADD CONSTRAINT "chk_attachment_target" CHECK (
    (CASE WHEN "daily_log_id" IS NOT NULL THEN 1 ELSE 0 END)
    + (CASE WHEN "bill_id" IS NOT NULL THEN 1 ELSE 0 END) = 1
  );

-- Preserve the SQL schema's case-insensitive uniqueness guarantees.
CREATE UNIQUE INDEX "materials_name_ci_key" ON "materials" (lower("name"));
CREATE UNIQUE INDEX "vendors_name_ci_key" ON "vendors" (lower("name"));
CREATE INDEX "bills_open_due_date_idx"
  ON "bills" ("due_date")
  WHERE "status" IN ('APPROVED', 'PARTIALLY_PAID');

-- Analytics views retained as database-level read models.
CREATE VIEW "v_stock_balance" AS
SELECT
  t."project_id",
  t."material_id",
  COALESCE(SUM(t."quantity") FILTER (WHERE t."txn_type" = 'IN'), 0) AS "total_in",
  COALESCE(SUM(t."quantity") FILTER (WHERE t."txn_type" = 'OUT'), 0) AS "total_out",
  COALESCE(SUM(CASE WHEN t."txn_type" = 'IN' THEN t."quantity" ELSE -t."quantity" END), 0) AS "balance"
FROM "stock_transactions" t
WHERE t."is_voided" = false
GROUP BY t."project_id", t."material_id";

CREATE VIEW "v_wastage_status" AS
WITH "latest_progress" AS (
  SELECT DISTINCT ON ("project_id") "project_id", "progress_percent"
  FROM "daily_logs"
  ORDER BY "project_id", "log_date" DESC
),
"usage" AS (
  SELECT
    "project_id",
    "material_id",
    COALESCE(SUM("quantity") FILTER (WHERE "txn_type" = 'OUT'), 0) AS "consumed_qty",
    COALESCE(SUM("quantity") FILTER (WHERE "txn_type" = 'OUT' AND "out_reason" IN ('DAMAGED', 'LOST')), 0) AS "recorded_wastage_qty"
  FROM "stock_transactions"
  WHERE "is_voided" = false
  GROUP BY "project_id", "material_id"
)
SELECT
  pl."project_id",
  pl."material_id",
  pl."planned_quantity",
  pl."planned_unit_rate",
  COALESCE(lp."progress_percent", 0) AS "progress_percent",
  ROUND(pl."planned_quantity" * COALESCE(lp."progress_percent", 0) / 100, 3) AS "expected_qty",
  COALESCE(u."consumed_qty", 0) AS "consumed_qty",
  COALESCE(u."recorded_wastage_qty", 0) AS "recorded_wastage_qty",
  GREATEST(COALESCE(u."consumed_qty", 0) - ROUND(pl."planned_quantity" * COALESCE(lp."progress_percent", 0) / 100, 3), 0) AS "overrun_qty",
  COALESCE(pl."wastage_threshold_pct", p."wastage_threshold_pct") AS "threshold_pct"
FROM "project_material_plans" pl
JOIN "projects" p ON p."id" = pl."project_id"
LEFT JOIN "latest_progress" lp ON lp."project_id" = pl."project_id"
LEFT JOIN "usage" u ON u."project_id" = pl."project_id" AND u."material_id" = pl."material_id";

CREATE VIEW "v_project_financials" AS
WITH "bill_totals" AS (
  SELECT
    "project_id",
    COALESCE(SUM("total_amount") FILTER (WHERE "status" IN ('APPROVED', 'PARTIALLY_PAID', 'PAID')), 0) AS "committed_amount",
    COALESCE(SUM("total_amount") FILTER (WHERE "status" = 'PENDING'), 0) AS "pending_exposure",
    COUNT(*) AS "total_bills_count"
  FROM "bills"
  GROUP BY "project_id"
),
"payment_totals" AS (
  SELECT b."project_id", COALESCE(SUM(p."amount"), 0) AS "total_paid"
  FROM "payments" p
  JOIN "bills" b ON b."id" = p."bill_id"
  GROUP BY b."project_id"
)
SELECT
  p."id" AS "project_id",
  p."code" AS "project_code",
  p."name" AS "project_name",
  p."total_budget",
  COALESCE(bt."committed_amount", 0) AS "committed_amount",
  COALESCE(bt."pending_exposure", 0) AS "pending_exposure",
  COALESCE(pt."total_paid", 0) AS "total_paid",
  (p."total_budget" - COALESCE(bt."committed_amount", 0)) AS "remaining_budget",
  COALESCE(bt."total_bills_count", 0) AS "total_bills_count"
FROM "projects" p
LEFT JOIN "bill_totals" bt ON bt."project_id" = p."id"
LEFT JOIN "payment_totals" pt ON pt."project_id" = p."id";
