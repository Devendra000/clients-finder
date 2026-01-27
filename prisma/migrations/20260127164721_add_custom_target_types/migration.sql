-- AlterEnum
ALTER TYPE "TemplateTargetType" ADD VALUE 'CUSTOM';

-- AlterTable
ALTER TABLE "email_templates" ADD COLUMN     "customTargetId" TEXT;

-- CreateTable
CREATE TABLE "custom_target_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_target_types_pkey" PRIMARY KEY ("id")
);
