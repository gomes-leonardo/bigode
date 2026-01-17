-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('OWNER', 'MANAGER');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('BOOKING_LINK', 'BOOKING_CONFIRMATION', 'REMINDER_24H', 'REMINDER_1H', 'CANCELLATION', 'RESCHEDULE', 'QUEUE_NOTIFICATION');

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'MANAGER',
    "barbershopId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminOTP" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminOTP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageTemplate" (
    "id" TEXT NOT NULL,
    "barbershopId" TEXT NOT NULL,
    "type" "MessageType" NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'pt-BR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "twilioTemplateSid" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageLog" (
    "id" TEXT NOT NULL,
    "twilioMessageSid" TEXT,
    "twilioStatus" TEXT,
    "toPhone" TEXT NOT NULL,
    "fromPhone" TEXT NOT NULL,
    "messageType" "MessageType" NOT NULL,
    "content" TEXT NOT NULL,
    "appointmentId" TEXT,
    "customerId" TEXT,
    "barbershopId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "webhookPayload" JSONB,

    CONSTRAINT "MessageLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_phone_key" ON "Admin"("phone");

-- CreateIndex
CREATE INDEX "Admin_barbershopId_idx" ON "Admin"("barbershopId");

-- CreateIndex
CREATE INDEX "Admin_email_idx" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "Admin_phone_idx" ON "Admin"("phone");

-- CreateIndex
CREATE INDEX "AdminOTP_adminId_idx" ON "AdminOTP"("adminId");

-- CreateIndex
CREATE INDEX "AdminOTP_expiresAt_idx" ON "AdminOTP"("expiresAt");

-- CreateIndex
CREATE INDEX "MessageTemplate_barbershopId_idx" ON "MessageTemplate"("barbershopId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageTemplate_barbershopId_type_language_key" ON "MessageTemplate"("barbershopId", "type", "language");

-- CreateIndex
CREATE UNIQUE INDEX "MessageLog_twilioMessageSid_key" ON "MessageLog"("twilioMessageSid");

-- CreateIndex
CREATE INDEX "MessageLog_twilioMessageSid_idx" ON "MessageLog"("twilioMessageSid");

-- CreateIndex
CREATE INDEX "MessageLog_barbershopId_idx" ON "MessageLog"("barbershopId");

-- CreateIndex
CREATE INDEX "MessageLog_toPhone_idx" ON "MessageLog"("toPhone");

-- CreateIndex
CREATE INDEX "MessageLog_sentAt_idx" ON "MessageLog"("sentAt");

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "Barbershop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminOTP" ADD CONSTRAINT "AdminOTP_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageTemplate" ADD CONSTRAINT "MessageTemplate_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "Barbershop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
