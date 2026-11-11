-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED');

-- CreateTable
CREATE TABLE "project_milestones" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sequence" INTEGER NOT NULL,
    "planned_start_date" DATE,
    "planned_end_date" DATE,
    "actual_start_date" DATE,
    "actual_end_date" DATE,
    "status" "MilestoneStatus" NOT NULL DEFAULT 'PLANNED',
    "progress_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_milestones_project_id_sequence_idx" ON "project_milestones"("project_id", "sequence");

-- CreateIndex
CREATE INDEX "project_milestones_project_id_status_idx" ON "project_milestones"("project_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "project_milestones_project_id_sequence_key" ON "project_milestones"("project_id", "sequence");

-- AddForeignKey
ALTER TABLE "project_milestones" ADD CONSTRAINT "project_milestones_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
