import { FastifyReply, FastifyRequest } from "fastify";
import { PrismaHealthRepository } from "../../../database/prisma/repositories/health-repository.js";

const healthRepository = new PrismaHealthRepository();

export async function healthController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  const database = await healthRepository.checkDatabase();

  const isHealthy = database.status === "connected";

  return reply.status(isHealthy ? 200 : 503).send({
    status: isHealthy ? "healthy" : "unhealthy",
    database,
  });
}
