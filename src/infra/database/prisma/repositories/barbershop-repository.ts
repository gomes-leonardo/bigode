import {
  IBarbershopRepository,
  BarbershopData,
  CreateBarbershopInput,
  CreateAdminInput,
  AdminData,
  UpdateBarbershopInput,
} from "../../../../domain/scheduling/application/repositories/IBarbershopRepository.js";
import { prisma } from "../client.js";

export class PrismaBarbershopRepository implements IBarbershopRepository {
  async create(data: CreateBarbershopInput): Promise<BarbershopData> {
    const barbershop = await prisma.barbershop.create({
      data: {
        name: data.name,
        slug: data.slug,
        phone: data.phone,
        timezone: data.timezone ?? "America/Sao_Paulo",
        trialStartedAt: data.trialStartedAt,
        trialEndsAt: data.trialEndsAt,
        subscriptionStatus: "TRIAL",
      },
    });

    return {
      id: barbershop.id,
      name: barbershop.name,
      slug: barbershop.slug,
      phone: barbershop.phone,
      timezone: barbershop.timezone,
      isQueueEnabled: barbershop.isQueueEnabled,
      isAppointmentsEnabled: barbershop.isAppointmentsEnabled,
      trialStartedAt: barbershop.trialStartedAt,
      trialEndsAt: barbershop.trialEndsAt,
      subscriptionStatus: barbershop.subscriptionStatus,
      createdAt: barbershop.createdAt,
      updatedAt: barbershop.updatedAt,
    };
  }

  async findById(id: string): Promise<BarbershopData | null> {
    const barbershop = await prisma.barbershop.findUnique({
      where: { id },
    });

    if (!barbershop) {
      return null;
    }

    return {
      id: barbershop.id,
      name: barbershop.name,
      slug: barbershop.slug,
      phone: barbershop.phone,
      timezone: barbershop.timezone,
      isQueueEnabled: barbershop.isQueueEnabled,
      isAppointmentsEnabled: barbershop.isAppointmentsEnabled,
      trialStartedAt: barbershop.trialStartedAt,
      trialEndsAt: barbershop.trialEndsAt,
      subscriptionStatus: barbershop.subscriptionStatus,
      createdAt: barbershop.createdAt,
      updatedAt: barbershop.updatedAt,
    };
  }

  async findBySlug(slug: string): Promise<BarbershopData | null> {
    const barbershop = await prisma.barbershop.findUnique({
      where: { slug },
    });

    if (!barbershop) {
      return null;
    }

    return {
      id: barbershop.id,
      name: barbershop.name,
      slug: barbershop.slug,
      phone: barbershop.phone,
      timezone: barbershop.timezone,
      isQueueEnabled: barbershop.isQueueEnabled,
      isAppointmentsEnabled: barbershop.isAppointmentsEnabled,
      trialStartedAt: barbershop.trialStartedAt,
      trialEndsAt: barbershop.trialEndsAt,
      subscriptionStatus: barbershop.subscriptionStatus,
      createdAt: barbershop.createdAt,
      updatedAt: barbershop.updatedAt,
    };
  }

  async findByPhone(phone: string): Promise<BarbershopData | null> {
    const barbershop = await prisma.barbershop.findUnique({
      where: { phone },
    });

    if (!barbershop) {
      return null;
    }

    return {
      id: barbershop.id,
      name: barbershop.name,
      slug: barbershop.slug,
      phone: barbershop.phone,
      timezone: barbershop.timezone,
      isQueueEnabled: barbershop.isQueueEnabled,
      isAppointmentsEnabled: barbershop.isAppointmentsEnabled,
      trialStartedAt: barbershop.trialStartedAt,
      trialEndsAt: barbershop.trialEndsAt,
      subscriptionStatus: barbershop.subscriptionStatus,
      createdAt: barbershop.createdAt,
      updatedAt: barbershop.updatedAt,
    };
  }

  async update(
    id: string,
    data: UpdateBarbershopInput,
  ): Promise<BarbershopData> {
    const barbershop = await prisma.barbershop.update({
      where: { id },
      data,
    });

    return {
      id: barbershop.id,
      name: barbershop.name,
      slug: barbershop.slug,
      phone: barbershop.phone,
      timezone: barbershop.timezone,
      isQueueEnabled: barbershop.isQueueEnabled,
      isAppointmentsEnabled: barbershop.isAppointmentsEnabled,
      trialStartedAt: barbershop.trialStartedAt,
      trialEndsAt: barbershop.trialEndsAt,
      subscriptionStatus: barbershop.subscriptionStatus,
      createdAt: barbershop.createdAt,
      updatedAt: barbershop.updatedAt,
    };
  }

  async slugExists(slug: string): Promise<boolean> {
    const barbershop = await prisma.barbershop.findUnique({
      where: { slug },
      select: { id: true },
    });
    return barbershop !== null;
  }

  async phoneExists(phone: string): Promise<boolean> {
    const barbershop = await prisma.barbershop.findUnique({
      where: { phone },
      select: { id: true },
    });
    return barbershop !== null;
  }

  async createAdmin(data: CreateAdminInput): Promise<AdminData> {
    const admin = await prisma.admin.create({
      data: {
        email: data.email,
        phone: data.phone,
        name: data.name,
        barbershopId: data.barbershopId,
        role: data.role,
      },
    });

    return {
      id: admin.id,
      email: admin.email,
      phone: admin.phone,
      name: admin.name,
      role: admin.role,
      barbershopId: admin.barbershopId,
    };
  }

  async adminEmailExists(email: string): Promise<boolean> {
    const admin = await prisma.admin.findUnique({
      where: { email },
      select: { id: true },
    });
    return admin !== null;
  }

  async adminPhoneExists(phone: string): Promise<boolean> {
    const admin = await prisma.admin.findUnique({
      where: { phone },
      select: { id: true },
    });
    return admin !== null;
  }
}
