import { FastifyInstance } from "fastify";
import { twilioStatusWebhookController } from "../controllers/webhook/twilioWebhook.controller.js";
import { twilioIncomingWebhookController } from "../controllers/webhook/twilioIncomingWebhook.controller.js";
import { stripeWebhookController } from "../controllers/webhook/stripeWebhook.controller.js";

export async function webhookRoutes(app: FastifyInstance) {
  // Twilio status callback - receives form-urlencoded data
  app.post("/twilio/status", twilioStatusWebhookController);

  // Twilio incoming message - receives customer WhatsApp messages
  app.post("/twilio/incoming", twilioIncomingWebhookController);

  // Stripe webhook - receives payment and subscription events
  app.post("/stripe", stripeWebhookController);
}
