import {
  IAppointmentRepository,
  AppointmentData,
} from "../repositories/IAppointmentRepository.js";

export interface GetAvailabilityInput {
  barberId: string;
  date: Date;
}

export class GetAvailabilityUseCase {
  constructor(private appointmentRepository: IAppointmentRepository) {}

  async execute(input: GetAvailabilityInput): Promise<AppointmentData[]> {
    return this.appointmentRepository.findAllOnDay(input.barberId, input.date);
  }
}
