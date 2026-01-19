import { SubscriptionStatus } from "@prisma/client";

export interface BarbershopData {
  id: string;
  name: string;
  slug: string;
  phone: string;
  timezone: string;
  isQueueEnabled: boolean;
  isAppointmentsEnabled: boolean;
  trialStartedAt: Date | null;
  trialEndsAt: Date | null;
  subscriptionStatus: SubscriptionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBarbershopInput {
  name: string;
  slug: string;
  phone: string;
  timezone?: string;
  trialStartedAt: Date;
  trialEndsAt: Date;
}

export interface CreateAdminInput {
  email: string;
  phone: string;
  name: string;
  barbershopId: string;
  role: "OWNER" | "MANAGER";
}

export interface AdminData {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: "OWNER" | "MANAGER";
  barbershopId: string;
}

export interface UpdateBarbershopInput {
  name?: string;
  phone?: string;
  timezone?: string;
  isQueueEnabled?: boolean;
  isAppointmentsEnabled?: boolean;
}

export interface IBarbershopRepository {
  create(data: CreateBarbershopInput): Promise<BarbershopData>;
  findById(id: string): Promise<BarbershopData | null>;
  findBySlug(slug: string): Promise<BarbershopData | null>;
  findByPhone(phone: string): Promise<BarbershopData | null>;
  update(id: string, data: UpdateBarbershopInput): Promise<BarbershopData>;
  slugExists(slug: string): Promise<boolean>;
  phoneExists(phone: string): Promise<boolean>;
  createAdmin(data: CreateAdminInput): Promise<AdminData>;
  adminEmailExists(email: string): Promise<boolean>;
  adminPhoneExists(phone: string): Promise<boolean>;
}
