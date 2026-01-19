import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../../../database/prisma/client.js";
import { getAdmin } from "../../../middlewares/admin-auth.js";

/**
 * DELETE /admin/barbers/:id
 *
 * Delete a barber from the authenticated admin's barbershop.
 *
 * Note: This will fail if the barber has existing appointments.
 * Consider soft-delete in the future for data integrity.
 */
export async function deleteBarberController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const admin = getAdmin(req);

  const paramsSchema = z.object({
    id: z.string().uuid("Invalid barber ID"),
  });

  const paramsResult = paramsSchema.safeParse(req.params);

  if (!paramsResult.success) {
    return reply.status(400).send({
      message: "Validation error",
      errors: paramsResult.error.format(),
    });
  }

  const { id } = paramsResult.data;

  // Check if barber exists and belongs to barbershop
  const existingBarber = await prisma.barber.findFirst({
    where: {
      id,
      barbershopId: admin.barbershopId,
    },
  });

  if (!existingBarber) {
    return reply.status(404).send({
      message: "Barber not found",
      code: "BARBER_NOT_FOUND",
    });
  }

  // Check if barber has appointments
  const appointmentCount = await prisma.appointment.count({
    where: { barberId: id },
  });

  if (appointmentCount > 0) {
    return reply.status(409).send({
      message: "Cannot delete barber with existing appointments",
      code: "BARBER_HAS_APPOINTMENTS",
      appointmentCount,
    });
  }

  // Delete barber (cascades to schedules and breaks)
  await prisma.barber.delete({
    where: { id },
  });

  return reply.status(204).send();
}
