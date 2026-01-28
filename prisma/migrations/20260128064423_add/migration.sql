-- AlterTable
ALTER TABLE "email_history" ADD COLUMN     "reason" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Pending';

-- CreateIndex
CREATE INDEX "email_history_status_idx" ON "email_history"("status");
