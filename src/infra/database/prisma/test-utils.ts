import { prisma } from "./client.js";
import { env } from "../../env/env.js";

export async function clearDatabase() {
  if (env.NODE_ENV === "production") {
    throw new Error("❌ YOU ARE TRYING TO CLEAN DB IN PRODUCTION!");
  }

  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== "_prisma_migrations")
    .map((name) => `"public"."${name}"`)
    .join(", ");

  try {
    if (tables.length > 0) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    }
  } catch (error) {
    console.error({ error });
  }
}
