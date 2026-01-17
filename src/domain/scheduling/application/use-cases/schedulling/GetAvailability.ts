import { IAppointmentRepository } from "../../repositories/IAppointmentRepository.js";

export interface GetAvailabilityInput {
  barberId: string;
  date: Date;
}

export interface AvailableSlot {
  startTime: Date;
  endTime: Date;
}

const BUSINESS_START_HOUR = 9;
const BUSINESS_END_HOUR = 18;
const SLOT_DURATION_MINUTES = 30;

export class GetAvailabilityUseCase {
  constructor(private appointmentRepository: IAppointmentRepository) {}

  async execute(input: GetAvailabilityInput): Promise<AvailableSlot[]> {
    const { barberId, date } = input;
    const now = new Date();

    // If the requested date is in the past, return empty array
    if (this.isDateInPast(date, now)) {
      return [];
    }

    // Get all booked appointments for the day
    const bookedAppointments = await this.appointmentRepository.findAllOnDay(
      barberId,
      date,
    );

    // Generate all possible slots for the day
    const allSlots = this.generateDaySlots(date);

    // Filter out booked slots and past slots
    const availableSlots = allSlots.filter((slot) => {
      // Filter out past slots
      if (slot.startTime <= now) {
        return false;
      }

      // Filter out booked slots
      const isBooked = bookedAppointments.some(
        (booked) => booked.startTime.getTime() === slot.startTime.getTime(),
      );

      return !isBooked;
    });

    return availableSlots;
  }

  private isDateInPast(date: Date, now: Date): boolean {
    const requestedDate = new Date(date);
    requestedDate.setHours(0, 0, 0, 0);

    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    return requestedDate < today;
  }

  private generateDaySlots(date: Date): AvailableSlot[] {
    const slots: AvailableSlot[] = [];

    // Extract year, month, day to avoid timezone issues
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    for (let hour = BUSINESS_START_HOUR; hour < BUSINESS_END_HOUR; hour++) {
      for (let minute = 0; minute < 60; minute += SLOT_DURATION_MINUTES) {
        const startTime = new Date(year, month, day, hour, minute, 0, 0);

        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + SLOT_DURATION_MINUTES);

        slots.push({ startTime, endTime });
      }
    }

    return slots;
  }
}
