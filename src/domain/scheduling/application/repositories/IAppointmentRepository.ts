import { Appointment, AppointmentStatus } from "@prisma/client";

export interface AppointmentData {
  startTime: Date;
  endTime: Date;
}

export interface CreateAppointmentInput {
  barberId: string;
  serviceId: string;
  customerId: string;
  barbershopId: string;
  startTime: Date;
  endTime: Date;
}

export interface AppointmentWithDetails {
  id: string;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  barbershopId: string;
  barber: {
    id: string;
    name: string;
    phone: string | null;
  };
  service: {
    id: string;
    name: string;
    durationMin: number;
    price: number;
  };
  customer: {
    id: string;
    phone: string;
    name: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ListAppointmentsFilters {
  barbershopId: string;
  barberId?: string;
  status?: AppointmentStatus;
  startDate?: Date;
  endDate?: Date;
}

export interface IAppointmentRepository {
  findAllOnDay(barberId: string, date: Date): Promise<AppointmentData[]>;
  isSlotAvailable(barberId: string, startTime: Date): Promise<boolean>;
  create(data: CreateAppointmentInput): Promise<Appointment>;
  findCustomerByPhone(
    phone: string,
    barbershopId: string,
  ): Promise<{ id: string } | null>;
  createCustomer(phone: string, barbershopId: string): Promise<{ id: string }>;

  // New methods for complete booking flow
  findById(id: string): Promise<AppointmentWithDetails | null>;
  findByIdAndBarbershop(
    id: string,
    barbershopId: string,
  ): Promise<AppointmentWithDetails | null>;
  updateStatus(id: string, status: AppointmentStatus): Promise<Appointment>;
  listByBarbershop(
    filters: ListAppointmentsFilters,
  ): Promise<AppointmentWithDetails[]>;
  findByCustomerPhone(
    customerPhone: string,
    barbershopId: string,
  ): Promise<AppointmentWithDetails[]>;
}
