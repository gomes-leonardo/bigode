import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { PrismaQueueRepository } from "../../../database/prisma/repositories/queue-repository.js";

const queueRepository = new PrismaQueueRepository();

const paramsSchema = z.object({
  barbershopId: z.string().uuid(),
});

/**
 * GET /barbershops/:barbershopId/queue
 *
 * Returns the current queue status for a barbershop.
 * Shows all WAITING and NOTIFIED customers.
 */
export async function getQueueStatusController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  // Validate params
  const paramsResult = paramsSchema.safeParse(req.params);
  if (!paramsResult.success) {
    return reply.status(400).send({
      message: "Invalid barbershop ID",
      errors: paramsResult.error.format(),
    });
  }

  const { barbershopId } = paramsResult.data;

  // Check if barbershop exists and queue is enabled
  const barbershop = await queueRepository.findBarbershopById(barbershopId);

  if (!barbershop) {
    return reply.status(404).send({
      message: "Barbearia não encontrada",
      code: "BARBERSHOP_NOT_FOUND",
    });
  }

  if (!barbershop.isQueueEnabled) {
    return reply.status(400).send({
      message: "A fila não está habilitada para esta barbearia",
      code: "QUEUE_DISABLED",
    });
  }

  // Get queue items
  const queueItems =
    await queueRepository.findWaitingByBarbershop(barbershopId);

  const waitingCount = queueItems.filter(
    (item) => item.status === "WAITING",
  ).length;
  const notifiedCount = queueItems.filter(
    (item) => item.status === "NOTIFIED",
  ).length;

  return reply.status(200).send({
    barbershopId,
    isQueueEnabled: barbershop.isQueueEnabled,
    totalInQueue: queueItems.length,
    waitingCount,
    notifiedCount,
    items: queueItems.map((item) => ({
      id: item.id,
      position: item.position,
      status: item.status,
      joinedAt: item.joinedAt,
      customerName: item.customerName,
      customerPhone: item.customerPhone,
      preferredBarberName: item.preferredBarberName,
    })),
  });
}
