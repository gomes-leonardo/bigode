export interface AgendaFilters {
  barbershopId: string;
  barberId?: string;
  date: Date;
}

export interface AgendaAppointment {
  id: string;
  startTime: Date;
  endTime: Date;
  status: "SCHEDULED" | "COMPLETED" | "CANCELED" | "NO_SHOW";
  customer: {
    id: string;
    name: string | null;
    phone: string;
  };
  service: {
    id: string;
    name: string;
    durationMin: number;
    price: number;
  };
}

export interface BarberAgenda {
  barber: {
    id: string;
    name: string;
    phone: string | null;
  };
  schedule: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isActive: boolean;
    breaks: {
      startTime: string;
      endTime: string;
    }[];
  } | null;
  appointments: AgendaAppointment[];
}

export interface IAgendaRepository {
  getBarberAgendas(filters: AgendaFilters): Promise<BarberAgenda[]>;
}

export class GetBarberAgendaUseCase {
  constructor(private agendaRepository: IAgendaRepository) {}

  async execute(filters: AgendaFilters): Promise<BarberAgenda[]> {
    return this.agendaRepository.getBarberAgendas(filters);
  }
}
