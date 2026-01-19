import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../../../database/prisma/client.js";
import { getAdmin } from "../../../middlewares/admin-auth.js";

/**
 * DELETE /admin/services/:id
 *
 * Delete a service from the authenticated admin's barbershop.
 *
 * Note: This will fail if the service has existing appointments.
 */
export async function deleteServiceController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const admin = getAdmin(req);

  const paramsSchema = z.object({
    id: z.string().uuid("Invalid service ID"),
  });

  const paramsResult = paramsSchema.safeParse(req.params);

  if (!paramsResult.success) {
    return reply.status(400).send({
      message: "Validation error",
      errors: paramsResult.error.format(),
    });
  }

  const { id } = paramsResult.data;

  // Check if service exists and belongs to barbershop
  const existingService = await prisma.service.findFirst({
    where: {
      id,
      barbershopId: admin.barbershopId,
    },
  });

  if (!existingService) {
    return reply.status(404).send({
      message: "Service not found",
      code: "SERVICE_NOT_FOUND",
    });
  }

  // Check if service has appointments
  const appointmentCount = await prisma.appointment.count({
    where: { serviceId: id },
  });

  if (appointmentCount > 0) {
    return reply.status(409).send({
      message: "Cannot delete service with existing appointments",
      code: "SERVICE_HAS_APPOINTMENTS",
      appointmentCount,
    });
  }

  // Delete service
  await prisma.service.delete({
    where: { id },
  });

  return reply.status(204).send();
}
