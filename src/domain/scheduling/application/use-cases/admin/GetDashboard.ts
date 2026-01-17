export interface DashboardFilters {
  barbershopId: string;
  startDate?: Date;
  endDate?: Date;
  barberId?: string;
}

export interface BarberStats {
  barberId: string;
  barberName: string;
  totalAppointments: number;
  completedAppointments: number;
  canceledAppointments: number;
  noShowAppointments: number;
  revenue: number;
}

export interface DashboardData {
  summary: {
    totalAppointments: number;
    completedAppointments: number;
    canceledAppointments: number;
    noShowAppointments: number;
    totalRevenue: number;
    totalCustomers: number;
  };
  barberStats: BarberStats[];
  todayAppointments: {
    id: string;
    customerName: string | null;
    customerPhone: string;
    barberName: string;
    serviceName: string;
    startTime: Date;
    endTime: Date;
    status: string;
  }[];
  upcomingAppointments: {
    id: string;
    customerName: string | null;
    customerPhone: string;
    barberName: string;
    serviceName: string;
    startTime: Date;
    status: string;
  }[];
}

export interface IDashboardRepository {
  getDashboardData(filters: DashboardFilters): Promise<DashboardData>;
}

export class GetDashboardUseCase {
  constructor(private dashboardRepository: IDashboardRepository) {}

  async execute(filters: DashboardFilters): Promise<DashboardData> {
    // Default to last 30 days if no date range specified
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const effectiveFilters: DashboardFilters = {
      ...filters,
      startDate: filters.startDate || thirtyDaysAgo,
      endDate: filters.endDate || now,
    };

    return this.dashboardRepository.getDashboardData(effectiveFilters);
  }
}
