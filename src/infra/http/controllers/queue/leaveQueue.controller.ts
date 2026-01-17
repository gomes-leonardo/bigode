import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import {
  LeaveQueueUseCase,
  QueueItemNotFoundError,
} from "../../../../domain/scheduling/application/use-cases/queue/LeaveQueueUseCase.js";
import { PrismaQueueRepository } from "../../../database/prisma/repositories/queue-repository.js";

const queueRepository = new PrismaQueueRepository();
const leaveQueueUseCase = new LeaveQueueUseCase(queueRepository);

const paramsSchema = z.object({
  barbershopId: z.string().uuid(),
  queueItemId: z.string().uuid(),
});

/**
 * DELETE /barbershops/:barbershopId/queue/:queueItemId
 *
 * Allows a customer to leave the queue before being served.
 */
export async function leaveQueueController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    // Validate params
    const paramsResult = paramsSchema.safeParse(req.params);
    if (!paramsResult.success) {
      return reply.status(400).send({
        message: "Invalid parameters",
        errors: paramsResult.error.format(),
      });
    }

    const { queueItemId } = paramsResult.data;

    // Leave queue
    const result = await leaveQueueUseCase.execute({
      queueItemId,
    });

    return reply.status(200).send({
      id: result.id,
      status: result.status,
      message: "Você saiu da fila com sucesso",
    });
  } catch (error) {
    if (error instanceof QueueItemNotFoundError) {
      return reply.status(404).send({
        message: "Item da fila não encontrado",
        code: "QUEUE_ITEM_NOT_FOUND",
      });
    }

    throw error;
  }
}
