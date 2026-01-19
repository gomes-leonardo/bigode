import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../../../../database/prisma/client.js";
import { getAdmin } from "../../../middlewares/admin-auth.js";

const scheduleSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
  isActive: z.boolean().default(true),
  breaks: z
    .array(
      z.object({
        startTime: z
          .string()
          .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
        endTime: z
          .string()
          .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
      }),
    )
    .optional()
    .default([]),
});

/**
 * POST /admin/barbers
 *
 * Create a new barber for the authenticated admin's barbershop.
 *
 * Body: {
 *   name: string,
 *   phone?: string,
 *   schedules?: Array<{
 *     dayOfWeek: number (0-6),
 *     startTime: string (HH:mm),
 *     endTime: string (HH:mm),
 *     isActive?: boolean,
 *     breaks?: Array<{ startTime: string, endTime: string }>
 *   }>
 * }
 */
export async function createBarberController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const admin = getAdmin(req);

  const bodySchema = z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be at most 100 characters"),
    phone: z
      .string()
      .min(10, "Phone must be at least 10 digits")
      .max(15, "Phone must be at most 15 characters")
      .optional(),
    schedules: z.array(scheduleSchema).optional().default([]),
  });

  const validationResult = bodySchema.safeParse(req.body);

  if (!validationResult.success) {
    return reply.status(400).send({
      message: "Validation error",
      errors: validationResult.error.format(),
    });
  }

  const { name, phone, schedules } = validationResult.data;

  const barber = await prisma.barber.create({
    data: {
      name,
      phone,
      barbershopId: admin.barbershopId,
      schedules: {
        create: schedules.map((schedule) => ({
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          isActive: schedule.isActive,
          breaks: {
            create: schedule.breaks.map((b) => ({
              startTime: b.startTime,
              endTime: b.endTime,
            })),
          },
        })),
      },
    },
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
  });

  return reply.status(201).send({
    barber: {
      ...barber,
      createdAt: barber.createdAt.toISOString(),
      updatedAt: barber.updatedAt.toISOString(),
    },
  });
}
