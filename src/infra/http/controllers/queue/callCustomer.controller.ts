import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import {
  CallCustomerUseCase,
  QueueItemNotFoundError,
  InvalidQueueStatusError,
} from "../../../../domain/scheduling/application/use-cases/queue/CallCustomerUseCase.js";
import { PrismaQueueRepository } from "../../../database/prisma/repositories/queue-repository.js";
import { prisma } from "../../../database/prisma/client.js";
import { NotificationService } from "../../../../domain/scheduling/application/services/NotificationService.js";
import { getTwilioClient } from "../../../messaging/twilio/twilio.factory.js";

const queueRepository = new PrismaQueueRepository();
const callCustomerUseCase = new CallCustomerUseCase(queueRepository);
const notificationService = new NotificationService(getTwilioClient());

const paramsSchema = z.object({
  barbershopId: z.string().uuid(),
  queueItemId: z.string().uuid(),
});

/**
 * POST /barbershops/:barbershopId/queue/:queueItemId/call
 *
 * Admin action to call the next customer in queue.
 * Changes status to NOTIFIED and sends WhatsApp notification.
 */
export async function callCustomerController(
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

    // Call customer (update status to NOTIFIED)
    const result = await callCustomerUseCase.execute({
      queueItemId,
    });

    // Get customer and barbershop details for notification
    const queueItem = await prisma.queueItem.findUnique({
      where: { id: queueItemId },
      include: {
        customer: {
          select: { phone: true, name: true },
        },
        barbershop: {
          select: { name: true },
        },
      },
    });

    // Send WhatsApp notification (async, don't block response)
    if (queueItem?.customer.phone) {
      notificationService
        .sendQueueCallNotification({
          customerPhone: queueItem.customer.phone,
          customerName: queueItem.customer.name ?? undefined,
          barbershopName: queueItem.barbershop.name,
          position: result.position,
        })
        .then((notificationResult) => {
          if (notificationResult.success) {
            console.log(
              `[QUEUE] WhatsApp notification sent to ${queueItem.customer.phone}`,
            );
          } else {
            console.error(
              `[QUEUE] Failed to send notification: ${notificationResult.error}`,
            );
          }
        })
        .catch((error) => {
          console.error("[QUEUE] Notification error:", error);
        });
    }

    return reply.status(200).send({
      id: result.id,
      status: result.status,
      message: "Cliente notificado com sucesso",
      notificationSent: !!queueItem?.customer.phone,
    });
  } catch (error) {
    if (error instanceof QueueItemNotFoundError) {
      return reply.status(404).send({
        message: "Item da fila não encontrado",
        code: "QUEUE_ITEM_NOT_FOUND",
      });
    }

    if (error instanceof InvalidQueueStatusError) {
      return reply.status(400).send({
        message: "Status inválido para chamar cliente",
        code: "INVALID_QUEUE_STATUS",
      });
    }

    throw error;
  }
}
