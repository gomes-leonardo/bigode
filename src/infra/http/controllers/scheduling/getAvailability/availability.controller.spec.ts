import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../../../../app.js";
import { clearDatabase } from "../../../../database/prisma/test-utils.js";

describe("Availability Controller (E2E)", () => {
  beforeAll(async () => {
    await clearDatabase();
    try {
      await app.ready();
    } catch (error) {
      console.error(error);
    }
  });

  afterAll(async () => {});

  it("should return available slots list when receiving valid data", async () => {
    const barberId = "550e8400-e29b-41d4-a716-446655440000";
    // Use a future date to ensure slots are returned
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const response = await request(app.server).get("/availability").query({
      barberId,
      date: futureDate.toISOString(),
    });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty("slots");
    expect(Array.isArray(response.body.slots)).toBe(true);
  });

  it("should return only future available slots", async () => {
    const barberId = "550e8400-e29b-41d4-a716-446655440000";
    // Use a future date to ensure slots are returned
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const response = await request(app.server).get("/availability").query({
      barberId,
      date: futureDate.toISOString(),
    });

    expect(response.statusCode).toEqual(200);
    expect(response.body.slots.length).toBeGreaterThan(0);

    // Each slot should have startTime and endTime
    response.body.slots.forEach(
      (slot: { startTime: string; endTime: string }) => {
        expect(slot).toHaveProperty("startTime");
        expect(slot).toHaveProperty("endTime");
      },
    );
  });

  it("should return empty slots for a past date", async () => {
    const barberId = "550e8400-e29b-41d4-a716-446655440000";
    // Use a past date
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    const response = await request(app.server).get("/availability").query({
      barberId,
      date: pastDate.toISOString(),
    });

    expect(response.statusCode).toEqual(200);
    expect(response.body.slots).toEqual([]);
  });

  it("should return 400 Bad Request when mandatory fields are missing", async () => {
    const response = await request(app.server).get("/availability").query({
      barberId: "550e8400-e29b-41d4-a716-446655440000",
    });

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual("Validation error");
  });

  it("should return 400 Bad Request when barberId is not a valid UUID", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const response = await request(app.server).get("/availability").query({
      barberId: "invalid-uuid",
      date: futureDate.toISOString(),
    });

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual("Validation error");
  });
});
