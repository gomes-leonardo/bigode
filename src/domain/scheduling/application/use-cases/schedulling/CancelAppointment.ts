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

export class AppointmentAlreadyCanceledError extends Error {
  constructor() {
    super("Appointment is already canceled");
    this.name = "AppointmentAlreadyCanceledError";
  }
}

export class AppointmentAlreadyCompletedError extends Error {
  constructor() {
    super("Cannot cancel a completed appointment");
    this.name = "AppointmentAlreadyCompletedError";
  }
}

export interface CancelAppointmentInput {
  appointmentId: string;
  barbershopId: string;
  reason?: string;
}

export interface CancelAppointmentOutput {
  appointment: AppointmentWithDetails;
}

export class CancelAppointmentUseCase {
  constructor(private appointmentRepository: IAppointmentRepository) {}

  async execute(
    input: CancelAppointmentInput,
  ): Promise<CancelAppointmentOutput> {
    const appointment = await this.appointmentRepository.findByIdAndBarbershop(
      input.appointmentId,
      input.barbershopId,
    );

    if (!appointment) {
      throw new AppointmentNotFoundError();
    }

    if (appointment.status === AppointmentStatus.CANCELED) {
      throw new AppointmentAlreadyCanceledError();
    }

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new AppointmentAlreadyCompletedError();
    }

    await this.appointmentRepository.updateStatus(
      input.appointmentId,
      AppointmentStatus.CANCELED,
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
