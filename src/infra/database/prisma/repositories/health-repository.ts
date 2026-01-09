import { prisma } from "../client.js";

export interface DatabaseHealth {
  status: "connected" | "disconnected";
  openConnections: number;
}

export class PrismaHealthRepository {
  async checkDatabase(): Promise<DatabaseHealth> {
    try {
      const result = await prisma.$queryRaw<{ count: bigint }[]>`
        SELECT count(*) FROM pg_stat_activity
        WHERE datname = current_database()
      `;

      const openConnections = Number(result[0]?.count ?? 0);

      return {
        status: "connected",
        openConnections,
      };
    } catch {
      return {
        status: "disconnected",
        openConnections: 0,
      };
    }
  }
}
