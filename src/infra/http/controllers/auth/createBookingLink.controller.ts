import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { CreateBookingTokenUseCase } from "../../../../domain/scheduling/application/use-cases/auth/CreateBookingToken.js";
import { PrismaBookingTokenRepository } from "../../../database/prisma/repositories/booking-token-repository.js";
import { prisma } from "../../../database/prisma/client.js";

const bookingTokenRepository = new PrismaBookingTokenRepository();
const createBookingTokenUseCase = new CreateBookingTokenUseCase(
  bookingTokenRepository,
);

/**
 * Creates a secure booking link for a customer.
 *
 * Security:
 * - Generates opaque, cryptographically secure token
 * - No sensitive data in URL
 * - Token is single-use and expires in 15 minutes
 * - Only token hash stored in database
 *
 * This endpoint is called by the barbershop system (not the customer).
 */
export async function createBookingLinkController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const bodySchema = z.object({
    barbershopId: z.string().uuid(),
    barberId: z.string().uuid().optional(), // Optional - customer can choose later
    customerPhone: z.string().min(10).max(15),
  });

  const validationResult = bodySchema.safeParse(req.body);

  if (!validationResult.success) {
    return reply.status(400).send({
      message: "Validation error",
      errors: validationResult.error.format(),
    });
  }

  const { barbershopId, barberId, customerPhone } = validationResult.data;

  // #region agent log
  fetch("http://127.0.0.1:7248/ingest/3008e511-cba3-4d24-8c66-d1ac8aeab855", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "createBookingLink.controller.ts:44",
      message: "Before barbershop.findUnique",
      data: { barbershopId },
      timestamp: Date.now(),
      sessionId: "debug-session",
      runId: "pre-fix",
      hypothesisId: "H1,H3,H4,H5",
    }),
  }).catch(() => {});
  // #endregion

  // Verify barbershop exists
  let barbershop;
  try {
    barbershop = await prisma.barbershop.findUnique({
      where: { id: barbershopId },
    });
    // #region agent log
    fetch("http://127.0.0.1:7248/ingest/3008e511-cba3-4d24-8c66-d1ac8aeab855", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "createBookingLink.controller.ts:51",
        message: "After barbershop.findUnique SUCCESS",
        data: { found: !!barbershop },
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "pre-fix",
        hypothesisId: "H1,H3,H4,H5",
      }),
    }).catch(() => {});
    // #endregion
  } catch (error: unknown) {
    // #region agent log
    const err = error as Error & { code?: string };
    fetch("http://127.0.0.1:7248/ingest/3008e511-cba3-4d24-8c66-d1ac8aeab855", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "createBookingLink.controller.ts:56",
        message: "After barbershop.findUnique ERROR",
        data: {
          errorMessage: err?.message,
          errorCode: err?.code,
          errorName: err?.name,
        },
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "pre-fix",
        hypothesisId: "H1,H2,H3,H4,H5",
      }),
    }).catch(() => {});
    // #endregion
    throw error;
  }

  if (!barbershop) {
    return reply.status(404).send({
      message: "Barbershop not found",
    });
  }

  // Verify barber exists and belongs to barbershop (if provided)
  if (barberId) {
    const barber = await prisma.barber.findFirst({
      where: { id: barberId, barbershopId },
    });

    if (!barber) {
      return reply.status(404).send({
        message: "Barber not found in this barbershop",
      });
    }
  }

  const result = await createBookingTokenUseCase.execute({
    barbershopId,
    barberId,
    customerPhone,
  });

  return reply.status(201).send({
    bookingUrl: result.bookingUrl,
    expiresAt: result.expiresAt.toISOString(),
  });
}
