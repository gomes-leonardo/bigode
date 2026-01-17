/*
  Warnings:

  - A unique constraint covering the columns `[barbershopId,phone]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `barbershopId` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Customer_phone_key";

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "barbershopId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_barbershopId_phone_key" ON "Customer"("barbershopId", "phone");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "Barbershop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
