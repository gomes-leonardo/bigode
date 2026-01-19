import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../../../database/prisma/client.js";
import { getAdmin } from "../../../middlewares/admin-auth.js";

/**
 * PATCH /admin/services/:id
 *
 * Update a service for the authenticated admin's barbershop.
 *
 * Body: {
 *   name?: string,
 *   durationMin?: number,
 *   price?: number
 * }
 */
export async function updateServiceController(
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

  const bodySchema = z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be at most 100 characters")
      .optional(),
    durationMin: z
      .number()
      .int("Duration must be a whole number")
      .min(5, "Duration must be at least 5 minutes")
      .max(480, "Duration must be at most 480 minutes (8 hours)")
      .optional(),
    price: z
      .number()
      .min(0, "Price cannot be negative")
      .max(100000, "Price must be at most 100000")
      .optional(),
  });

  const bodyResult = bodySchema.safeParse(req.body);

  if (!bodyResult.success) {
    return reply.status(400).send({
      message: "Validation error",
      errors: bodyResult.error.format(),
    });
  }

  const { id } = paramsResult.data;
  const { name, durationMin, price } = bodyResult.data;

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

  // Build update data
  const updateData: { name?: string; durationMin?: number; price?: number } =
    {};
  if (name !== undefined) updateData.name = name;
  if (durationMin !== undefined) updateData.durationMin = durationMin;
  if (price !== undefined) updateData.price = price;

  const service = await prisma.service.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      durationMin: true,
      price: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return reply.send({
    service: {
      id: service.id,
      name: service.name,
      durationMin: service.durationMin,
      price: Number(service.price),
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
    },
  });
}
