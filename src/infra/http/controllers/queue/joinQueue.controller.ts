import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import {
  JoinQueueUseCase,
  QueueDisabledError,
  AlreadyInQueueError,
  CustomerNotFoundError,
  BarbershopNotFoundError,
} from "../../../../domain/scheduling/application/use-cases/queue/JoinQueueUseCase.js";
import { PrismaQueueRepository } from "../../../database/prisma/repositories/queue-repository.js";
import { prisma } from "../../../database/prisma/client.js";

const queueRepository = new PrismaQueueRepository();
const joinQueueUseCase = new JoinQueueUseCase(queueRepository);

const bodySchema = z.object({
  customerPhone: z.string().min(10).max(15),
  customerName: z.string().optional(),
  preferredBarberId: z.string().uuid().optional(),
});

const paramsSchema = z.object({
  barbershopId: z.string().uuid(),
});

/**
 * POST /barbershops/:barbershopId/queue
 *
 * Allows a customer to join the virtual waiting queue.
 * Creates customer if not exists (by phone).
 */
export async function joinQueueController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    // Validate params
    const paramsResult = paramsSchema.safeParse(req.params);
    if (!paramsResult.success) {
      return reply.status(400).send({
        message: "Invalid barbershop ID",
        errors: paramsResult.error.format(),
      });
    }

    // Validate body
    const bodyResult = bodySchema.safeParse(req.body);
    if (!bodyResult.success) {
      return reply.status(400).send({
        message: "Validation error",
        errors: bodyResult.error.format(),
      });
    }

    const { barbershopId } = paramsResult.data;
    const { customerPhone, customerName, preferredBarberId } = bodyResult.data;

    // Normalize phone number
    const normalizedPhone = customerPhone.replace(/[^\d+]/g, "");

    // Find or create customer
    let customer = await prisma.customer.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          phone: normalizedPhone,
          name: customerName,
        },
      });
    }

    // Join queue
    const queueItem = await joinQueueUseCase.execute({
      customerId: customer.id,
      barbershopId,
      preferredBarberId,
    });

    return reply.status(201).send({
      id: queueItem.id,
      position: queueItem.position,
      estimatedWaitMinutes: queueItem.estimatedWaitMinutes,
      status: queueItem.status,
      joinedAt: queueItem.joinedAt,
      message: `Você está na posição ${queueItem.position} da fila`,
    });
  } catch (error) {
    if (error instanceof QueueDisabledError) {
      return reply.status(400).send({
        message: "A fila não está habilitada para esta barbearia",
        code: "QUEUE_DISABLED",
      });
    }

    if (error instanceof AlreadyInQueueError) {
      return reply.status(409).send({
        message: "Você já está na fila",
        code: "ALREADY_IN_QUEUE",
      });
    }

    if (error instanceof CustomerNotFoundError) {
      return reply.status(404).send({
        message: "Cliente não encontrado",
        code: "CUSTOMER_NOT_FOUND",
      });
    }

    if (error instanceof BarbershopNotFoundError) {
      return reply.status(404).send({
        message: "Barbearia não encontrada",
        code: "BARBERSHOP_NOT_FOUND",
      });
    }

    throw error;
  }
}
