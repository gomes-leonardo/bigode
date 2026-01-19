import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../../../database/prisma/client.js";
import { getAdmin } from "../../../middlewares/admin-auth.js";

/**
 * GET /admin/services
 *
 * List all services for the authenticated admin's barbershop.
 *
 * Response: {
 *   services: Array<{
 *     id, name, durationMin, price, createdAt, updatedAt
 *   }>
 * }
 */
export async function listServicesController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const admin = getAdmin(req);

  const services = await prisma.service.findMany({
    where: { barbershopId: admin.barbershopId },
    select: {
      id: true,
      name: true,
      durationMin: true,
      price: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { name: "asc" },
  });

  return reply.send({
    services: services.map((service) => ({
      id: service.id,
      name: service.name,
      durationMin: service.durationMin,
      price: Number(service.price),
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
    })),
  });
}
