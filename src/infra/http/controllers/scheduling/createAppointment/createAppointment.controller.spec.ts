import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import { clearDatabase } from "../../../../database/prisma/test-utils.js";
import { app } from "../../../../../app.js";
import { prisma } from "../../../../database/prisma/client.js";

describe("Create Appointment (E2E)", () => {
  let barbershopId: string;
  let barberId: string;
  let serviceId: string;

  beforeAll(async () => {
    await app.ready();
  });

  beforeEach(async () => {
    await clearDatabase();

    // Create test data with unique identifiers
    const barbershop = await prisma.barbershop.create({
      data: {
        name: "Appointment Test Barbershop",
        slug: `appointment-test-${Date.now()}`,
        phone: `+551188${Date.now().toString().slice(-7)}`,
      },
    });
    barbershopId = barbershop.id;

    const barber = await prisma.barber.create({
      data: {
        name: "Appointment Test Barber",
        barbershopId,
      },
    });
    barberId = barber.id;

    const service = await prisma.service.create({
      data: {
        name: "Corte",
        durationMin: 30,
        price: 25.0,
        barbershopId,
      },
    });
    serviceId = service.id;
  });

  it("should be able to book an appointment if slot is free", async () => {
    const startTime = "2026-02-15T14:00:00.000Z";

    const token = app.jwt.sign({
      sub: "5511999999999",
      role: "CLIENT",
      barbershopId,
    });

    const response = await request(app.server)
      .post("/appointments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        barberId,
        serviceId,
        startTime,
      });

    expect(response.statusCode).toEqual(201);
    expect(response.body).toHaveProperty("appointment");
    expect(response.body.appointment).toHaveProperty("id");
    expect(response.body).toHaveProperty("message");

    const onDb = await prisma.appointment.findFirst({
      where: { id: response.body.appointment.id },
    });
    expect(onDb).toBeTruthy();
  });

  it("should NOT be able to book on an occupied slot", async () => {
    const startTime = "2026-02-15T15:00:00.000Z";

    const token = app.jwt.sign({
      sub: "5511999999999",
      role: "CLIENT",
      barbershopId,
    });

    // First request - should succeed
    const firstResponse = await request(app.server)
      .post("/appointments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        barberId,
        serviceId,
        startTime,
      });

    // Ensure first request succeeded
    expect(firstResponse.statusCode).toEqual(201);

    // Verify appointment was created
    const appointmentAlreadyExists = await prisma.appointment.findFirst({
      where: {
        barberId,
        startTime: new Date(startTime),
      },
    });
    expect(appointmentAlreadyExists).toBeTruthy();

    // Second request on same slot - should return 409
    const response = await request(app.server)
      .post("/appointments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        barberId,
        serviceId,
        startTime,
      });

    expect(response.statusCode).toEqual(409);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toEqual("Appointment already exists");
  });
});
