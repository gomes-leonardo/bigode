import Fastify from "fastify";
import { healthController } from "./infra/http/controllers/health.controller.js";
import { env } from "./infra/env/env.js";

export const app = Fastify({
  logger: env.NODE_ENV === "production",
});

app.get("/health", healthController);
