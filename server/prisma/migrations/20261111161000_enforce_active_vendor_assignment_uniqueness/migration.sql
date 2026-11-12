CREATE UNIQUE INDEX "project_vendor_assignments_active_unique"
  ON "project_vendor_assignments" ("project_id", "vendor_id")
  WHERE "unassigned_at" IS NULL;
