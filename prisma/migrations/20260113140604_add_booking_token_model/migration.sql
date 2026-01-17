-- CreateTable
CREATE TABLE "BookingToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "barbershopId" TEXT NOT NULL,
    "barberId" TEXT,
    "customerPhone" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "singleUse" BOOLEAN NOT NULL DEFAULT true,
    "validationAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookingToken_tokenHash_key" ON "BookingToken"("tokenHash");

-- CreateIndex
CREATE INDEX "BookingToken_tokenHash_idx" ON "BookingToken"("tokenHash");

-- CreateIndex
CREATE INDEX "BookingToken_barbershopId_idx" ON "BookingToken"("barbershopId");

-- CreateIndex
CREATE INDEX "BookingToken_expiresAt_idx" ON "BookingToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "BookingToken" ADD CONSTRAINT "BookingToken_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "Barbershop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingToken" ADD CONSTRAINT "BookingToken_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE SET NULL ON UPDATE CASCADE;
