-- CreateEnum
CREATE TYPE "VendorType" AS ENUM ('MATERIAL_SUPPLIER', 'LABOUR_CONTRACTOR', 'MACHINERY_RENTAL', 'SERVICE_PROVIDER', 'OTHER'); -- Creates the `VendorType` enum so database columns can accept only its listed values.

-- AlterTable
ALTER TABLE "vendors" ADD COLUMN     "vendor_type" "VendorType" NOT NULL DEFAULT 'OTHER'; -- Changes the database structure or adds a rule required by this migration.

-- CreateTable
CREATE TABLE "project_vendor_assignments" ( -- Creates the `project_vendor_assignments` table to store records for this feature.
    "id" SERIAL NOT NULL, -- Stores the unique identifier for this record in `id` on `project_vendor_assignments`. This column is required.
    "project_id" INTEGER NOT NULL, -- Stores the project this record belongs to in `project_id` on `project_vendor_assignments`. This column is required.
    "vendor_id" INTEGER NOT NULL, -- Stores the supplier or contractor linked to this record in `vendor_id` on `project_vendor_assignments`. This column is required.
    "assigned_by_id" INTEGER NOT NULL, -- Stores the assigned by id value in `assigned_by_id` on `project_vendor_assignments`. This column is required.
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Stores the assigned at value in `assigned_at` on `project_vendor_assignments`. This column is required. The database supplies a default when an insert omits it.
    "unassigned_at" TIMESTAMP(3), -- Stores the unassigned at value in `unassigned_at` on `project_vendor_assignments`. This column may be left empty.

    CONSTRAINT "project_vendor_assignments_pkey" PRIMARY KEY ("id") -- Marks the record identifier as the primary key so each row can be uniquely referenced.
); -- Ends this table or enum definition so the next migration statement can run.

-- CreateIndex
CREATE INDEX "project_vendor_assignments_project_id_vendor_id_unassigned__idx" ON "project_vendor_assignments"("project_id", "vendor_id", "unassigned_at"); -- Adds an index so the database can find or check these records efficiently.

-- CreateIndex
CREATE INDEX "project_vendor_assignments_vendor_id_assigned_at_idx" ON "project_vendor_assignments"("vendor_id", "assigned_at"); -- Adds an index so the database can find or check these records efficiently.

-- AddForeignKey
ALTER TABLE "project_vendor_assignments" ADD CONSTRAINT "project_vendor_assignments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE; -- Changes the database structure or adds a rule required by this migration.

-- AddForeignKey
ALTER TABLE "project_vendor_assignments" ADD CONSTRAINT "project_vendor_assignments_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE; -- Changes the database structure or adds a rule required by this migration.

-- AddForeignKey
ALTER TABLE "project_vendor_assignments" ADD CONSTRAINT "project_vendor_assignments_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE; -- Changes the database structure or adds a rule required by this migration.

-- File purpose: Adds project-vendor assignments and database constraints for billing records.
