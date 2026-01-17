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

  // Verify barbershop exists
  const barbershop = await prisma.barbershop.findUnique({
    where: { id: barbershopId },
  });

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
