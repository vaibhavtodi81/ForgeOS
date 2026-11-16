-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED'); -- Creates the `MilestoneStatus` enum so database columns can accept only its listed values.

-- CreateTable
CREATE TABLE "project_milestones" ( -- Creates the `project_milestones` table to store records for this feature.
    "id" SERIAL NOT NULL, -- Stores the unique identifier for this record in `id` on `project_milestones`. This column is required.
    "project_id" INTEGER NOT NULL, -- Stores the project this record belongs to in `project_id` on `project_milestones`. This column is required.
    "name" TEXT NOT NULL, -- Stores the human-readable name in `name` on `project_milestones`. This column is required.
    "description" TEXT, -- Stores the description value in `description` on `project_milestones`. This column may be left empty.
    "sequence" INTEGER NOT NULL, -- Stores the sequence value in `sequence` on `project_milestones`. This column is required.
    "planned_start_date" DATE, -- Stores the planned start date value in `planned_start_date` on `project_milestones`. This column may be left empty.
    "planned_end_date" DATE, -- Stores the planned end date value in `planned_end_date` on `project_milestones`. This column may be left empty.
    "actual_start_date" DATE, -- Stores the actual start date value in `actual_start_date` on `project_milestones`. This column may be left empty.
    "actual_end_date" DATE, -- Stores the date work was actually completed in `actual_end_date` on `project_milestones`. This column may be left empty.
    "status" "MilestoneStatus" NOT NULL DEFAULT 'PLANNED', -- Stores the current workflow state in `status` on `project_milestones`. This column is required. The database supplies a default when an insert omits it.
    "progress_percent" DECIMAL(5,2) NOT NULL DEFAULT 0, -- Stores the reported project completion percentage in `progress_percent` on `project_milestones`. This column is required. The database supplies a default when an insert omits it.
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Stores when the record was created in `created_at` on `project_milestones`. This column is required. The database supplies a default when an insert omits it.
    "updated_at" TIMESTAMP(3) NOT NULL, -- Stores when the record was last changed in `updated_at` on `project_milestones`. This column is required.

    CONSTRAINT "project_milestones_pkey" PRIMARY KEY ("id") -- Marks the record identifier as the primary key so each row can be uniquely referenced.
); -- Ends this table or enum definition so the next migration statement can run.

-- CreateIndex
CREATE INDEX "project_milestones_project_id_sequence_idx" ON "project_milestones"("project_id", "sequence"); -- Adds an index so the database can find or check these records efficiently.

-- CreateIndex
CREATE INDEX "project_milestones_project_id_status_idx" ON "project_milestones"("project_id", "status"); -- Adds an index so the database can find or check these records efficiently.

-- CreateIndex
CREATE UNIQUE INDEX "project_milestones_project_id_sequence_key" ON "project_milestones"("project_id", "sequence"); -- Adds an index so the database can find or check these records efficiently.

-- AddForeignKey
ALTER TABLE "project_milestones" ADD CONSTRAINT "project_milestones_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE; -- Changes the database structure or adds a rule required by this migration.
-- File purpose: Adds project milestones and their project-scoped ordering constraints.
