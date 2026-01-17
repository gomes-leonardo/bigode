import { describe, it, expect, beforeEach } from "vitest";
import {
  GetBarbersByBarbershopUseCase,
  BarbershopNotFoundError,
} from "./GetBarbersByBarbershop.js";
import {
  IBarberRepository,
  BarberWithSchedule,
} from "../../repositories/IBarberRepository.js";

// In-memory repository for unit tests
class InMemoryBarberRepository implements IBarberRepository {
  private barbers: Map<string, BarberWithSchedule[]> = new Map();
  private barbershops: Set<string> = new Set();

  addBarbershop(barbershopId: string): void {
    this.barbershops.add(barbershopId);
  }

  addBarber(barbershopId: string, barber: BarberWithSchedule): void {
    if (!this.barbers.has(barbershopId)) {
      this.barbers.set(barbershopId, []);
    }
    this.barbers.get(barbershopId)!.push(barber);
  }

  async findByBarbershopId(
    barbershopId: string,
  ): Promise<BarberWithSchedule[]> {
    return this.barbers.get(barbershopId) ?? [];
  }

  async barbershopExists(barbershopId: string): Promise<boolean> {
    return this.barbershops.has(barbershopId);
  }
}

describe("GetBarbersByBarbershopUseCase", () => {
  let repository: InMemoryBarberRepository;
  let useCase: GetBarbersByBarbershopUseCase;

  const TEST_BARBERSHOP_ID = "550e8400-e29b-41d4-a716-446655440001";
  const OTHER_BARBERSHOP_ID = "550e8400-e29b-41d4-a716-446655440099";

  beforeEach(() => {
    repository = new InMemoryBarberRepository();
    useCase = new GetBarbersByBarbershopUseCase(repository);
  });

  describe("barbershop not found", () => {
    it("should throw BarbershopNotFoundError when barbershop does not exist", async () => {
      const nonExistentId = "550e8400-e29b-41d4-a716-446655440999";

      await expect(
        useCase.execute({ barbershopId: nonExistentId }),
      ).rejects.toThrow(BarbershopNotFoundError);
    });

    it("should include barbershopId in error message", async () => {
      const nonExistentId = "550e8400-e29b-41d4-a716-446655440999";

      try {
        await useCase.execute({ barbershopId: nonExistentId });
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(BarbershopNotFoundError);
        expect((error as BarbershopNotFoundError).message).toContain(
          "not found",
        );
      }
    });
  });

  describe("barbershop with no barbers", () => {
    it("should return empty array when barbershop has no barbers", async () => {
      repository.addBarbershop(TEST_BARBERSHOP_ID);

      const result = await useCase.execute({
        barbershopId: TEST_BARBERSHOP_ID,
      });

      expect(result).toEqual([]);
    });
  });

  describe("single barber", () => {
    it("should return barber with their schedule", async () => {
      repository.addBarbershop(TEST_BARBERSHOP_ID);
      repository.addBarber(TEST_BARBERSHOP_ID, {
        id: "barber-1",
        name: "John Doe",
        schedules: [
          {
            dayOfWeek: 1, // Monday
            startTime: "09:00",
            endTime: "18:00",
            isActive: true,
            breaks: [],
          },
        ],
      });

      const result = await useCase.execute({
        barbershopId: TEST_BARBERSHOP_ID,
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("barber-1");
      expect(result[0].name).toBe("John Doe");
      expect(result[0].schedules).toHaveLength(1);
      expect(result[0].schedules[0].dayOfWeek).toBe(1);
    });

    it("should return barber with breaks in schedule", async () => {
      repository.addBarbershop(TEST_BARBERSHOP_ID);
      repository.addBarber(TEST_BARBERSHOP_ID, {
        id: "barber-1",
        name: "John Doe",
        schedules: [
          {
            dayOfWeek: 1,
            startTime: "09:00",
            endTime: "18:00",
            isActive: true,
            breaks: [
              { startTime: "12:00", endTime: "13:00" }, // Lunch break
            ],
          },
        ],
      });

      const result = await useCase.execute({
        barbershopId: TEST_BARBERSHOP_ID,
      });

      expect(result[0].schedules[0].breaks).toHaveLength(1);
      expect(result[0].schedules[0].breaks[0].startTime).toBe("12:00");
      expect(result[0].schedules[0].breaks[0].endTime).toBe("13:00");
    });

    it("should return barber with empty schedules when no schedule defined", async () => {
      repository.addBarbershop(TEST_BARBERSHOP_ID);
      repository.addBarber(TEST_BARBERSHOP_ID, {
        id: "barber-1",
        name: "John Doe",
        schedules: [],
      });

      const result = await useCase.execute({
        barbershopId: TEST_BARBERSHOP_ID,
      });

      expect(result).toHaveLength(1);
      expect(result[0].schedules).toEqual([]);
    });
  });

  describe("multiple barbers with different schedules", () => {
    it("should return all barbers from the barbershop", async () => {
      repository.addBarbershop(TEST_BARBERSHOP_ID);

      // Barber 1: Works Monday-Friday, 9-18, with lunch break
      repository.addBarber(TEST_BARBERSHOP_ID, {
        id: "barber-1",
        name: "John Doe",
        schedules: [
          {
            dayOfWeek: 1,
            startTime: "09:00",
            endTime: "18:00",
            isActive: true,
            breaks: [{ startTime: "12:00", endTime: "13:00" }],
          },
          {
            dayOfWeek: 2,
            startTime: "09:00",
            endTime: "18:00",
            isActive: true,
            breaks: [{ startTime: "12:00", endTime: "13:00" }],
          },
          {
            dayOfWeek: 3,
            startTime: "09:00",
            endTime: "18:00",
            isActive: true,
            breaks: [{ startTime: "12:00", endTime: "13:00" }],
          },
          {
            dayOfWeek: 4,
            startTime: "09:00",
            endTime: "18:00",
            isActive: true,
            breaks: [{ startTime: "12:00", endTime: "13:00" }],
          },
          {
            dayOfWeek: 5,
            startTime: "09:00",
            endTime: "18:00",
            isActive: true,
            breaks: [{ startTime: "12:00", endTime: "13:00" }],
          },
        ],
      });

      // Barber 2: Works Tuesday-Saturday, 10-19, no breaks
      repository.addBarber(TEST_BARBERSHOP_ID, {
        id: "barber-2",
        name: "Jane Smith",
        schedules: [
          {
            dayOfWeek: 2,
            startTime: "10:00",
            endTime: "19:00",
            isActive: true,
            breaks: [],
          },
          {
            dayOfWeek: 3,
            startTime: "10:00",
            endTime: "19:00",
            isActive: true,
            breaks: [],
          },
          {
            dayOfWeek: 4,
            startTime: "10:00",
            endTime: "19:00",
            isActive: true,
            breaks: [],
          },
          {
            dayOfWeek: 5,
            startTime: "10:00",
            endTime: "19:00",
            isActive: true,
            breaks: [],
          },
          {
            dayOfWeek: 6,
            startTime: "10:00",
            endTime: "19:00",
            isActive: true,
            breaks: [],
          },
        ],
      });

      const result = await useCase.execute({
        barbershopId: TEST_BARBERSHOP_ID,
      });

      expect(result).toHaveLength(2);

      const john = result.find((b) => b.name === "John Doe");
      const jane = result.find((b) => b.name === "Jane Smith");

      expect(john).toBeDefined();
      expect(jane).toBeDefined();

      expect(john!.schedules).toHaveLength(5); // Mon-Fri
      expect(jane!.schedules).toHaveLength(5); // Tue-Sat

      // John has breaks
      expect(john!.schedules[0].breaks).toHaveLength(1);

      // Jane has no breaks
      expect(jane!.schedules[0].breaks).toHaveLength(0);
    });

    it("should not return barbers from other barbershops", async () => {
      repository.addBarbershop(TEST_BARBERSHOP_ID);
      repository.addBarbershop(OTHER_BARBERSHOP_ID);

      repository.addBarber(TEST_BARBERSHOP_ID, {
        id: "barber-1",
        name: "John Doe",
        schedules: [],
      });

      repository.addBarber(OTHER_BARBERSHOP_ID, {
        id: "barber-2",
        name: "Jane Smith",
        schedules: [],
      });

      const result = await useCase.execute({
        barbershopId: TEST_BARBERSHOP_ID,
      });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("John Doe");
    });

    it("should return barbers with different working hours", async () => {
      repository.addBarbershop(TEST_BARBERSHOP_ID);

      // Morning barber
      repository.addBarber(TEST_BARBERSHOP_ID, {
        id: "barber-morning",
        name: "Morning Barber",
        schedules: [
          {
            dayOfWeek: 1,
            startTime: "06:00",
            endTime: "14:00",
            isActive: true,
            breaks: [],
          },
        ],
      });

      // Evening barber
      repository.addBarber(TEST_BARBERSHOP_ID, {
        id: "barber-evening",
        name: "Evening Barber",
        schedules: [
          {
            dayOfWeek: 1,
            startTime: "14:00",
            endTime: "22:00",
            isActive: true,
            breaks: [],
          },
        ],
      });

      const result = await useCase.execute({
        barbershopId: TEST_BARBERSHOP_ID,
      });

      expect(result).toHaveLength(2);

      const morning = result.find((b) => b.name === "Morning Barber");
      const evening = result.find((b) => b.name === "Evening Barber");

      expect(morning!.schedules[0].startTime).toBe("06:00");
      expect(morning!.schedules[0].endTime).toBe("14:00");

      expect(evening!.schedules[0].startTime).toBe("14:00");
      expect(evening!.schedules[0].endTime).toBe("22:00");
    });
  });

  describe("inactive schedules", () => {
    it("should include inactive schedules in response", async () => {
      repository.addBarbershop(TEST_BARBERSHOP_ID);
      repository.addBarber(TEST_BARBERSHOP_ID, {
        id: "barber-1",
        name: "John Doe",
        schedules: [
          {
            dayOfWeek: 1,
            startTime: "09:00",
            endTime: "18:00",
            isActive: true,
            breaks: [],
          },
          {
            dayOfWeek: 0,
            startTime: "10:00",
            endTime: "16:00",
            isActive: false,
            breaks: [],
          }, // Sunday (inactive)
        ],
      });

      const result = await useCase.execute({
        barbershopId: TEST_BARBERSHOP_ID,
      });

      expect(result[0].schedules).toHaveLength(2);

      const sunday = result[0].schedules.find((s) => s.dayOfWeek === 0);
      expect(sunday!.isActive).toBe(false);
    });
  });

  describe("multiple breaks per day", () => {
    it("should support multiple breaks in a single day", async () => {
      repository.addBarbershop(TEST_BARBERSHOP_ID);
      repository.addBarber(TEST_BARBERSHOP_ID, {
        id: "barber-1",
        name: "John Doe",
        schedules: [
          {
            dayOfWeek: 1,
            startTime: "08:00",
            endTime: "20:00",
            isActive: true,
            breaks: [
              { startTime: "10:30", endTime: "10:45" }, // Coffee break
              { startTime: "13:00", endTime: "14:00" }, // Lunch break
              { startTime: "16:30", endTime: "16:45" }, // Afternoon break
            ],
          },
        ],
      });

      const result = await useCase.execute({
        barbershopId: TEST_BARBERSHOP_ID,
      });

      expect(result[0].schedules[0].breaks).toHaveLength(3);
    });
  });
});
