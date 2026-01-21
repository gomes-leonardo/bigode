/* eslint-disable @typescript-eslint/no-unused-vars */
import { Appointment, AppointmentStatus } from "@prisma/client";
import {
  AppointmentData,
  AppointmentWithDetails,
  CreateAppointmentInput,
  IAppointmentRepository,
  ListAppointmentsFilters,
} from "../../../../domain/scheduling/application/repositories/IAppointmentRepository.js";
import { prisma } from "../client.js";

const appointmentWithDetailsSelect = {
  id: true,
  startTime: true,
  endTime: true,
  status: true,
  barbershopId: true,
  createdAt: true,
  updatedAt: true,
  barber: {
    select: {
      id: true,
      name: true,
      phone: true,
    },
  },
  service: {
    select: {
      id: true,
      name: true,
      durationMin: true,
      price: true,
    },
  },
  customer: {
    select: {
      id: true,
      phone: true,
      name: true,
    },
  },
};

function mapToAppointmentWithDetails(
  data: Awaited<
    ReturnType<
      typeof prisma.appointment.findFirst<{
        select: typeof appointmentWithDetailsSelect;
      }>
    >
  >,
): AppointmentWithDetails | null {
  if (!data) return null;
  return {
    ...data,
    service: {
      ...data.service,
      price: Number(data.service.price),
    },
  };
}

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
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { not: "CANCELED" },
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

  async findById(id: string): Promise<AppointmentWithDetails | null> {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      select: appointmentWithDetailsSelect,
    });

    return mapToAppointmentWithDetails(appointment);
  }

  async findByIdAndBarbershop(
    id: string,
    barbershopId: string,
  ): Promise<AppointmentWithDetails | null> {
    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        barbershopId,
      },
      select: appointmentWithDetailsSelect,
    });

    return mapToAppointmentWithDetails(appointment);
  }

  async updateStatus(
    id: string,
    status: AppointmentStatus,
  ): Promise<Appointment> {
    return prisma.appointment.update({
      where: { id },
      data: { status },
    });
  }

  async listByBarbershop(
    filters: ListAppointmentsFilters,
  ): Promise<AppointmentWithDetails[]> {
    const where: Parameters<typeof prisma.appointment.findMany>[0]["where"] = {
      barbershopId: filters.barbershopId,
    };

    if (filters.barberId) {
      where.barberId = filters.barberId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      where.startTime = {};
      if (filters.startDate) {
        where.startTime.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.startTime.lte = filters.endDate;
      }
    }

    const appointments = await prisma.appointment.findMany({
      where,
      select: appointmentWithDetailsSelect,
      orderBy: { startTime: "asc" },
    });

    return appointments.map((a) => ({
      ...a,
      service: {
        ...a.service,
        price: Number(a.service.price),
      },
    }));
  }

  async findByCustomerPhone(
    customerPhone: string,
    barbershopId: string,
  ): Promise<AppointmentWithDetails[]> {
    const appointments = await prisma.appointment.findMany({
      where: {
        barbershopId,
        customer: {
          phone: customerPhone,
        },
        status: { not: "CANCELED" },
      },
      select: appointmentWithDetailsSelect,
      orderBy: { startTime: "desc" },
    });

    return appointments.map((a) => ({
      ...a,
      service: {
        ...a.service,
        price: Number(a.service.price),
      },
    }));
  }
}
