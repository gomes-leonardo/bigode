import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../../../database/prisma/client.js";
import { getAdmin } from "../../../middlewares/admin-auth.js";

/**
 * POST /admin/services
 *
 * Create a new service for the authenticated admin's barbershop.
 *
 * Body: {
 *   name: string,
 *   durationMin: number (duration in minutes),
 *   price: number (price in cents or decimal)
 * }
 */
export async function createServiceController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const admin = getAdmin(req);

  const bodySchema = z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be at most 100 characters"),
    durationMin: z
      .number()
      .int("Duration must be a whole number")
      .min(5, "Duration must be at least 5 minutes")
      .max(480, "Duration must be at most 480 minutes (8 hours)"),
    price: z
      .number()
      .min(0, "Price cannot be negative")
      .max(100000, "Price must be at most 100000"),
  });

  const validationResult = bodySchema.safeParse(req.body);

  if (!validationResult.success) {
    return reply.status(400).send({
      message: "Validation error",
      errors: validationResult.error.format(),
    });
  }

  const { name, durationMin, price } = validationResult.data;

  const service = await prisma.service.create({
    data: {
      name,
      durationMin,
      price,
      barbershopId: admin.barbershopId,
    },
    select: {
      id: true,
      name: true,
      durationMin: true,
      price: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return reply.status(201).send({
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
