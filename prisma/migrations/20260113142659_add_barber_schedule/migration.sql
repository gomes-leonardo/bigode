-- CreateTable
CREATE TABLE "BarberSchedule" (
    "id" TEXT NOT NULL,
    "barberId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BarberSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BarberBreak" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BarberBreak_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BarberSchedule_barberId_idx" ON "BarberSchedule"("barberId");

-- CreateIndex
CREATE UNIQUE INDEX "BarberSchedule_barberId_dayOfWeek_key" ON "BarberSchedule"("barberId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "BarberBreak_scheduleId_idx" ON "BarberBreak"("scheduleId");

-- AddForeignKey
ALTER TABLE "BarberSchedule" ADD CONSTRAINT "BarberSchedule_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarberBreak" ADD CONSTRAINT "BarberBreak_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "BarberSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
