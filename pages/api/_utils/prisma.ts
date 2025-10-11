// pages/api/_utils/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // Necesitamos declarar el tipo de la variable global
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const prisma =
  global.__prisma ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}

export default prisma;
