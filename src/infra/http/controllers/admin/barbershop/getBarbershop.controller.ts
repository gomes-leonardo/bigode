import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../../../database/prisma/client.js";
import { getAdmin } from "../../../middlewares/admin-auth.js";

/**
 * GET /admin/barbershop
 *
 * Get the authenticated admin's barbershop info.
 * This endpoint does NOT require subscription guard (always accessible).
 *
 * Response: {
 *   barbershop: {
 *     id, name, slug, phone, timezone,
 *     isQueueEnabled, isAppointmentsEnabled,
 *     subscriptionStatus, subscriptionTier,
 *     trialInfo, createdAt, updatedAt
 *   }
 * }
 */
export async function getBarbershopController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const admin = getAdmin(req);

  const barbershop = await prisma.barbershop.findUnique({
    where: { id: admin.barbershopId },
    select: {
      id: true,
      name: true,
      slug: true,
      phone: true,
      timezone: true,
      isQueueEnabled: true,
      isAppointmentsEnabled: true,
      subscriptionStatus: true,
      subscriptionTier: true,
      trialStartedAt: true,
      trialEndsAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!barbershop) {
    return reply.status(404).send({
      message: "Barbershop not found",
      code: "BARBERSHOP_NOT_FOUND",
    });
  }

  // Calculate trial info
  let trialInfo = null;
  if (barbershop.trialStartedAt && barbershop.trialEndsAt) {
    const now = new Date();
    const daysRemaining = Math.max(
      0,
      Math.ceil(
        (barbershop.trialEndsAt.getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    );
    trialInfo = {
      startedAt: barbershop.trialStartedAt.toISOString(),
      endsAt: barbershop.trialEndsAt.toISOString(),
      daysRemaining,
      isExpired: barbershop.trialEndsAt < now,
    };
  }

  return reply.send({
    barbershop: {
      id: barbershop.id,
      name: barbershop.name,
      slug: barbershop.slug,
      phone: barbershop.phone,
      timezone: barbershop.timezone,
      isQueueEnabled: barbershop.isQueueEnabled,
      isAppointmentsEnabled: barbershop.isAppointmentsEnabled,
      subscriptionStatus: barbershop.subscriptionStatus,
      subscriptionTier: barbershop.subscriptionTier,
      trialInfo,
      createdAt: barbershop.createdAt.toISOString(),
      updatedAt: barbershop.updatedAt.toISOString(),
    },
  });
}
