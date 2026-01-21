import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import {
  CreateAppointmentUseCase,
  SlotOccupiedError,
} from "../../../../../domain/scheduling/application/use-cases/schedulling/CreateAppointment.js";
import { PrismaAppointmentRepository } from "../../../../database/prisma/repositories/appointment-repository.js";
import { prisma } from "../../../../database/prisma/client.js";
import { NotificationService } from "../../../../../domain/scheduling/application/services/NotificationService.js";
import { getTwilioClient } from "../../../../messaging/twilio/twilio.factory.js";

const appointmentRepository = new PrismaAppointmentRepository();
const createAppointmentUseCase = new CreateAppointmentUseCase(
  appointmentRepository,
);

export async function createAppointmentController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    // Verificar e decodificar JWT
    await req.jwtVerify();
    const user = req.user as {
      sub: string;
      role: string;
      barbershopId: string;
    };

    const customerPhone = user.sub;
    const barbershopId = user.barbershopId;

    // Validar body
    const bodySchema = z.object({
      barberId: z.string().uuid(),
      serviceId: z.string().uuid(),
      startTime: z.string().datetime(),
    });

    const validationResult = bodySchema.safeParse(req.body);

    if (!validationResult.success) {
      return reply.status(400).send({
        message: "Validation error",
        errors: validationResult.error.format(),
      });
    }

    const { barberId, serviceId, startTime } = validationResult.data;

    // Buscar service, barber e barbershop para confirmação
    const [service, barber, barbershop, customer] = await Promise.all([
      prisma.service.findUnique({
        where: { id: serviceId },
        select: { name: true, durationMin: true, price: true },
      }),
      prisma.barber.findUnique({
        where: { id: barberId },
        select: { name: true },
      }),
      prisma.barbershop.findUnique({
        where: { id: barbershopId },
        select: { name: true, timezone: true },
      }),
      prisma.customer.findUnique({
        where: { phone: customerPhone },
        select: { name: true },
      }),
    ]);

    if (!service) {
      return reply.status(404).send({
        message: "Service not found",
      });
    }

    if (!barber) {
      return reply.status(404).send({
        message: "Barber not found",
      });
    }

    // Criar appointment via use case
    const appointment = await createAppointmentUseCase.execute({
      barberId,
      serviceId,
      barbershopId,
      customerPhone,
      startTime: new Date(startTime),
      durationMin: service.durationMin,
    });

    // Send confirmation notification via WhatsApp
    if (barbershop) {
      const notificationService = new NotificationService(getTwilioClient());

      const appointmentDate = new Date(startTime);
      const timeStr = appointmentDate.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: barbershop.timezone || "America/Sao_Paulo",
      });

      // Fire and forget - don't block response on notification
      notificationService
        .sendAppointmentConfirmation({
          customerPhone,
          customerName: customer?.name ?? undefined,
          barbershopName: barbershop.name,
          barberName: barber.name,
          serviceName: service.name,
          appointmentDate,
          appointmentTime: timeStr,
          duration: service.durationMin,
          price: Number(service.price),
        })
        .catch((err) => {
          console.error(
            "[NOTIFICATION ERROR] Failed to send confirmation:",
            err,
          );
        });
    }

    return reply.status(201).send({
      appointment: {
        id: appointment.id,
        startTime: appointment.startTime.toISOString(),
        endTime: appointment.endTime.toISOString(),
        status: appointment.status,
        barberId: appointment.barberId,
        serviceId: appointment.serviceId,
        barbershopId: appointment.barbershopId,
      },
      message:
        "Appointment created successfully. Confirmation sent via WhatsApp.",
    });
  } catch (error) {
    if (error instanceof SlotOccupiedError) {
      return reply.status(409).send({
        message: "Appointment already exists",
      });
    }
    throw error; // Deixa o error handler tratar outros erros
  }
}
