import { FastifyInstance } from "fastify";
import { healthController } from "../controllers/health/health.controller.js";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", healthController);
}
