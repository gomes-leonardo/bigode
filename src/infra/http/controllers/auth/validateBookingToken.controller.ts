import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import {
  ValidateBookingTokenUseCase,
  TokenExpiredError,
  TokenAlreadyUsedError,
  TokenNotFoundError,
  TokenRateLimitedError,
} from "../../../../domain/scheduling/application/use-cases/auth/ValidateBookingToken.js";
import { PrismaBookingTokenRepository } from "../../../database/prisma/repositories/booking-token-repository.js";
import { prisma } from "../../../database/prisma/client.js";
import { env } from "../../../env/env.js";

const bookingTokenRepository = new PrismaBookingTokenRepository();
const validateBookingTokenUseCase = new ValidateBookingTokenUseCase(
  bookingTokenRepository,
);

// Session JWT lifetime (short-lived for security)
const SESSION_JWT_EXPIRY = "30m";

/**
 * Validates a booking token and creates a session.
 *
 * Security flow:
 * 1. Receive opaque token from URL path
 * 2. Hash and lookup in database
 * 3. Validate expiration, usage, rate limits
 * 4. Create short-lived session JWT
 * 5. Deliver JWT via HttpOnly cookie (not in response body)
 *
 * The JWT contains:
 * - Internal customer identifier (not phone)
 * - Role (CLIENT)
 * - Barbershop scope
 *
 * NO PII in JWT. Phone is only used for communication.
 */
export async function validateBookingTokenController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    token: z.string().min(32), // Minimum length for security
  });

  const validationResult = paramsSchema.safeParse(req.params);

  if (!validationResult.success) {
    return reply.status(400).send({
      message: "Invalid booking link",
    });
  }

  const { token } = validationResult.data;

  try {
    // Validate token and get session data
    const session = await validateBookingTokenUseCase.execute({
      plainToken: token,
    });

    // Find or create customer (using phone for lookup only)
    let customer = await prisma.customer.findUnique({
      where: { phone: session.customerPhone },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: { phone: session.customerPhone },
      });
    }

    // Create session JWT with internal identifiers only
    const sessionJwt = req.server.jwt.sign(
      {
        sub: customer.id, // Internal ID, not phone
        role: "CLIENT",
        barbershopId: session.barbershopId,
        barberId: session.barberId, // May be null - customer chooses later
      },
      {
        expiresIn: SESSION_JWT_EXPIRY,
      },
    );

    // Set JWT as HttpOnly cookie (secure delivery)
    reply.setCookie("session", sessionJwt, {
      httpOnly: true, // Not accessible via JavaScript
      secure: env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "strict", // CSRF protection
      path: "/",
      maxAge: 30 * 60, // 30 minutes in seconds
    });

    // Return session info (without sensitive data)
    return reply.status(200).send({
      message: "Booking session started",
      barbershopId: session.barbershopId,
      barberId: session.barberId,
      // Customer can now proceed to select services and book
    });
  } catch (error) {
    // Security: Use generic error messages to prevent information leakage
    if (error instanceof TokenExpiredError) {
      return reply.status(410).send({
        message: "This booking link has expired. Please request a new one.",
        code: "TOKEN_EXPIRED",
      });
    }

    if (error instanceof TokenAlreadyUsedError) {
      return reply.status(410).send({
        message: "This booking link has already been used.",
        code: "TOKEN_USED",
      });
    }

    if (error instanceof TokenRateLimitedError) {
      return reply.status(429).send({
        message: "Too many attempts. Please wait a moment and try again.",
        code: "RATE_LIMITED",
      });
    }

    if (error instanceof TokenNotFoundError) {
      // Generic message - don't reveal if token exists or not
      return reply.status(404).send({
        message: "Invalid booking link.",
        code: "INVALID_TOKEN",
      });
    }

    throw error; // Let error handler deal with unexpected errors
  }
}
