-- CreateEnum
CREATE TYPE "DistanceZone" AS ENUM ('LOCAL', 'REGIONAL', 'EXTENDED', 'CUSTOM');

-- AlterEnum
ALTER TYPE "InteractionType" ADD VALUE 'PURCHASE';

-- CreateTable
CREATE TABLE "ShippingConfig" (
    "id" TEXT NOT NULL,
    "localZoneMax" INTEGER NOT NULL DEFAULT 10,
    "localZoneRate" DECIMAL(10,2) NOT NULL DEFAULT 15,
    "regionalZoneMax" INTEGER NOT NULL DEFAULT 30,
    "regionalZoneRate" DECIMAL(10,2) NOT NULL DEFAULT 30,
    "extendedZoneMax" INTEGER NOT NULL DEFAULT 50,
    "extendedZoneRate" DECIMAL(10,2) NOT NULL DEFAULT 50,
    "customZoneRatePerKm" DECIMAL(10,2) NOT NULL DEFAULT 1.5,
    "minimumShippingCost" DECIMAL(10,2) NOT NULL DEFAULT 20,
    "minimumWithInstallation" DECIMAL(10,2) NOT NULL DEFAULT 50,
    "baseAddress" TEXT NOT NULL DEFAULT 'Madrid, España',
    "baseLatitude" DECIMAL(10,7),
    "baseLongitude" DECIMAL(10,7),
    "freeShippingThreshold" DECIMAL(10,2),
    "urgentSurcharge" DECIMAL(10,2) NOT NULL DEFAULT 50,
    "nightSurcharge" DECIMAL(10,2) NOT NULL DEFAULT 30,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingConfig_pkey" PRIMARY KEY ("id")
);
