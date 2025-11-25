-- CreateEnum
CREATE TYPE "UserLevel" AS ENUM ('STANDARD', 'VIP', 'VIP_PLUS');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "userLevel" "UserLevel" NOT NULL DEFAULT 'STANDARD';
