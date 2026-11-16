CREATE UNIQUE INDEX "project_vendor_assignments_active_unique" -- Adds an index so the database can find or check these records efficiently.
  ON "project_vendor_assignments" ("project_id", "vendor_id") -- Applies this database migration statement: `ON "project_vendor_assignments" ("project_id", "vendor_id")`.
  WHERE "unassigned_at" IS NULL; -- Applies this database migration statement: `WHERE "unassigned_at" IS NULL`.
-- File purpose: Prevents duplicate active assignments for the same project and vendor.
