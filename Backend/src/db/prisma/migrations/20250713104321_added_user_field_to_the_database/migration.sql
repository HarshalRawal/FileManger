-- CreateEnum
CREATE TYPE "userRole" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sapId" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "userRole" NOT NULL DEFAULT 'USER',
    "refreshToken" TEXT,
    "forgetPasswordToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_sapId_key" ON "User"("sapId");
