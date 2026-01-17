import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { PrismaMessageLogRepository } from "../../../database/prisma/repositories/message-log-repository.js";
import { env } from "../../../env/env.js";
import { getTwilioClient } from "../../../messaging/twilio/twilio.factory.js";

const messageLogRepository = new PrismaMessageLogRepository();
const twilioClient = getTwilioClient();

/**
 * Twilio Status Callback Webhook
 *
 * Twilio sends status updates as form-urlencoded POST requests.
 * We validate the signature, parse the status, and update our MessageLog.
 *
 * Status progression: queued -> sent -> delivered -> read
 * Or: queued -> sent -> failed/undelivered
 */

const twilioStatusSchema = z.object({
  MessageSid: z.string(),
  MessageStatus: z.enum([
    "queued",
    "sent",
    "delivered",
    "read",
    "failed",
    "undelivered",
  ]),
  ErrorCode: z.string().optional(),
  ErrorMessage: z.string().optional(),
  To: z.string().optional(),
  From: z.string().optional(),
});

export async function twilioStatusWebhookController(
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
        console.error("[WEBHOOK] Invalid Twilio signature");
        return reply.status(403).send({ error: "Invalid signature" });
      }
    }

    // Parse webhook payload
    const parsed = twilioStatusSchema.safeParse(request.body);

    if (!parsed.success) {
      console.error("[WEBHOOK] Invalid payload:", parsed.error);
      // Return 200 anyway - Twilio will retry on non-2xx
      return reply.status(200).send({ received: true, valid: false });
    }

    const { MessageSid, MessageStatus, ErrorCode, ErrorMessage } = parsed.data;

    console.log(`[WEBHOOK] Status update: ${MessageSid} -> ${MessageStatus}`);

    // Find the message in our database
    const existingLog = await messageLogRepository.findByTwilioSid(MessageSid);

    if (!existingLog) {
      // Message not in our system - could be from a different source
      console.log(`[WEBHOOK] Unknown message SID: ${MessageSid}`);
      return reply.status(200).send({ received: true, found: false });
    }

    // Update status based on the new state
    const now = new Date();
    const updateData: {
      twilioStatus: string;
      deliveredAt?: Date;
      readAt?: Date;
      failedAt?: Date;
      errorMessage?: string;
      webhookPayload?: Record<string, unknown>;
    } = {
      twilioStatus: MessageStatus,
      webhookPayload: request.body as Record<string, unknown>,
    };

    switch (MessageStatus) {
      case "delivered":
        updateData.deliveredAt = now;
        break;
      case "read":
        updateData.readAt = now;
        break;
      case "failed":
      case "undelivered":
        updateData.failedAt = now;
        updateData.errorMessage = ErrorMessage || `Error code: ${ErrorCode}`;
        break;
    }

    await messageLogRepository.updateStatus(MessageSid, updateData);

    // Always return 200 to acknowledge receipt
    return reply.status(200).send({ received: true, status: MessageStatus });
  } catch (error) {
    console.error("[WEBHOOK] Error processing status update:", error);
    // Return 200 to prevent Twilio retries on our errors
    return reply.status(200).send({ received: true, error: true });
  }
}
