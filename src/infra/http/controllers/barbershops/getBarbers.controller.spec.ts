import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import { clearDatabase } from "../../../database/prisma/test-utils.js";
import { app } from "../../../../app.js";
import { prisma } from "../../../database/prisma/client.js";

describe("GET /barbershops/:barbershopId/barbers (E2E)", () => {
  // Deterministic test IDs for "The Paula Barber" barbershop
  const TEST_BARBERSHOP_ID = "550e8400-e29b-41d4-a716-446655440100";
  const TEST_BARBER_JOHN_ID = "550e8400-e29b-41d4-a716-446655440101";
  const TEST_BARBER_JANE_ID = "550e8400-e29b-41d4-a716-446655440102";

  beforeAll(async () => {
    await app.ready();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe("barbershop not found", () => {
    it("should return 404 when barbershop does not exist", async () => {
      const nonExistentId = "550e8400-e29b-41d4-a716-446655440999";

      const response = await request(app.server).get(
        `/barbershops/${nonExistentId}/barbers`,
      );

      expect(response.statusCode).toEqual(404);
      expect(response.body.message).toEqual("Barbershop not found");
    });

    it("should return 400 for invalid UUID format", async () => {
      const response = await request(app.server).get(
        "/barbershops/invalid-uuid/barbers",
      );

      expect(response.statusCode).toEqual(400);
      expect(response.body.message).toEqual("Validation error");
    });
  });

  describe("barbershop with no barbers", () => {
    it("should return empty array when barbershop has no barbers", async () => {
      // Create barbershop without barbers
      await prisma.barbershop.create({
        data: {
          id: TEST_BARBERSHOP_ID,
          name: "The Paula Barber",
          slug: "the-paula-barber",
          phone: "+5511999990000",
        },
      });

      const response = await request(app.server).get(
        `/barbershops/${TEST_BARBERSHOP_ID}/barbers`,
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body.barbers).toEqual([]);
    });
  });

  describe("single barber with schedule", () => {
    it("should return barber with their availability schedule", async () => {
      // Create barbershop
      await prisma.barbershop.create({
        data: {
          id: TEST_BARBERSHOP_ID,
          name: "The Paula Barber",
          slug: "the-paula-barber",
          phone: "+5511999990000",
        },
      });

      // Create barber
      await prisma.barber.create({
        data: {
          id: TEST_BARBER_JOHN_ID,
          name: "John Doe",
          barbershopId: TEST_BARBERSHOP_ID,
        },
      });

      // Create schedule for Monday
      await prisma.barberSchedule.create({
        data: {
          barberId: TEST_BARBER_JOHN_ID,
          dayOfWeek: 1, // Monday
          startTime: "09:00",
          endTime: "18:00",
          isActive: true,
        },
      });

      const response = await request(app.server).get(
        `/barbershops/${TEST_BARBERSHOP_ID}/barbers`,
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body.barbers).toHaveLength(1);
      expect(response.body.barbers[0]).toEqual({
        id: TEST_BARBER_JOHN_ID,
        name: "John Doe",
        schedules: [
          {
            dayOfWeek: 1,
            startTime: "09:00",
            endTime: "18:00",
            isActive: true,
            breaks: [],
          },
        ],
      });
    });

    it("should return barber with breaks in schedule", async () => {
      await prisma.barbershop.create({
        data: {
          id: TEST_BARBERSHOP_ID,
          name: "The Paula Barber",
          slug: "the-paula-barber",
          phone: "+5511999990000",
        },
      });

      await prisma.barber.create({
        data: {
          id: TEST_BARBER_JOHN_ID,
          name: "John Doe",
          barbershopId: TEST_BARBERSHOP_ID,
        },
      });

      const schedule = await prisma.barberSchedule.create({
        data: {
          barberId: TEST_BARBER_JOHN_ID,
          dayOfWeek: 1,
          startTime: "09:00",
          endTime: "18:00",
          isActive: true,
        },
      });

      // Add lunch break
      await prisma.barberBreak.create({
        data: {
          scheduleId: schedule.id,
          startTime: "12:00",
          endTime: "13:00",
        },
      });

      const response = await request(app.server).get(
        `/barbershops/${TEST_BARBERSHOP_ID}/barbers`,
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body.barbers[0].schedules[0].breaks).toHaveLength(1);
      expect(response.body.barbers[0].schedules[0].breaks[0]).toEqual({
        startTime: "12:00",
        endTime: "13:00",
      });
    });

    it("should return barber without schedule when none defined", async () => {
      await prisma.barbershop.create({
        data: {
          id: TEST_BARBERSHOP_ID,
          name: "The Paula Barber",
          slug: "the-paula-barber",
          phone: "+5511999990000",
        },
      });

      await prisma.barber.create({
        data: {
          id: TEST_BARBER_JOHN_ID,
          name: "John Doe",
          barbershopId: TEST_BARBERSHOP_ID,
        },
      });

      const response = await request(app.server).get(
        `/barbershops/${TEST_BARBERSHOP_ID}/barbers`,
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body.barbers[0].schedules).toEqual([]);
    });
  });

  describe("multiple barbers with different schedules", () => {
    it("should return all barbers from the barbershop with their schedules", async () => {
      await prisma.barbershop.create({
        data: {
          id: TEST_BARBERSHOP_ID,
          name: "The Paula Barber",
          slug: "the-paula-barber",
          phone: "+5511999990000",
        },
      });

      // Barber 1: John - works Mon-Fri 9-18 with lunch break
      await prisma.barber.create({
        data: {
          id: TEST_BARBER_JOHN_ID,
          name: "John Doe",
          barbershopId: TEST_BARBERSHOP_ID,
        },
      });

      const johnSchedule = await prisma.barberSchedule.create({
        data: {
          barberId: TEST_BARBER_JOHN_ID,
          dayOfWeek: 1,
          startTime: "09:00",
          endTime: "18:00",
          isActive: true,
        },
      });

      await prisma.barberBreak.create({
        data: {
          scheduleId: johnSchedule.id,
          startTime: "12:00",
          endTime: "13:00",
        },
      });

      // Barber 2: Jane - works Tue-Sat 10-19, no breaks
      await prisma.barber.create({
        data: {
          id: TEST_BARBER_JANE_ID,
          name: "Jane Smith",
          barbershopId: TEST_BARBERSHOP_ID,
        },
      });

      await prisma.barberSchedule.create({
        data: {
          barberId: TEST_BARBER_JANE_ID,
          dayOfWeek: 2,
          startTime: "10:00",
          endTime: "19:00",
          isActive: true,
        },
      });

      const response = await request(app.server).get(
        `/barbershops/${TEST_BARBERSHOP_ID}/barbers`,
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body.barbers).toHaveLength(2);

      const john = response.body.barbers.find(
        (b: { name: string }) => b.name === "John Doe",
      );
      const jane = response.body.barbers.find(
        (b: { name: string }) => b.name === "Jane Smith",
      );

      expect(john).toBeDefined();
      expect(jane).toBeDefined();

      // John has breaks
      expect(john.schedules[0].breaks).toHaveLength(1);

      // Jane has no breaks
      expect(jane.schedules[0].breaks).toHaveLength(0);
    });

    it("should not return barbers from other barbershops", async () => {
      const OTHER_BARBERSHOP_ID = "550e8400-e29b-41d4-a716-446655440200";

      // Create two barbershops
      await prisma.barbershop.create({
        data: {
          id: TEST_BARBERSHOP_ID,
          name: "The Paula Barber",
          slug: "the-paula-barber",
          phone: "+5511999990000",
        },
      });

      await prisma.barbershop.create({
        data: {
          id: OTHER_BARBERSHOP_ID,
          name: "Other Barbershop",
          slug: "other-barbershop",
          phone: "+5511999990001",
        },
      });

      // Barber in test barbershop
      await prisma.barber.create({
        data: {
          id: TEST_BARBER_JOHN_ID,
          name: "John Doe",
          barbershopId: TEST_BARBERSHOP_ID,
        },
      });

      // Barber in other barbershop
      await prisma.barber.create({
        data: {
          id: TEST_BARBER_JANE_ID,
          name: "Jane Smith",
          barbershopId: OTHER_BARBERSHOP_ID,
        },
      });

      const response = await request(app.server).get(
        `/barbershops/${TEST_BARBERSHOP_ID}/barbers`,
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body.barbers).toHaveLength(1);
      expect(response.body.barbers[0].name).toEqual("John Doe");
    });
  });

  describe("full week schedule with multiple breaks", () => {
    it("should return complete week schedule with multiple breaks per day", async () => {
      await prisma.barbershop.create({
        data: {
          id: TEST_BARBERSHOP_ID,
          name: "The Paula Barber",
          slug: "the-paula-barber",
          phone: "+5511999990000",
        },
      });

      await prisma.barber.create({
        data: {
          id: TEST_BARBER_JOHN_ID,
          name: "John Doe",
          barbershopId: TEST_BARBERSHOP_ID,
        },
      });

      // Create schedule for Monday with multiple breaks
      const mondaySchedule = await prisma.barberSchedule.create({
        data: {
          barberId: TEST_BARBER_JOHN_ID,
          dayOfWeek: 1,
          startTime: "08:00",
          endTime: "20:00",
          isActive: true,
        },
      });

      // Add multiple breaks
      await prisma.barberBreak.createMany({
        data: [
          {
            scheduleId: mondaySchedule.id,
            startTime: "10:30",
            endTime: "10:45",
          },
          {
            scheduleId: mondaySchedule.id,
            startTime: "13:00",
            endTime: "14:00",
          },
          {
            scheduleId: mondaySchedule.id,
            startTime: "16:30",
            endTime: "16:45",
          },
        ],
      });

      // Sunday - inactive
      await prisma.barberSchedule.create({
        data: {
          barberId: TEST_BARBER_JOHN_ID,
          dayOfWeek: 0,
          startTime: "10:00",
          endTime: "16:00",
          isActive: false,
        },
      });

      const response = await request(app.server).get(
        `/barbershops/${TEST_BARBERSHOP_ID}/barbers`,
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body.barbers[0].schedules).toHaveLength(2);

      const monday = response.body.barbers[0].schedules.find(
        (s: { dayOfWeek: number }) => s.dayOfWeek === 1,
      );
      expect(monday.breaks).toHaveLength(3);

      const sunday = response.body.barbers[0].schedules.find(
        (s: { dayOfWeek: number }) => s.dayOfWeek === 0,
      );
      expect(sunday.isActive).toBe(false);
    });
  });

  describe("response format validation", () => {
    it("should not expose sensitive or irrelevant fields", async () => {
      await prisma.barbershop.create({
        data: {
          id: TEST_BARBERSHOP_ID,
          name: "The Paula Barber",
          slug: "the-paula-barber",
          phone: "+5511999990000",
        },
      });

      await prisma.barber.create({
        data: {
          id: TEST_BARBER_JOHN_ID,
          name: "John Doe",
          phone: "+5511999991111", // Should NOT be exposed
          barbershopId: TEST_BARBERSHOP_ID,
        },
      });

      const response = await request(app.server).get(
        `/barbershops/${TEST_BARBERSHOP_ID}/barbers`,
      );

      expect(response.statusCode).toEqual(200);

      // Should only have id, name, schedules
      const barber = response.body.barbers[0];
      expect(Object.keys(barber)).toEqual(["id", "name", "schedules"]);

      // Should NOT expose phone, barbershopId, createdAt, updatedAt
      expect(barber).not.toHaveProperty("phone");
      expect(barber).not.toHaveProperty("barbershopId");
      expect(barber).not.toHaveProperty("createdAt");
      expect(barber).not.toHaveProperty("updatedAt");
    });
  });
});
