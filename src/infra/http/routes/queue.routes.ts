import { FastifyInstance } from "fastify";
import { joinQueueController } from "../controllers/queue/joinQueue.controller.js";
import { leaveQueueController } from "../controllers/queue/leaveQueue.controller.js";
import { callCustomerController } from "../controllers/queue/callCustomer.controller.js";
import { getQueueStatusController } from "../controllers/queue/getQueueStatus.controller.js";

export async function queueRoutes(app: FastifyInstance) {
  // Public routes (customer actions)
  // POST /barbershops/:barbershopId/queue - Join queue
  app.post("/barbershops/:barbershopId/queue", joinQueueController);

  // GET /barbershops/:barbershopId/queue - Get queue status
  app.get("/barbershops/:barbershopId/queue", getQueueStatusController);

  // DELETE /barbershops/:barbershopId/queue/:queueItemId - Leave queue
  app.delete(
    "/barbershops/:barbershopId/queue/:queueItemId",
    leaveQueueController,
  );

  // Admin routes (require authentication in production)
  // POST /barbershops/:barbershopId/queue/:queueItemId/call - Call customer
  app.post(
    "/barbershops/:barbershopId/queue/:queueItemId/call",
    callCustomerController,
  );
}
