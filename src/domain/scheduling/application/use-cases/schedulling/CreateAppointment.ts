import { Appointment } from "@prisma/client";
import {
  IAppointmentRepository,
  CreateAppointmentInput,
} from "../../repositories/IAppointmentRepository.js";

export class SlotOccupiedError extends Error {
  constructor() {
    super("Appointment already exists");
    this.name = "SlotOccupiedError";
  }
}

export interface CreateAppointmentUseCaseInput {
  barberId: string;
  serviceId: string;
  barbershopId: string;
  customerPhone: string;
  startTime: Date;
  durationMin: number;
}

export class CreateAppointmentUseCase {
  constructor(private appointmentRepository: IAppointmentRepository) {}

  async execute(input: CreateAppointmentUseCaseInput): Promise<Appointment> {
    // Verificar se o slot está disponível
    const isAvailable = await this.appointmentRepository.isSlotAvailable(
      input.barberId,
      input.startTime,
    );

    if (!isAvailable) {
      throw new SlotOccupiedError();
    }

    // Buscar ou criar customer
    let customer = await this.appointmentRepository.findCustomerByPhone(
      input.customerPhone,
      input.barbershopId,
    );

    if (!customer) {
      customer = await this.appointmentRepository.createCustomer(
        input.customerPhone,
        input.barbershopId,
      );
    }

    // Calcular endTime baseado no durationMin
    const endTime = new Date(input.startTime);
    endTime.setMinutes(endTime.getMinutes() + input.durationMin);

    // Criar appointment
    const appointmentData: CreateAppointmentInput = {
      barberId: input.barberId,
      serviceId: input.serviceId,
      customerId: customer.id,
      barbershopId: input.barbershopId,
      startTime: input.startTime,
      endTime,
    };

    return this.appointmentRepository.create(appointmentData);
  }
}
