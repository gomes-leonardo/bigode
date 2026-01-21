import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { PrismaAppointmentRepository } from "../../../../database/prisma/repositories/appointment-repository.js";
import { getAdmin } from "../../../middlewares/admin-auth.js";

const appointmentRepository = new PrismaAppointmentRepository();

/**
 * GET /admin/appointments/:id
 *
 * Get a single appointment by ID.
 */
export async function getAppointmentController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const admin = getAdmin(req);

  const paramsSchema = z.object({
    id: z.string().uuid(),
  });

  const validationResult = paramsSchema.safeParse(req.params);

  if (!validationResult.success) {
    return reply.status(400).send({
      message: "Validation error",
      errors: validationResult.error.format(),
    });
  }

  const { id } = validationResult.data;

  const appointment = await appointmentRepository.findByIdAndBarbershop(
    id,
    admin.barbershopId,
  );

  if (!appointment) {
    return reply.status(404).send({
      message: "Appointment not found",
      code: "APPOINTMENT_NOT_FOUND",
    });
  }

  return reply.send({
    appointment: {
      id: appointment.id,
      startTime: appointment.startTime.toISOString(),
      endTime: appointment.endTime.toISOString(),
      status: appointment.status,
      barber: appointment.barber,
      service: appointment.service,
      customer: appointment.customer,
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
    },
  });
}
