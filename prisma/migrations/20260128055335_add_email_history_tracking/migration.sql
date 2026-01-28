-- CreateTable
CREATE TABLE "email_history" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "email_history_clientId_idx" ON "email_history"("clientId");

-- CreateIndex
CREATE INDEX "email_history_sentAt_idx" ON "email_history"("sentAt");

-- AddForeignKey
ALTER TABLE "email_history" ADD CONSTRAINT "email_history_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
