import { prisma } from "./client.js";
import { env } from "../../env/env.js";

export async function clearDatabase() {
  if (env.NODE_ENV === "production") {
    throw new Error("❌ YOU ARE TRYING TO CLEAN DB IN PRODUCTION!");
  }

  try {
    const tablenames = await prisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    const tables = tablenames
      .map(({ tablename }) => tablename)
      .filter((name) => name !== "_prisma_migrations")
      .map((name) => `"public"."${name}"`)
      .join(", ");

    if (tables.length > 0) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    }
  } catch (error) {
    // Ignora erros de concorrência (quando múltiplos testes rodam simultaneamente)
    // Isso pode acontecer em modo watch quando vários arquivos de teste rodam ao mesmo tempo
    if (
      error instanceof Error &&
      (error.message.includes("Invalid") ||
        error.message.includes("already in use") ||
        error.message.includes("connection"))
    ) {
      // Tenta novamente após um pequeno delay
      await new Promise((resolve) => setTimeout(resolve, 100));
      try {
        const tablenames = await prisma.$queryRaw<
          Array<{ tablename: string }>
        >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

        const tables = tablenames
          .map(({ tablename }) => tablename)
          .filter((name) => name !== "_prisma_migrations")
          .map((name) => `"public"."${name}"`)
          .join(", ");

        if (tables.length > 0) {
          await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
        }
      } catch (retryError) {
        // Se ainda falhar, apenas loga mas não quebra o teste
        console.warn(
          "Failed to clear database (retry also failed):",
          retryError,
        );
      }
    } else {
      console.error("Error clearing database:", error);
    }
  }
}
