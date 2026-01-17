import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import {
  GetBarbersByBarbershopUseCase,
  BarbershopNotFoundError,
} from "../../../../domain/scheduling/application/use-cases/barbers/GetBarbersByBarbershop.js";
import { PrismaBarberRepository } from "../../../database/prisma/repositories/barber-repository.js";

const paramsSchema = z.object({
  barbershopId: z.string().uuid(),
});

export async function getBarbersController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parseResult = paramsSchema.safeParse(request.params);

  if (!parseResult.success) {
    return reply.status(400).send({
      message: "Validation error",
      errors: parseResult.error.format(),
    });
  }

  const { barbershopId } = parseResult.data;

  const barberRepository = new PrismaBarberRepository();
  const useCase = new GetBarbersByBarbershopUseCase(barberRepository);

  try {
    const barbers = await useCase.execute({ barbershopId });

    return reply.status(200).send({ barbers });
  } catch (error) {
    if (error instanceof BarbershopNotFoundError) {
      return reply.status(404).send({ message: "Barbershop not found" });
    }

    throw error;
  }
}
