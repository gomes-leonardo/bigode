import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GetAvailabilityUseCase } from "./GetAvailability.js";
import { IAppointmentRepository } from "../../repositories/IAppointmentRepository.js";

const createMockRepository = (
  bookedSlots: Array<{ startTime: Date; endTime: Date }> = [],
): IAppointmentRepository => ({
  findAllOnDay: vi.fn().mockResolvedValue(bookedSlots),
  isSlotAvailable: vi.fn(),
  create: vi.fn(),
  findCustomerByPhone: vi.fn(),
  createCustomer: vi.fn(),
});

// Helper to create dates in local timezone avoiding UTC parsing issues
const createLocalDate = (
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
): Date => {
  return new Date(year, month - 1, day, hour, minute, 0, 0);
};

describe("GetAvailabilityUseCase", () => {
  const barberId = "550e8400-e29b-41d4-a716-446655440000";

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("filtering past time slots", () => {
    it("should not return time slots that have already passed", async () => {
      // Current time: 10:50
      vi.setSystemTime(createLocalDate(2024, 1, 15, 10, 50));

      const repository = createMockRepository([]);
      const useCase = new GetAvailabilityUseCase(repository);

      const result = await useCase.execute({
        barberId,
        date: createLocalDate(2024, 1, 15),
      });

      // Slots at 09:00, 09:30, 10:00, 10:30 should NOT be returned
      const hasPastSlots = result.some(
        (slot) => slot.startTime <= createLocalDate(2024, 1, 15, 10, 50),
      );
      expect(hasPastSlots).toBe(false);
    });

    it("should return only slots that are in the future when current time is 10:50", async () => {
      vi.setSystemTime(createLocalDate(2024, 1, 15, 10, 50));

      const repository = createMockRepository([]);
      const useCase = new GetAvailabilityUseCase(repository);

      const result = await useCase.execute({
        barberId,
        date: createLocalDate(2024, 1, 15),
      });

      // First available slot should be 11:00 or later
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].startTime.getTime()).toBeGreaterThanOrEqual(
        createLocalDate(2024, 1, 15, 11, 0).getTime(),
      );
    });

    it("should not return the 10:30 slot when current time is 10:50", async () => {
      vi.setSystemTime(createLocalDate(2024, 1, 15, 10, 50));

      const repository = createMockRepository([]);
      const useCase = new GetAvailabilityUseCase(repository);

      const result = await useCase.execute({
        barberId,
        date: createLocalDate(2024, 1, 15),
      });

      const has1030Slot = result.some(
        (slot) =>
          slot.startTime.getHours() === 10 &&
          slot.startTime.getMinutes() === 30,
      );
      expect(has1030Slot).toBe(false);
    });

    it("should return empty array when all slots for the day have passed", async () => {
      // Current time: 19:00 (after business hours)
      vi.setSystemTime(createLocalDate(2024, 1, 15, 19, 0));

      const repository = createMockRepository([]);
      const useCase = new GetAvailabilityUseCase(repository);

      const result = await useCase.execute({
        barberId,
        date: createLocalDate(2024, 1, 15),
      });

      expect(result).toEqual([]);
    });

    it("should return all slots for a future date", async () => {
      // Current time: 10:50 on Jan 15
      vi.setSystemTime(createLocalDate(2024, 1, 15, 10, 50));

      const repository = createMockRepository([]);
      const useCase = new GetAvailabilityUseCase(repository);

      // Requesting availability for Jan 16 (tomorrow)
      const result = await useCase.execute({
        barberId,
        date: createLocalDate(2024, 1, 16),
      });

      // Should include morning slots since it's a future date
      const has9amSlot = result.some(
        (slot) =>
          slot.startTime.getHours() === 9 && slot.startTime.getMinutes() === 0,
      );
      expect(has9amSlot).toBe(true);
    });

    it("should handle edge case when current time is exactly on a slot boundary", async () => {
      // Current time: exactly 10:00
      vi.setSystemTime(createLocalDate(2024, 1, 15, 10, 0));

      const repository = createMockRepository([]);
      const useCase = new GetAvailabilityUseCase(repository);

      const result = await useCase.execute({
        barberId,
        date: createLocalDate(2024, 1, 15),
      });

      // The 10:00 slot should NOT be returned (it's the current time, not future)
      const has10amSlot = result.some(
        (slot) =>
          slot.startTime.getHours() === 10 && slot.startTime.getMinutes() === 0,
      );
      expect(has10amSlot).toBe(false);

      // The 10:30 slot SHOULD be returned
      const has1030Slot = result.some(
        (slot) =>
          slot.startTime.getHours() === 10 &&
          slot.startTime.getMinutes() === 30,
      );
      expect(has1030Slot).toBe(true);
    });

    it("should return empty array for a past date", async () => {
      // Current time: Jan 15
      vi.setSystemTime(createLocalDate(2024, 1, 15, 10, 0));

      const repository = createMockRepository([]);
      const useCase = new GetAvailabilityUseCase(repository);

      // Requesting availability for Jan 14 (yesterday)
      const result = await useCase.execute({
        barberId,
        date: createLocalDate(2024, 1, 14),
      });

      expect(result).toEqual([]);
    });
  });

  describe("filtering booked slots", () => {
    it("should not return slots that are already booked", async () => {
      vi.setSystemTime(createLocalDate(2024, 1, 15, 8, 0));

      const bookedSlots = [
        {
          startTime: createLocalDate(2024, 1, 15, 9, 0),
          endTime: createLocalDate(2024, 1, 15, 9, 30),
        },
        {
          startTime: createLocalDate(2024, 1, 15, 10, 0),
          endTime: createLocalDate(2024, 1, 15, 10, 30),
        },
      ];

      const repository = createMockRepository(bookedSlots);
      const useCase = new GetAvailabilityUseCase(repository);

      const result = await useCase.execute({
        barberId,
        date: createLocalDate(2024, 1, 15),
      });

      // 09:00 and 10:00 slots should NOT be in the result
      const has9amSlot = result.some(
        (slot) =>
          slot.startTime.getHours() === 9 && slot.startTime.getMinutes() === 0,
      );
      const has10amSlot = result.some(
        (slot) =>
          slot.startTime.getHours() === 10 && slot.startTime.getMinutes() === 0,
      );

      expect(has9amSlot).toBe(false);
      expect(has10amSlot).toBe(false);
    });

    it("should return available slots that are not booked", async () => {
      vi.setSystemTime(createLocalDate(2024, 1, 15, 8, 0));

      const bookedSlots = [
        {
          startTime: createLocalDate(2024, 1, 15, 9, 0),
          endTime: createLocalDate(2024, 1, 15, 9, 30),
        },
      ];

      const repository = createMockRepository(bookedSlots);
      const useCase = new GetAvailabilityUseCase(repository);

      const result = await useCase.execute({
        barberId,
        date: createLocalDate(2024, 1, 15),
      });

      // 09:30 slot should be available
      const has930Slot = result.some(
        (slot) =>
          slot.startTime.getHours() === 9 && slot.startTime.getMinutes() === 30,
      );
      expect(has930Slot).toBe(true);
    });

    it("should return empty array when all slots are booked", async () => {
      vi.setSystemTime(createLocalDate(2024, 1, 15, 8, 0));

      // Generate all slots from 09:00 to 18:00 as booked
      const bookedSlots = [];
      for (let hour = 9; hour < 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          bookedSlots.push({
            startTime: createLocalDate(2024, 1, 15, hour, minute),
            endTime: createLocalDate(2024, 1, 15, hour, minute + 30),
          });
        }
      }

      const repository = createMockRepository(bookedSlots);
      const useCase = new GetAvailabilityUseCase(repository);

      const result = await useCase.execute({
        barberId,
        date: createLocalDate(2024, 1, 15),
      });

      expect(result).toEqual([]);
    });
  });

  describe("combined filtering (past time + booked slots)", () => {
    it("should filter both past slots and booked slots", async () => {
      // Current time: 11:00
      vi.setSystemTime(createLocalDate(2024, 1, 15, 11, 0));

      const bookedSlots = [
        {
          startTime: createLocalDate(2024, 1, 15, 11, 30),
          endTime: createLocalDate(2024, 1, 15, 12, 0),
        },
        {
          startTime: createLocalDate(2024, 1, 15, 14, 0),
          endTime: createLocalDate(2024, 1, 15, 14, 30),
        },
      ];

      const repository = createMockRepository(bookedSlots);
      const useCase = new GetAvailabilityUseCase(repository);

      const result = await useCase.execute({
        barberId,
        date: createLocalDate(2024, 1, 15),
      });

      // Should not have any past slots (before 11:00)
      const hasPastSlots = result.some(
        (slot) => slot.startTime < createLocalDate(2024, 1, 15, 11, 0),
      );
      expect(hasPastSlots).toBe(false);

      // Should not have the 11:00 slot (current time)
      const has11amSlot = result.some(
        (slot) =>
          slot.startTime.getHours() === 11 && slot.startTime.getMinutes() === 0,
      );
      expect(has11amSlot).toBe(false);

      // Should not have the 11:30 slot (booked)
      const has1130Slot = result.some(
        (slot) =>
          slot.startTime.getHours() === 11 &&
          slot.startTime.getMinutes() === 30,
      );
      expect(has1130Slot).toBe(false);

      // Should have the 12:00 slot (future and available)
      const has12pmSlot = result.some(
        (slot) =>
          slot.startTime.getHours() === 12 && slot.startTime.getMinutes() === 0,
      );
      expect(has12pmSlot).toBe(true);

      // Should not have the 14:00 slot (booked)
      const has2pmSlot = result.some(
        (slot) =>
          slot.startTime.getHours() === 14 && slot.startTime.getMinutes() === 0,
      );
      expect(has2pmSlot).toBe(false);
    });
  });

  describe("slot structure", () => {
    it("should return slots with startTime and endTime properties", async () => {
      vi.setSystemTime(createLocalDate(2024, 1, 15, 8, 0));

      const repository = createMockRepository([]);
      const useCase = new GetAvailabilityUseCase(repository);

      const result = await useCase.execute({
        barberId,
        date: createLocalDate(2024, 1, 15),
      });

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty("startTime");
      expect(result[0]).toHaveProperty("endTime");
      expect(result[0].startTime).toBeInstanceOf(Date);
      expect(result[0].endTime).toBeInstanceOf(Date);
    });

    it("should return slots with 30-minute duration", async () => {
      vi.setSystemTime(createLocalDate(2024, 1, 15, 8, 0));

      const repository = createMockRepository([]);
      const useCase = new GetAvailabilityUseCase(repository);

      const result = await useCase.execute({
        barberId,
        date: createLocalDate(2024, 1, 15),
      });

      result.forEach((slot) => {
        const durationMs = slot.endTime.getTime() - slot.startTime.getTime();
        const durationMinutes = durationMs / (1000 * 60);
        expect(durationMinutes).toBe(30);
      });
    });

    it("should return slots ordered by startTime ascending", async () => {
      vi.setSystemTime(createLocalDate(2024, 1, 15, 8, 0));

      const repository = createMockRepository([]);
      const useCase = new GetAvailabilityUseCase(repository);

      const result = await useCase.execute({
        barberId,
        date: createLocalDate(2024, 1, 15),
      });

      for (let i = 1; i < result.length; i++) {
        expect(result[i].startTime.getTime()).toBeGreaterThan(
          result[i - 1].startTime.getTime(),
        );
      }
    });
  });
});
