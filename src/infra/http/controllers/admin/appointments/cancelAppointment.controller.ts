import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { PrismaAppointmentRepository } from "../../../../database/prisma/repositories/appointment-repository.js";
import { getAdmin } from "../../../middlewares/admin-auth.js";
import {
  CancelAppointmentUseCase,
  AppointmentNotFoundError,
  AppointmentAlreadyCanceledError,
  AppointmentAlreadyCompletedError,
} from "../../../../../domain/scheduling/application/use-cases/schedulling/CancelAppointment.js";
import { NotificationService } from "../../../../../domain/scheduling/application/services/NotificationService.js";
import { getTwilioClient } from "../../../../messaging/twilio/twilio.factory.js";
import { prisma } from "../../../../database/prisma/client.js";

const appointmentRepository = new PrismaAppointmentRepository();
const cancelAppointmentUseCase = new CancelAppointmentUseCase(
  appointmentRepository,
);

/**
 * POST /admin/appointments/:id/cancel
 *
 * Cancel an appointment and notify the customer via WhatsApp.
 */
export async function cancelAppointmentController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const admin = getAdmin(req);

  const paramsSchema = z.object({
    id: z.string().uuid(),
  });

  const bodySchema = z.object({
    reason: z.string().max(200).optional(),
  });

  const paramsResult = paramsSchema.safeParse(req.params);
  if (!paramsResult.success) {
    return reply.status(400).send({
      message: "Validation error",
      errors: paramsResult.error.format(),
    });
  }

  const bodyResult = bodySchema.safeParse(req.body);
  if (!bodyResult.success) {
    return reply.status(400).send({
      message: "Validation error",
      errors: bodyResult.error.format(),
    });
  }

  const { id } = paramsResult.data;
  const { reason } = bodyResult.data;

  try {
    const { appointment } = await cancelAppointmentUseCase.execute({
      appointmentId: id,
      barbershopId: admin.barbershopId,
      reason,
    });

    // Send cancellation notification via WhatsApp
    const barbershop = await prisma.barbershop.findUnique({
      where: { id: admin.barbershopId },
      select: { name: true },
    });

    if (barbershop) {
      const notificationService = new NotificationService(getTwilioClient());

      const timeStr = appointment.startTime.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Sao_Paulo",
      });

      await notificationService.sendCancellationNotification({
        customerPhone: appointment.customer.phone,
        customerName: appointment.customer.name ?? undefined,
        barbershopName: barbershop.name,
        appointmentDate: appointment.startTime,
        appointmentTime: timeStr,
        reason,
      });
    }

    return reply.send({
      message: "Appointment canceled successfully",
      appointment: {
        id: appointment.id,
        startTime: appointment.startTime.toISOString(),
        endTime: appointment.endTime.toISOString(),
        status: appointment.status,
        barber: appointment.barber,
        service: appointment.service,
        customer: appointment.customer,
      },
    });
  } catch (error) {
    if (error instanceof AppointmentNotFoundError) {
      return reply.status(404).send({
        message: "Appointment not found",
        code: "APPOINTMENT_NOT_FOUND",
      });
    }

    if (error instanceof AppointmentAlreadyCanceledError) {
      return reply.status(409).send({
        message: "Appointment is already canceled",
        code: "ALREADY_CANCELED",
      });
    }

    if (error instanceof AppointmentAlreadyCompletedError) {
      return reply.status(409).send({
        message: "Cannot cancel a completed appointment",
        code: "ALREADY_COMPLETED",
      });
    }

    throw error;
  }
}
