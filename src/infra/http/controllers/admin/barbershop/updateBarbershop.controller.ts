import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../../../database/prisma/client.js";
import { getAdmin } from "../../../middlewares/admin-auth.js";

/**
 * PATCH /admin/barbershop
 *
 * Update the authenticated admin's barbershop info.
 * This endpoint requires subscription guard.
 *
 * Body: {
 *   name?: string,
 *   phone?: string,
 *   timezone?: string,
 *   isQueueEnabled?: boolean,
 *   isAppointmentsEnabled?: boolean
 * }
 */
export async function updateBarbershopController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const admin = getAdmin(req);

  const bodySchema = z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be at most 100 characters")
      .optional(),
    phone: z
      .string()
      .min(10, "Phone must be at least 10 digits")
      .max(15, "Phone must be at most 15 characters")
      .optional(),
    timezone: z
      .string()
      .max(50, "Timezone must be at most 50 characters")
      .optional(),
    isQueueEnabled: z.boolean().optional(),
    isAppointmentsEnabled: z.boolean().optional(),
  });

  const validationResult = bodySchema.safeParse(req.body);

  if (!validationResult.success) {
    return reply.status(400).send({
      message: "Validation error",
      errors: validationResult.error.format(),
    });
  }

  const { name, phone, timezone, isQueueEnabled, isAppointmentsEnabled } =
    validationResult.data;

  // Check if phone is being changed and if it's already in use
  if (phone) {
    const existingBarbershop = await prisma.barbershop.findFirst({
      where: {
        phone,
        id: { not: admin.barbershopId },
      },
    });

    if (existingBarbershop) {
      return reply.status(409).send({
        message: "Phone number is already in use by another barbershop",
        code: "PHONE_EXISTS",
        field: "phone",
      });
    }
  }

  // Build update data
  const updateData: {
    name?: string;
    phone?: string;
    timezone?: string;
    isQueueEnabled?: boolean;
    isAppointmentsEnabled?: boolean;
  } = {};

  if (name !== undefined) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone;
  if (timezone !== undefined) updateData.timezone = timezone;
  if (isQueueEnabled !== undefined) updateData.isQueueEnabled = isQueueEnabled;
  if (isAppointmentsEnabled !== undefined)
    updateData.isAppointmentsEnabled = isAppointmentsEnabled;

  const barbershop = await prisma.barbershop.update({
    where: { id: admin.barbershopId },
    data: updateData,
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
