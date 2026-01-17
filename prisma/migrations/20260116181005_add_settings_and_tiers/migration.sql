-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PREMIUM', 'PRO');

-- AlterTable
ALTER TABLE "Barbershop" ADD COLUMN "isQueueEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "isAppointmentsEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
ADD COLUMN "stripeCustomerId" TEXT,
ADD COLUMN "stripeSubscriptionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Barbershop_stripeCustomerId_key" ON "Barbershop"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Barbershop_stripeSubscriptionId_key" ON "Barbershop"("stripeSubscriptionId");
