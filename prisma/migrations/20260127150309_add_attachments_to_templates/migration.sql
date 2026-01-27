-- AlterTable
ALTER TABLE "email_templates" ADD COLUMN     "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[];
