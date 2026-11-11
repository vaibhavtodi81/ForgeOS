-- CreateEnum
CREATE TYPE "AdjustmentDirection" AS ENUM ('INCREASE', 'DECREASE');

-- AlterEnum
ALTER TYPE "StockTxnType" ADD VALUE 'ADJUSTMENT';

-- AlterTable
ALTER TABLE "materials" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "project_material_plans" ADD COLUMN     "opening_quantity" DECIMAL(14,3) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "stock_transactions" ADD COLUMN     "adjustment_direction" "AdjustmentDirection";
ALTER TABLE "project_material_plans"
  ADD CONSTRAINT "chk_plan_opening_quantity" CHECK ("opening_quantity" >= 0);
ALTER TABLE "stock_transactions"
  DROP CONSTRAINT "chk_stock_reason",
  ADD CONSTRAINT "chk_stock_reason" CHECK (
    ("txn_type" = 'IN' AND "out_reason" IS NULL AND "adjustment_direction" IS NULL)
    OR ("txn_type" = 'OUT' AND "out_reason" IS NOT NULL AND "adjustment_direction" IS NULL)
    OR ("txn_type"::text = 'ADJUSTMENT' AND "out_reason" IS NULL AND "adjustment_direction" IS NOT NULL
      AND "vendor_id" IS NULL AND "bill_id" IS NULL AND "unit_rate" IS NULL)
  );
