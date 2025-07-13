/*
  Warnings:

  - A unique constraint covering the columns `[sapId]` on the table `File` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "sapId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "File_sapId_key" ON "File"("sapId");
