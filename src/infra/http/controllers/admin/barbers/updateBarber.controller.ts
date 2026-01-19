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
 * PATCH /admin/barbers/:id
 *
 * Update a barber for the authenticated admin's barbershop.
 *
 * Body: {
 *   name?: string,
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
export async function updateBarberController(
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
      .nullable()
      .optional(),
    schedules: z.array(scheduleSchema).optional(),
  });

  const bodyResult = bodySchema.safeParse(req.body);

  if (!bodyResult.success) {
    return reply.status(400).send({
      message: "Validation error",
      errors: bodyResult.error.format(),
    });
  }

  const { id } = paramsResult.data;
  const { name, phone, schedules } = bodyResult.data;

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

  // Update barber
  const updateData: { name?: string; phone?: string | null } = {};
  if (name !== undefined) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone;

  // If schedules are provided, replace all existing schedules
  if (schedules !== undefined) {
    // Delete existing schedules (cascades to breaks)
    await prisma.barberSchedule.deleteMany({
      where: { barberId: id },
    });

    // Create new schedules
    await prisma.barberSchedule.createMany({
      data: schedules.map((schedule) => ({
        barberId: id,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        isActive: schedule.isActive,
      })),
    });

    // Create breaks for each schedule
    for (const schedule of schedules) {
      if (schedule.breaks.length > 0) {
        const createdSchedule = await prisma.barberSchedule.findFirst({
          where: { barberId: id, dayOfWeek: schedule.dayOfWeek },
        });

        if (createdSchedule) {
          await prisma.barberBreak.createMany({
            data: schedule.breaks.map((b) => ({
              scheduleId: createdSchedule.id,
              startTime: b.startTime,
              endTime: b.endTime,
            })),
          });
        }
      }
    }
  }

  // Update barber basic info
  const barber = await prisma.barber.update({
    where: { id },
    data: updateData,
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

  return reply.send({
    barber: {
      ...barber,
      createdAt: barber.createdAt.toISOString(),
      updatedAt: barber.updatedAt.toISOString(),
    },
  });
}
