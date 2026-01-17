/* eslint-disable @typescript-eslint/no-unused-vars */
import { Appointment } from "@prisma/client";
import {
  AppointmentData,
  CreateAppointmentInput,
  IAppointmentRepository,
} from "../../../../domain/scheduling/application/repositories/IAppointmentRepository.js";
import { prisma } from "../client.js";

export class PrismaAppointmentRepository implements IAppointmentRepository {
  async create(data: CreateAppointmentInput): Promise<Appointment> {
    return prisma.appointment.create({
      data: {
        startTime: data.startTime,
        endTime: data.endTime,
        barberId: data.barberId,
        serviceId: data.serviceId,
        customerId: data.customerId,
        barbershopId: data.barbershopId,
      },
    });
  }

  async findAllOnDay(barberId: string, date: Date): Promise<AppointmentData[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        barberId,
        startTime: {
          gte: startOfDay, // Maior ou igual a 00:00
          lte: endOfDay, // Menor ou igual a 23:59
        },
        status: { not: "CANCELED" }, // Ignorar cancelados
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    return appointments;
  }

  async isSlotAvailable(barberId: string, startTime: Date): Promise<boolean> {
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        barberId,
        startTime,
        status: {
          not: "CANCELED",
        },
      },
    });

    return !existingAppointment;
  }

  async findCustomerByPhone(
    phone: string,
    _barbershopId: string,
  ): Promise<{ id: string } | null> {
    const customer = await prisma.customer.findUnique({
      where: {
        phone,
      },
      select: {
        id: true,
      },
    });

    return customer;
  }

  async createCustomer(
    phone: string,
    _barbershopId: string,
  ): Promise<{ id: string }> {
    const customer = await prisma.customer.create({
      data: {
        phone,
      },
      select: {
        id: true,
      },
    });

    return customer;
  }
}
