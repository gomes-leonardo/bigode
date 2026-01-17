import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import {
  CreateAppointmentUseCase,
  SlotOccupiedError,
} from "../../../../../domain/scheduling/application/use-cases/schedulling/CreateAppointment.js";
import { PrismaAppointmentRepository } from "../../../../database/prisma/repositories/appointment-repository.js";
import { prisma } from "../../../../database/prisma/client.js";

const appointmentRepository = new PrismaAppointmentRepository();
const createAppointmentUseCase = new CreateAppointmentUseCase(
  appointmentRepository,
);

export async function createAppointmentController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    // Verificar e decodificar JWT
    await req.jwtVerify();
    const user = req.user as {
      sub: string;
      role: string;
      barbershopId: string;
    };

    const customerPhone = user.sub;
    const barbershopId = user.barbershopId;

    // Validar body
    const bodySchema = z.object({
      barberId: z.string().uuid(),
      serviceId: z.string().uuid(),
      startTime: z.string().datetime(),
    });

    const validationResult = bodySchema.safeParse(req.body);

    if (!validationResult.success) {
      return reply.status(400).send({
        message: "Validation error",
        errors: validationResult.error.format(),
      });
    }

    const { barberId, serviceId, startTime } = validationResult.data;

    // Buscar service para obter durationMin
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { durationMin: true },
    });

    if (!service) {
      return reply.status(404).send({
        message: "Service not found",
      });
    }

    // Criar appointment via use case
    const appointment = await createAppointmentUseCase.execute({
      barberId,
      serviceId,
      barbershopId,
      customerPhone,
      startTime: new Date(startTime),
      durationMin: service.durationMin,
    });

    return reply.status(201).send(appointment);
  } catch (error) {
    if (error instanceof SlotOccupiedError) {
      return reply.status(409).send({
        message: "Appointment already exists",
      });
    }
    throw error; // Deixa o error handler tratar outros erros
  }
}
