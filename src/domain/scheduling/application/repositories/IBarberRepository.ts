export interface BarberBreak {
  startTime: string; // "12:00" format
  endTime: string; // "13:00" format
}

export interface BarberSchedule {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: string; // "09:00" format
  endTime: string; // "18:00" format
  isActive: boolean;
  breaks: BarberBreak[];
}

export interface BarberWithSchedule {
  id: string;
  name: string;
  schedules: BarberSchedule[];
}

export interface IBarberRepository {
  findByBarbershopId(barbershopId: string): Promise<BarberWithSchedule[]>;
  barbershopExists(barbershopId: string): Promise<boolean>;
}
