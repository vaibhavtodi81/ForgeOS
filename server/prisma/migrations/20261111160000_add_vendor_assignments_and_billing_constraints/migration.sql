-- CreateEnum
CREATE TYPE "VendorType" AS ENUM ('MATERIAL_SUPPLIER', 'LABOUR_CONTRACTOR', 'MACHINERY_RENTAL', 'SERVICE_PROVIDER', 'OTHER');

-- AlterTable
ALTER TABLE "vendors" ADD COLUMN     "vendor_type" "VendorType" NOT NULL DEFAULT 'OTHER';

-- CreateTable
CREATE TABLE "project_vendor_assignments" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "vendor_id" INTEGER NOT NULL,
    "assigned_by_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unassigned_at" TIMESTAMP(3),

    CONSTRAINT "project_vendor_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_vendor_assignments_project_id_vendor_id_unassigned__idx" ON "project_vendor_assignments"("project_id", "vendor_id", "unassigned_at");

-- CreateIndex
CREATE INDEX "project_vendor_assignments_vendor_id_assigned_at_idx" ON "project_vendor_assignments"("vendor_id", "assigned_at");

-- AddForeignKey
ALTER TABLE "project_vendor_assignments" ADD CONSTRAINT "project_vendor_assignments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_vendor_assignments" ADD CONSTRAINT "project_vendor_assignments_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_vendor_assignments" ADD CONSTRAINT "project_vendor_assignments_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

