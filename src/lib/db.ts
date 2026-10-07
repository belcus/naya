import { PrismaClient } from "@prisma/client";

// Singleton Prisma Client — évite d'épuiser les connexions en dev (hot reload Next.js).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
