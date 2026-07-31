/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `budgets` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_by` on the `budgets` table. All the data in the column will be lost.
  - Made the column `end_date` on table `budgets` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "budgets_user_id_category_id_period_start_date_key";

-- AlterTable
ALTER TABLE "budgets" DROP COLUMN "deleted_at",
DROP COLUMN "deleted_by",
ALTER COLUMN "end_date" SET NOT NULL;

-- CreateIndex
CREATE INDEX "idx_budgets_user_active" ON "budgets"("user_id");

-- RenameIndex
ALTER INDEX "budgets_category_id_start_date_end_date_idx" RENAME TO "idx_budgets_category_period";

-- RenameIndex
ALTER INDEX "budgets_user_id_status_idx" RENAME TO "idx_budgets_user";

-- BGT-R01: Un solo presupuesto activo por (user_id, category_id, period, start_date).
-- El filtro parcial WHERE status = 'ACTIVE' permite que existan múltiples registros
-- EXPIRED/INACTIVE para la misma combinación (histórico), pero solo uno ACTIVE.
-- Prisma no soporta unique parciales en schema.prisma — se crea aquí explícitamente.
CREATE UNIQUE INDEX "uq_budgets_active"
  ON "budgets"("user_id", "category_id", "period", "start_date")
  WHERE status = 'ACTIVE';
