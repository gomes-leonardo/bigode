import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import {
  RequestAdminOTPUseCase,
  AdminNotFoundError,
  AdminInactiveError,
  RateLimitExceededError,
} from "../../../../domain/scheduling/application/use-cases/admin/RequestAdminOTP.js";
import { PrismaAdminOTPRepository } from "../../../database/prisma/repositories/admin-otp-repository.js";
import { NotificationService } from "../../../../domain/scheduling/application/services/NotificationService.js";
import {
  TwilioClient,
  MockTwilioClient,
} from "../../../messaging/twilio/twilio.service.js";
import { env } from "../../../env/env.js";

// Initialize dependencies
const adminOTPRepository = new PrismaAdminOTPRepository();

// Use mock client in dev if Twilio is not configured
const twilioClient =
  env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN
    ? new TwilioClient({
        accountSid: env.TWILIO_ACCOUNT_SID,
        authToken: env.TWILIO_AUTH_TOKEN,
        whatsappNumber: env.TWILIO_WHATSAPP_NUMBER || "",
      })
    : new MockTwilioClient();

const notificationService = new NotificationService(twilioClient);

const requestAdminOTPUseCase = new RequestAdminOTPUseCase(
  adminOTPRepository,
  notificationService,
  env.NODE_ENV === "dev", // isDevelopment - returns code in response for testing
);

/**
 * POST /admin/auth/request-otp
 *
 * Request OTP code for admin authentication via WhatsApp.
 *
 * Body: { phone: string }
 * Response: { success: true, message: string, expiresAt: string, devCode?: string }
 *
 * In development mode, the OTP code is returned in the response for testing.
 * In production, the code is only sent via WhatsApp.
 */
export async function requestOTPController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const bodySchema = z.object({
    phone: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .max(15, "Phone number must be at most 15 characters"),
  });

  const validationResult = bodySchema.safeParse(req.body);

  if (!validationResult.success) {
    return reply.status(400).send({
      message: "Validation error",
      errors: validationResult.error.format(),
    });
  }

  try {
    const result = await requestAdminOTPUseCase.execute({
      phone: validationResult.data.phone,
    });

    return reply.status(200).send({
      success: result.success,
      message: result.message,
      expiresAt: result.expiresAt.toISOString(),
      ...(result.devCode && { devCode: result.devCode }),
    });
  } catch (error) {
    if (error instanceof AdminNotFoundError) {
      // Don't reveal if account exists - return generic message
      return reply.status(200).send({
        success: true,
        message:
          "Se este número estiver cadastrado, você receberá um código via WhatsApp.",
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      });
    }

    if (error instanceof AdminInactiveError) {
      return reply.status(403).send({
        message: "Account is inactive. Contact support.",
      });
    }

    if (error instanceof RateLimitExceededError) {
      return reply.status(429).send({
        message: error.message,
      });
    }

    throw error;
  }
}
