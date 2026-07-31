-- DropIndex
DROP INDEX "accounts_user_id_name_key";

-- CreatePartialUniqueIndex
CREATE UNIQUE INDEX "accounts_user_id_name_active_key" ON "accounts"("user_id", "name") WHERE "deleted_at" IS NULL;
