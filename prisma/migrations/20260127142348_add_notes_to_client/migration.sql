-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('PENDING', 'LEAD', 'REJECTED', 'CONTACTED', 'CLOSED');

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "address" TEXT NOT NULL,
    "street" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postcode" TEXT,
    "country" TEXT,
    "countryCode" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "status" "ClientStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "openingHours" TEXT,
    "facilities" TEXT,
    "datasource" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_placeId_key" ON "clients"("placeId");

-- CreateIndex
CREATE INDEX "clients_status_idx" ON "clients"("status");

-- CreateIndex
CREATE INDEX "clients_category_idx" ON "clients"("category");

-- CreateIndex
CREATE INDEX "clients_city_idx" ON "clients"("city");
