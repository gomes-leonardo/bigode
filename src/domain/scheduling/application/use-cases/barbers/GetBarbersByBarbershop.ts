import {
  IBarberRepository,
  BarberWithSchedule,
} from "../../repositories/IBarberRepository.js";

export class BarbershopNotFoundError extends Error {
  constructor(barbershopId: string) {
    super(`Barbershop with id ${barbershopId} not found`);
    this.name = "BarbershopNotFoundError";
  }
}

interface GetBarbersByBarbershopInput {
  barbershopId: string;
}

export class GetBarbersByBarbershopUseCase {
  constructor(private barberRepository: IBarberRepository) {}

  async execute(
    input: GetBarbersByBarbershopInput,
  ): Promise<BarberWithSchedule[]> {
    const { barbershopId } = input;

    const barbershopExists =
      await this.barberRepository.barbershopExists(barbershopId);

    if (!barbershopExists) {
      throw new BarbershopNotFoundError(barbershopId);
    }

    const barbers =
      await this.barberRepository.findByBarbershopId(barbershopId);

    return barbers;
  }
}
