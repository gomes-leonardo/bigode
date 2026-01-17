import {
  IBarberRepository,
  BarberWithSchedule,
} from "../../../../domain/scheduling/application/repositories/IBarberRepository.js";
import { prisma } from "../client.js";

export class PrismaBarberRepository implements IBarberRepository {
  async findByBarbershopId(
    barbershopId: string,
  ): Promise<BarberWithSchedule[]> {
    const barbers = await prisma.barber.findMany({
      where: { barbershopId },
      select: {
        id: true,
        name: true,
        schedules: {
          select: {
            dayOfWeek: true,
            startTime: true,
            endTime: true,
            isActive: true,
            breaks: {
              select: {
                startTime: true,
                endTime: true,
              },
            },
          },
          orderBy: { dayOfWeek: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    return barbers;
  }

  async barbershopExists(barbershopId: string): Promise<boolean> {
    const barbershop = await prisma.barbershop.findUnique({
      where: { id: barbershopId },
      select: { id: true },
    });

    return barbershop !== null;
  }
}
