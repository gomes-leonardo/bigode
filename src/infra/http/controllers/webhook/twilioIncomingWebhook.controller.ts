import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { env } from "../../../env/env.js";
import { getTwilioClient } from "../../../messaging/twilio/twilio.factory.js";
import { ConversationService } from "../../../../domain/scheduling/application/services/ConversationService.js";

const twilioClient = getTwilioClient();
const conversationService = new ConversationService();

/**
 * Twilio Incoming Message Webhook
 *
 * Receives messages sent by customers to our WhatsApp number.
 * Processes through the ConversationService and sends appropriate response.
 *
 * Twilio sends incoming messages as form-urlencoded POST requests.
 *
 * Important fields from Twilio:
 * - From: The sender's phone (whatsapp:+5511999998888)
 * - To: Our Twilio number (whatsapp:+14155238886)
 * - Body: The message text
 * - MessageSid: Unique message identifier
 * - ProfileName: WhatsApp profile name (if available)
 */

const twilioIncomingSchema = z.object({
  MessageSid: z.string(),
  From: z.string(), // whatsapp:+5511999998888
  To: z.string(), // whatsapp:+14155238886
  Body: z.string(),
  ProfileName: z.string().optional(),
  NumMedia: z.string().optional(),
});

export async function twilioIncomingWebhookController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    // Validate webhook signature in production
    if (env.NODE_ENV === "production" && env.TWILIO_AUTH_TOKEN) {
      const signature = request.headers["x-twilio-signature"] as string;
      const url = `${request.protocol}://${request.hostname}${request.url}`;
      const params = request.body as Record<string, string>;

      const isValid = twilioClient.validateWebhookSignature(
        signature,
        url,
        params,
      );

      if (!isValid) {
        console.error("[WEBHOOK INCOMING] Invalid Twilio signature");
        return reply.status(403).send({ error: "Invalid signature" });
      }
    }

    // Parse incoming message
    const parsed = twilioIncomingSchema.safeParse(request.body);

    if (!parsed.success) {
      console.error("[WEBHOOK INCOMING] Invalid payload:", parsed.error);
      // Return TwiML empty response
      return reply
        .header("Content-Type", "text/xml")
        .status(200)
        .send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
    }

    const { MessageSid, From, To, Body } = parsed.data;

    console.log(
      `[WEBHOOK INCOMING] Message from ${From}: "${Body.substring(0, 50)}${Body.length > 50 ? "..." : ""}"`,
    );

    // Process message through conversation service
    const botResponse = await conversationService.processMessage({
      from: From,
      to: To,
      body: Body,
      messageSid: MessageSid,
    });

    // Send response via Twilio
    const result = await twilioClient.sendWhatsAppMessage({
      to: From,
      body: botResponse.message,
    });

    if (!result.success) {
      console.error(
        "[WEBHOOK INCOMING] Failed to send response:",
        result.error,
      );
    } else {
      console.log(`[WEBHOOK INCOMING] Response sent: ${result.messageSid}`);
    }

    // Return TwiML empty response (we're sending via API, not TwiML)
    // This acknowledges receipt to Twilio
    return reply
      .header("Content-Type", "text/xml")
      .status(200)
      .send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  } catch (error) {
    console.error("[WEBHOOK INCOMING] Error processing message:", error);

    // Return empty TwiML to prevent Twilio retries
    return reply
      .header("Content-Type", "text/xml")
      .status(200)
      .send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  }
}
