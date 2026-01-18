-- CreateEnum
CREATE TYPE "ConversationState" AS ENUM ('INITIAL', 'AWAITING_ACTION', 'SENDING_LINK', 'COMPLETED');

-- CreateTable
CREATE TABLE "ConversationSession" (
    "id" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "barbershopId" TEXT,
    "state" "ConversationState" NOT NULL DEFAULT 'INITIAL',
    "context" JSONB,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConversationSession_customerPhone_idx" ON "ConversationSession"("customerPhone");

-- CreateIndex
CREATE INDEX "ConversationSession_expiresAt_idx" ON "ConversationSession"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationSession_customerPhone_barbershopId_key" ON "ConversationSession"("customerPhone", "barbershopId");
