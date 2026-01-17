import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../../app.js";
import { clearDatabase } from "../../../database/prisma/test-utils.js";
import { prisma } from "../../../database/prisma/client.js";

describe("Auth Controller - Secure Booking Flow (E2E)", () => {
  let testBarbershopId: string;
  let testBarberId: string;

  beforeAll(async () => {
    await app.ready();
  });

  beforeEach(async () => {
    await clearDatabase();

    // Create test barbershop
    const barbershop = await prisma.barbershop.create({
      data: {
        name: "Test Barbershop",
        slug: "test-barbershop",
        phone: "+5511999999999",
      },
    });
    testBarbershopId = barbershop.id;

    // Create test barber
    const barber = await prisma.barber.create({
      data: {
        name: "Test Barber",
        barbershopId: testBarbershopId,
      },
    });
    testBarberId = barber.id;
  });

  describe("POST /auth/booking-link", () => {
    it("should create a secure booking link", async () => {
      const response = await request(app.server)
        .post("/auth/booking-link")
        .send({
          barbershopId: testBarbershopId,
          barberId: testBarberId,
          customerPhone: "+5511988888888",
        });

      expect(response.statusCode).toEqual(201);
      expect(response.body).toHaveProperty("bookingUrl");
      expect(response.body).toHaveProperty("expiresAt");

      // URL should contain only the token, no sensitive data
      expect(response.body.bookingUrl).toMatch(/\/booking\/[A-Za-z0-9_-]+$/);
      expect(response.body.bookingUrl).not.toContain("token=");
      expect(response.body.bookingUrl).not.toContain("barberId=");
      expect(response.body.bookingUrl).not.toContain("phone");
    });

    it("should allow booking link without barberId (customer chooses later)", async () => {
      const response = await request(app.server)
        .post("/auth/booking-link")
        .send({
          barbershopId: testBarbershopId,
          customerPhone: "+5511988888888",
        });

      expect(response.statusCode).toEqual(201);
      expect(response.body).toHaveProperty("bookingUrl");
    });

    it("should return 404 for non-existent barbershop", async () => {
      const response = await request(app.server)
        .post("/auth/booking-link")
        .send({
          barbershopId: "550e8400-e29b-41d4-a716-446655440099",
          customerPhone: "+5511988888888",
        });

      expect(response.statusCode).toEqual(404);
      expect(response.body.message).toEqual("Barbershop not found");
    });

    it("should return 404 for barber not in barbershop", async () => {
      // Create another barbershop and barber
      const otherBarbershop = await prisma.barbershop.create({
        data: {
          name: "Other Barbershop",
          slug: "other-barbershop",
          phone: "+5511977777777",
        },
      });

      const otherBarber = await prisma.barber.create({
        data: {
          name: "Other Barber",
          barbershopId: otherBarbershop.id,
        },
      });

      const response = await request(app.server)
        .post("/auth/booking-link")
        .send({
          barbershopId: testBarbershopId,
          barberId: otherBarber.id, // Wrong barbershop!
          customerPhone: "+5511988888888",
        });

      expect(response.statusCode).toEqual(404);
      expect(response.body.message).toEqual(
        "Barber not found in this barbershop",
      );
    });

    it("should return 400 for invalid barbershopId format", async () => {
      const response = await request(app.server)
        .post("/auth/booking-link")
        .send({
          barbershopId: "invalid-uuid",
          customerPhone: "+5511988888888",
        });

      expect(response.statusCode).toEqual(400);
      expect(response.body.message).toEqual("Validation error");
    });

    it("should return 400 for missing customerPhone", async () => {
      const response = await request(app.server)
        .post("/auth/booking-link")
        .send({
          barbershopId: testBarbershopId,
        });

      expect(response.statusCode).toEqual(400);
      expect(response.body.message).toEqual("Validation error");
    });
  });

  describe("GET /auth/booking/:token", () => {
    it("should validate token and set HttpOnly cookie", async () => {
      // First create a booking link
      const createResponse = await request(app.server)
        .post("/auth/booking-link")
        .send({
          barbershopId: testBarbershopId,
          barberId: testBarberId,
          customerPhone: "+5511988888888",
        });

      const bookingUrl = createResponse.body.bookingUrl;
      const token = bookingUrl.split("/booking/")[1];

      // Validate the token
      const validateResponse = await request(app.server).get(
        `/auth/booking/${token}`,
      );

      expect(validateResponse.statusCode).toEqual(200);
      expect(validateResponse.body.message).toEqual("Booking session started");
      expect(validateResponse.body.barbershopId).toEqual(testBarbershopId);

      // Check that HttpOnly cookie was set
      const cookies = validateResponse.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain("session=");
      expect(cookies[0]).toContain("HttpOnly");
    });

    it("should return 410 for expired token", async () => {
      // Create an expired token directly in database
      const { bookingTokenService } =
        await import("../../../../domain/scheduling/application/services/BookingTokenService.js");

      const { plainToken, tokenHash } = bookingTokenService.generateToken();

      await prisma.bookingToken.create({
        data: {
          tokenHash,
          barbershopId: testBarbershopId,
          customerPhone: "+5511988888888",
          expiresAt: new Date(Date.now() - 1000), // Already expired
          singleUse: true,
        },
      });

      const response = await request(app.server).get(
        `/auth/booking/${plainToken}`,
      );

      expect(response.statusCode).toEqual(410);
      expect(response.body.code).toEqual("TOKEN_EXPIRED");
    });

    it("should return 410 for already used token", async () => {
      // Create and use a token
      const createResponse = await request(app.server)
        .post("/auth/booking-link")
        .send({
          barbershopId: testBarbershopId,
          customerPhone: "+5511988888888",
        });

      const token = createResponse.body.bookingUrl.split("/booking/")[1];

      // Use the token once
      await request(app.server).get(`/auth/booking/${token}`);

      // Try to use it again
      const secondResponse = await request(app.server).get(
        `/auth/booking/${token}`,
      );

      expect(secondResponse.statusCode).toEqual(410);
      expect(secondResponse.body.code).toEqual("TOKEN_USED");
    });

    it("should return 404 for invalid token", async () => {
      const response = await request(app.server).get(
        "/auth/booking/invalid-token-that-does-not-exist-12345678",
      );

      expect(response.statusCode).toEqual(404);
      expect(response.body.code).toEqual("INVALID_TOKEN");
    });

    it("should return 400 for too short token", async () => {
      const response = await request(app.server).get("/auth/booking/short");

      expect(response.statusCode).toEqual(400);
      expect(response.body.message).toEqual("Invalid booking link");
    });

    it("should create customer if not exists", async () => {
      const customerPhone = "+5511966666666";

      // Verify customer doesn't exist
      const existingCustomer = await prisma.customer.findUnique({
        where: { phone: customerPhone },
      });
      expect(existingCustomer).toBeNull();

      // Create and validate token
      const createResponse = await request(app.server)
        .post("/auth/booking-link")
        .send({
          barbershopId: testBarbershopId,
          customerPhone,
        });

      const token = createResponse.body.bookingUrl.split("/booking/")[1];
      await request(app.server).get(`/auth/booking/${token}`);

      // Verify customer was created
      const newCustomer = await prisma.customer.findUnique({
        where: { phone: customerPhone },
      });
      expect(newCustomer).not.toBeNull();
    });
  });
});
