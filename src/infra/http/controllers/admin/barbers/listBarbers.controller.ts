import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../../../database/prisma/client.js";
import { getAdmin } from "../../../middlewares/admin-auth.js";

/**
 * GET /admin/barbers
 *
 * List all barbers for the authenticated admin's barbershop.
 *
 * Response: {
 *   barbers: Array<{
 *     id, name, phone, createdAt, updatedAt,
 *     schedules: Array<{ dayOfWeek, startTime, endTime, isActive }>
 *   }>
 * }
 */
export async function listBarbersController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const admin = getAdmin(req);

  const barbers = await prisma.barber.findMany({
    where: { barbershopId: admin.barbershopId },
    select: {
      id: true,
      name: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
      schedules: {
        select: {
          id: true,
          dayOfWeek: true,
          startTime: true,
          endTime: true,
          isActive: true,
          breaks: {
            select: {
              id: true,
              startTime: true,
              endTime: true,
            },
          },
        },
        orderBy: { dayOfWeek: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return reply.send({
    barbers: barbers.map((barber) => ({
      ...barber,
      createdAt: barber.createdAt.toISOString(),
      updatedAt: barber.updatedAt.toISOString(),
    })),
  });
}
