import { FastifyInstance } from "fastify";
import { authRoutes } from "./auth.routes.js";
import { healthRoutes } from "./health.routes.js";
import { schedulingRoutes } from "./scheduling.routes.js";
import { barbershopRoutes } from "./barbershop.routes.js";
import { adminRoutes } from "./admin.routes.js";
import { webhookRoutes } from "./webhook.routes.js";
import { queueRoutes } from "./queue.routes.js";

export async function appRoutes(app: FastifyInstance) {
  await healthRoutes(app);
  await authRoutes(app);
  await schedulingRoutes(app);
  await barbershopRoutes(app);
  await adminRoutes(app);
  await queueRoutes(app);
  app.register(webhookRoutes, { prefix: "/webhooks" });
}
