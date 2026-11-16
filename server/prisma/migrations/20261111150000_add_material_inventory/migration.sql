-- CreateEnum
CREATE TYPE "AdjustmentDirection" AS ENUM ('INCREASE', 'DECREASE'); -- Creates the `AdjustmentDirection` enum so database columns can accept only its listed values.

-- AlterEnum
ALTER TYPE "StockTxnType" ADD VALUE 'ADJUSTMENT'; -- Applies this database migration statement: `ALTER TYPE "StockTxnType" ADD VALUE 'ADJUSTMENT'`.

-- AlterTable
ALTER TABLE "materials" ADD COLUMN     "description" TEXT; -- Changes the database structure or adds a rule required by this migration.

-- AlterTable
ALTER TABLE "project_material_plans" ADD COLUMN     "opening_quantity" DECIMAL(14,3) NOT NULL DEFAULT 0; -- Changes the database structure or adds a rule required by this migration.

-- AlterTable
ALTER TABLE "stock_transactions" ADD COLUMN     "adjustment_direction" "AdjustmentDirection"; -- Changes the database structure or adds a rule required by this migration.
ALTER TABLE "project_material_plans" -- Changes the database structure or adds a rule required by this migration.
  ADD CONSTRAINT "chk_plan_opening_quantity" CHECK ("opening_quantity" >= 0); -- Changes the database structure or adds a rule required by this migration.
ALTER TABLE "stock_transactions" -- Changes the database structure or adds a rule required by this migration.
  DROP CONSTRAINT "chk_stock_reason", -- Separates this column or constraint from the next item in the definition.
  ADD CONSTRAINT "chk_stock_reason" CHECK ( -- Changes the database structure or adds a rule required by this migration.
    ("txn_type" = 'IN' AND "out_reason" IS NULL AND "adjustment_direction" IS NULL) -- Applies this database migration statement: `("txn_type" = 'IN' AND "out_reason" IS NULL AND "adjustment_direction" IS NULL)`.
    OR ("txn_type" = 'OUT' AND "out_reason" IS NOT NULL AND "adjustment_direction" IS NULL) -- Applies this database migration statement: `OR ("txn_type" = 'OUT' AND "out_reason" IS NOT NULL AND "adjustment_direction" IS NULL)`.
    OR ("txn_type"::text = 'ADJUSTMENT' AND "out_reason" IS NULL AND "adjustment_direction" IS NOT NULL -- Applies this database migration statement: `OR ("txn_type"::text = 'ADJUSTMENT' AND "out_reason" IS NULL AND "adjustment_direction" IS NOT NULL`.
      AND "vendor_id" IS NULL AND "bill_id" IS NULL AND "unit_rate" IS NULL) -- Applies this database migration statement: `AND "vendor_id" IS NULL AND "bill_id" IS NULL AND "unit_rate" IS NULL)`.
  ); -- Ends this table or enum definition so the next migration statement can run.
-- File purpose: Adds project material plans and the stock inventory transaction schema.
