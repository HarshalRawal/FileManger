-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "Project" AS ENUM ('KIRANDUL_COMPLEX', 'BACHELI_COMPLEX');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "sapId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'EMPLOYEE',
    "password" TEXT,
    "department" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "project" "Project" NOT NULL,
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_sapId_key" ON "User"("sapId");
