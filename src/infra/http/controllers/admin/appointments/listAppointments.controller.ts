import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { AppointmentStatus } from "@prisma/client";
import { PrismaAppointmentRepository } from "../../../../database/prisma/repositories/appointment-repository.js";
import { getAdmin } from "../../../middlewares/admin-auth.js";

const appointmentRepository = new PrismaAppointmentRepository();

/**
 * GET /admin/appointments
 *
 * List appointments for the admin's barbershop.
 * Supports filtering by date range, barber, and status.
 *
 * Query params:
 * - startDate: ISO date string (default: today start)
 * - endDate: ISO date string (default: today end)
 * - barberId: UUID (optional)
 * - status: SCHEDULED | COMPLETED | CANCELED | NO_SHOW (optional)
 */
export async function listAppointmentsController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const admin = getAdmin(req);

  const querySchema = z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    barberId: z.string().uuid().optional(),
    status: z
      .enum(["SCHEDULED", "COMPLETED", "CANCELED", "NO_SHOW"])
      .optional(),
  });

  const validationResult = querySchema.safeParse(req.query);

  if (!validationResult.success) {
    return reply.status(400).send({
      message: "Validation error",
      errors: validationResult.error.format(),
    });
  }

  const { startDate, endDate, barberId, status } = validationResult.data;

  // Default to today if no dates provided
  const now = new Date();
  const defaultStartDate = new Date(now);
  defaultStartDate.setHours(0, 0, 0, 0);

  const defaultEndDate = new Date(now);
  defaultEndDate.setHours(23, 59, 59, 999);

  const appointments = await appointmentRepository.listByBarbershop({
    barbershopId: admin.barbershopId,
    barberId,
    status: status as AppointmentStatus | undefined,
    startDate: startDate ? new Date(startDate) : defaultStartDate,
    endDate: endDate ? new Date(endDate) : defaultEndDate,
  });

  const formattedAppointments = appointments.map((apt) => ({
    id: apt.id,
    startTime: apt.startTime.toISOString(),
    endTime: apt.endTime.toISOString(),
    status: apt.status,
    barber: apt.barber,
    service: apt.service,
    customer: apt.customer,
    createdAt: apt.createdAt.toISOString(),
  }));

  return reply.send({
    appointments: formattedAppointments,
    count: formattedAppointments.length,
  });
}
