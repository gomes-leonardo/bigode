import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { PrismaAppointmentRepository } from "../../../../database/prisma/repositories/appointment-repository.js";
import { GetAvailabilityUseCase } from "../../../../../domain/scheduling/application/use-cases/schedulling/GetAvailability.js";

const appointmentRepository = new PrismaAppointmentRepository();
const getAvailabilityUseCase = new GetAvailabilityUseCase(
  appointmentRepository,
);

export async function getAvailabilityController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const querySchema = z.object({
    barberId: z.string().uuid(),
    date: z.coerce.date(),
  });

  const validationResult = querySchema.safeParse(req.query);

  if (!validationResult.success) {
    return reply.status(400).send({
      message: "Validation error",
      errors: validationResult.error.format(),
    });
  }

  const { barberId, date } = validationResult.data;

  const slots = await getAvailabilityUseCase.execute({
    barberId,
    date,
  });

  return reply.status(200).send({ slots });
}
