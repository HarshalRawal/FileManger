/*
  Warnings:

  - You are about to drop the column `StoredName` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `mineType` on the `File` table. All the data in the column will be lost.
  - Added the required column `mimeType` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storedName` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" DROP COLUMN "StoredName",
DROP COLUMN "mineType",
ADD COLUMN     "mimeType" TEXT NOT NULL,
ADD COLUMN     "storedName" TEXT NOT NULL;
