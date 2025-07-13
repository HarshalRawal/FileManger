import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();
const prisma = new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export default prisma;

export async function connectDB() {
    try {
        await prisma.$connect();
        console.log("Connected to database");
    } catch (error) {
        console.error("Error connecting to database", error);
        process.exit(1);
    }
}

export async function disconnectDB() {
    try {
        await prisma.$disconnect();
        console.log("Disconnected from database");
    } catch (error) {
        console.error("Error disconnecting from database", error);
        process.exit(1);
    }
}