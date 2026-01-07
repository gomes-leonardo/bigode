import { PrismaClient } from "../../../generated/prisma";
import { env } from "../../env/env";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: env.NODE_ENV === "dev" ? ["query"] : [],
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
