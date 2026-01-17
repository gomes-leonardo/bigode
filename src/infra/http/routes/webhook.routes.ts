import { FastifyInstance } from "fastify";
import { twilioStatusWebhookController } from "../controllers/webhook/twilioWebhook.controller.js";

export async function webhookRoutes(app: FastifyInstance) {
  // Twilio status callback - receives form-urlencoded data
  app.post("/twilio/status", twilioStatusWebhookController);
}
