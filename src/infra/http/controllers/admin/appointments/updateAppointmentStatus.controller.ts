import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { AppointmentStatus } from "@prisma/client";
import { PrismaAppointmentRepository } from "../../../../database/prisma/repositories/appointment-repository.js";
import { getAdmin } from "../../../middlewares/admin-auth.js";
import {
  UpdateAppointmentStatusUseCase,
  AppointmentNotFoundError,
  InvalidStatusTransitionError,
} from "../../../../../domain/scheduling/application/use-cases/schedulling/UpdateAppointmentStatus.js";

const appointmentRepository = new PrismaAppointmentRepository();
const updateStatusUseCase = new UpdateAppointmentStatusUseCase(
  appointmentRepository,
);

/**
 * PATCH /admin/appointments/:id/status
 *
 * Update appointment status (complete, no-show, etc.)
 */
export async function updateAppointmentStatusController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const admin = getAdmin(req);

  const paramsSchema = z.object({
    id: z.string().uuid(),
  });

  const bodySchema = z.object({
    status: z.enum(["COMPLETED", "NO_SHOW"]),
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
  const { status } = bodyResult.data;

  try {
    const { appointment } = await updateStatusUseCase.execute({
      appointmentId: id,
      barbershopId: admin.barbershopId,
      status: status as AppointmentStatus,
    });

    return reply.send({
      message: `Appointment marked as ${status.toLowerCase()}`,
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

    if (error instanceof InvalidStatusTransitionError) {
      return reply.status(409).send({
        message: error.message,
        code: "INVALID_STATUS_TRANSITION",
      });
    }

    throw error;
  }
}
