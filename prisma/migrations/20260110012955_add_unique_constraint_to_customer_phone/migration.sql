/*
  Warnings:

  - You are about to drop the column `barbershopId` on the `Customer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_barbershopId_fkey";

-- DropIndex
DROP INDEX "Customer_barbershopId_phone_key";

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "barbershopId";

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");
