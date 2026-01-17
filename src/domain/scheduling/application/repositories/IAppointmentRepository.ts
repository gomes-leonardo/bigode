import { Appointment } from "@prisma/client";

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

export interface IAppointmentRepository {
  findAllOnDay(barberId: string, date: Date): Promise<AppointmentData[]>;
  isSlotAvailable(barberId: string, startTime: Date): Promise<boolean>;
  create(data: CreateAppointmentInput): Promise<Appointment>;
  findCustomerByPhone(
    phone: string,
    barbershopId: string,
  ): Promise<{ id: string } | null>;
  createCustomer(phone: string, barbershopId: string): Promise<{ id: string }>;
}
