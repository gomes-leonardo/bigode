import { AppointmentStatus } from "@prisma/client";
import {
  IAppointmentRepository,
  AppointmentWithDetails,
} from "../../repositories/IAppointmentRepository.js";

export class AppointmentNotFoundError extends Error {
  constructor() {
    super("Appointment not found");
    this.name = "AppointmentNotFoundError";
  }
}

export class InvalidStatusTransitionError extends Error {
  constructor(from: string, to: string) {
    super(`Invalid status transition from ${from} to ${to}`);
    this.name = "InvalidStatusTransitionError";
  }
}

const VALID_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  SCHEDULED: [
    AppointmentStatus.COMPLETED,
    AppointmentStatus.CANCELED,
    AppointmentStatus.NO_SHOW,
  ],
  COMPLETED: [],
  CANCELED: [],
  NO_SHOW: [],
};

export interface UpdateAppointmentStatusInput {
  appointmentId: string;
  barbershopId: string;
  status: AppointmentStatus;
}

export interface UpdateAppointmentStatusOutput {
  appointment: AppointmentWithDetails;
}

export class UpdateAppointmentStatusUseCase {
  constructor(private appointmentRepository: IAppointmentRepository) {}

  async execute(
    input: UpdateAppointmentStatusInput,
  ): Promise<UpdateAppointmentStatusOutput> {
    const appointment = await this.appointmentRepository.findByIdAndBarbershop(
      input.appointmentId,
      input.barbershopId,
    );

    if (!appointment) {
      throw new AppointmentNotFoundError();
    }

    const validNextStatuses = VALID_TRANSITIONS[appointment.status];

    if (!validNextStatuses.includes(input.status)) {
      throw new InvalidStatusTransitionError(appointment.status, input.status);
    }

    await this.appointmentRepository.updateStatus(
      input.appointmentId,
      input.status,
    );

    const updatedAppointment =
      await this.appointmentRepository.findByIdAndBarbershop(
        input.appointmentId,
        input.barbershopId,
      );

    return {
      appointment: updatedAppointment!,
    };
  }
}
