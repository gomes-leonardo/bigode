import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../../app.js";
import { clearDatabase } from "../../../database/prisma/test-utils.js";
import { prisma } from "../../../database/prisma/client.js";

describe("Queue Controller (E2E)", () => {
  let testBarbershopId: string;
  let testBarberId: string;

  beforeAll(async () => {
    await app.ready();
  });

  beforeEach(async () => {
    await clearDatabase();

    // Create test barbershop with queue enabled
    const barbershop = await prisma.barbershop.create({
      data: {
        name: "Test Barbershop",
        slug: "test-barbershop",
        phone: "+5511999999999",
        isQueueEnabled: true,
        subscriptionTier: "PREMIUM",
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

  describe("POST /barbershops/:barbershopId/queue - Join Queue", () => {
    it("should join queue successfully", async () => {
      const response = await request(app.server)
        .post(`/barbershops/${testBarbershopId}/queue`)
        .send({
          customerPhone: "+5511988888888",
          customerName: "John Doe",
        });

      expect(response.statusCode).toEqual(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.position).toBe(1);
      expect(response.body.status).toBe("WAITING");
      expect(response.body.message).toContain("posição 1");
    });

    it("should join queue with preferred barber", async () => {
      const response = await request(app.server)
        .post(`/barbershops/${testBarbershopId}/queue`)
        .send({
          customerPhone: "+5511988888888",
          preferredBarberId: testBarberId,
        });

      expect(response.statusCode).toEqual(201);
      expect(response.body.position).toBe(1);
    });

    it("should calculate position correctly for multiple customers", async () => {
      // First customer
      const response1 = await request(app.server)
        .post(`/barbershops/${testBarbershopId}/queue`)
        .send({ customerPhone: "+5511988888881" });

      // Second customer
      const response2 = await request(app.server)
        .post(`/barbershops/${testBarbershopId}/queue`)
        .send({ customerPhone: "+5511988888882" });

      // Third customer
      const response3 = await request(app.server)
        .post(`/barbershops/${testBarbershopId}/queue`)
        .send({ customerPhone: "+5511988888883" });

      expect(response1.body.position).toBe(1);
      expect(response2.body.position).toBe(2);
      expect(response3.body.position).toBe(3);
    });

    it("should prevent double joining", async () => {
      // First join
      await request(app.server)
        .post(`/barbershops/${testBarbershopId}/queue`)
        .send({ customerPhone: "+5511988888888" });

      // Try to join again
      const response = await request(app.server)
        .post(`/barbershops/${testBarbershopId}/queue`)
        .send({ customerPhone: "+5511988888888" });

      expect(response.statusCode).toEqual(409);
      expect(response.body.code).toBe("ALREADY_IN_QUEUE");
    });

    it("should return 400 when queue is disabled", async () => {
      // Create barbershop with queue disabled
      const disabledShop = await prisma.barbershop.create({
        data: {
          name: "Disabled Queue Shop",
          slug: "disabled-queue",
          phone: "+5511977777777",
          isQueueEnabled: false,
        },
      });

      const response = await request(app.server)
        .post(`/barbershops/${disabledShop.id}/queue`)
        .send({ customerPhone: "+5511988888888" });

      expect(response.statusCode).toEqual(400);
      expect(response.body.code).toBe("QUEUE_DISABLED");
    });

    it("should return 404 for non-existent barbershop", async () => {
      const response = await request(app.server)
        .post("/barbershops/550e8400-e29b-41d4-a716-446655440099/queue")
        .send({ customerPhone: "+5511988888888" });

      expect(response.statusCode).toEqual(404);
      expect(response.body.code).toBe("BARBERSHOP_NOT_FOUND");
    });

    it("should return 400 for invalid phone", async () => {
      const response = await request(app.server)
        .post(`/barbershops/${testBarbershopId}/queue`)
        .send({ customerPhone: "123" });

      expect(response.statusCode).toEqual(400);
      expect(response.body.message).toBe("Validation error");
    });

    it("should create customer if not exists", async () => {
      const customerPhone = "+5511966666666";

      // Verify customer doesn't exist
      const existingCustomer = await prisma.customer.findUnique({
        where: { phone: customerPhone },
      });
      expect(existingCustomer).toBeNull();

      // Join queue
      await request(app.server)
        .post(`/barbershops/${testBarbershopId}/queue`)
        .send({
          customerPhone,
          customerName: "New Customer",
        });

      // Verify customer was created
      const newCustomer = await prisma.customer.findUnique({
        where: { phone: customerPhone },
      });
      expect(newCustomer).not.toBeNull();
      expect(newCustomer?.name).toBe("New Customer");
    });
  });

  describe("GET /barbershops/:barbershopId/queue - Get Queue Status", () => {
    it("should return empty queue", async () => {
      const response = await request(app.server).get(
        `/barbershops/${testBarbershopId}/queue`,
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body.totalInQueue).toBe(0);
      expect(response.body.items).toEqual([]);
      expect(response.body.isQueueEnabled).toBe(true);
    });

    it("should return queue with customers", async () => {
      // Add customers to queue
      await request(app.server)
        .post(`/barbershops/${testBarbershopId}/queue`)
        .send({ customerPhone: "+5511988888881", customerName: "Customer 1" });

      await request(app.server)
        .post(`/barbershops/${testBarbershopId}/queue`)
        .send({ customerPhone: "+5511988888882", customerName: "Customer 2" });

      const response = await request(app.server).get(
        `/barbershops/${testBarbershopId}/queue`,
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body.totalInQueue).toBe(2);
      expect(response.body.waitingCount).toBe(2);
      expect(response.body.items).toHaveLength(2);
      expect(response.body.items[0].position).toBe(1);
      expect(response.body.items[1].position).toBe(2);
    });

    it("should return 400 when queue is disabled", async () => {
      const disabledShop = await prisma.barbershop.create({
        data: {
          name: "Disabled Queue Shop",
          slug: "disabled-queue-2",
          phone: "+5511966666666",
          isQueueEnabled: false,
        },
      });

      const response = await request(app.server).get(
        `/barbershops/${disabledShop.id}/queue`,
      );

      expect(response.statusCode).toEqual(400);
      expect(response.body.code).toBe("QUEUE_DISABLED");
    });

    it("should return 404 for non-existent barbershop", async () => {
      const response = await request(app.server).get(
        "/barbershops/550e8400-e29b-41d4-a716-446655440099/queue",
      );

      expect(response.statusCode).toEqual(404);
      expect(response.body.code).toBe("BARBERSHOP_NOT_FOUND");
    });
  });

  describe("DELETE /barbershops/:barbershopId/queue/:queueItemId - Leave Queue", () => {
    it("should leave queue successfully", async () => {
      // Join queue first
      const joinResponse = await request(app.server)
        .post(`/barbershops/${testBarbershopId}/queue`)
        .send({ customerPhone: "+5511988888888" });

      const queueItemId = joinResponse.body.id;

      // Leave queue
      const response = await request(app.server).delete(
        `/barbershops/${testBarbershopId}/queue/${queueItemId}`,
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body.status).toBe("CANCELED");
      expect(response.body.message).toContain("saiu da fila");
    });

    it("should return 404 for non-existent queue item", async () => {
      const response = await request(app.server).delete(
        `/barbershops/${testBarbershopId}/queue/550e8400-e29b-41d4-a716-446655440099`,
      );

      expect(response.statusCode).toEqual(404);
      expect(response.body.code).toBe("QUEUE_ITEM_NOT_FOUND");
    });

    it("should allow same customer to rejoin after leaving", async () => {
      // Join queue
      const joinResponse = await request(app.server)
        .post(`/barbershops/${testBarbershopId}/queue`)
        .send({ customerPhone: "+5511988888888" });

      // Leave queue
      await request(app.server).delete(
        `/barbershops/${testBarbershopId}/queue/${joinResponse.body.id}`,
      );

      // Rejoin queue
      const rejoinResponse = await request(app.server)
        .post(`/barbershops/${testBarbershopId}/queue`)
        .send({ customerPhone: "+5511988888888" });

      expect(rejoinResponse.statusCode).toEqual(201);
      expect(rejoinResponse.body.position).toBe(1);
    });
  });

  describe("POST /barbershops/:barbershopId/queue/:queueItemId/call - Call Customer", () => {
    it("should call customer successfully", async () => {
      // Join queue first
      const joinResponse = await request(app.server)
        .post(`/barbershops/${testBarbershopId}/queue`)
        .send({ customerPhone: "+5511988888888" });

      const queueItemId = joinResponse.body.id;

      // Call customer
      const response = await request(app.server).post(
        `/barbershops/${testBarbershopId}/queue/${queueItemId}/call`,
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body.status).toBe("NOTIFIED");
      expect(response.body.message).toContain("notificado");
    });

    it("should be idempotent (calling already notified customer)", async () => {
      // Join queue
      const joinResponse = await request(app.server)
        .post(`/barbershops/${testBarbershopId}/queue`)
        .send({ customerPhone: "+5511988888888" });

      const queueItemId = joinResponse.body.id;

      // Call customer twice
      await request(app.server).post(
        `/barbershops/${testBarbershopId}/queue/${queueItemId}/call`,
      );

      const response = await request(app.server).post(
        `/barbershops/${testBarbershopId}/queue/${queueItemId}/call`,
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body.status).toBe("NOTIFIED");
    });

    it("should return 404 for non-existent queue item", async () => {
      const response = await request(app.server).post(
        `/barbershops/${testBarbershopId}/queue/550e8400-e29b-41d4-a716-446655440099/call`,
      );

      expect(response.statusCode).toEqual(404);
      expect(response.body.code).toBe("QUEUE_ITEM_NOT_FOUND");
    });

    it("should return 400 for canceled queue item", async () => {
      // Join queue
      const joinResponse = await request(app.server)
        .post(`/barbershops/${testBarbershopId}/queue`)
        .send({ customerPhone: "+5511988888888" });

      const queueItemId = joinResponse.body.id;

      // Cancel (leave queue)
      await request(app.server).delete(
        `/barbershops/${testBarbershopId}/queue/${queueItemId}`,
      );

      // Try to call
      const response = await request(app.server).post(
        `/barbershops/${testBarbershopId}/queue/${queueItemId}/call`,
      );

      expect(response.statusCode).toEqual(400);
      expect(response.body.code).toBe("INVALID_QUEUE_STATUS");
    });
  });

  describe("Queue Flow Integration", () => {
    it("should handle complete queue flow", async () => {
      // Customer 1 joins
      const customer1 = await request(app.server)
        .post(`/barbershops/${testBarbershopId}/queue`)
        .send({ customerPhone: "+5511988888881", customerName: "Customer 1" });
      expect(customer1.body.position).toBe(1);

      // Customer 2 joins
      const customer2 = await request(app.server)
        .post(`/barbershops/${testBarbershopId}/queue`)
        .send({ customerPhone: "+5511988888882", customerName: "Customer 2" });
      expect(customer2.body.position).toBe(2);

      // Customer 3 joins
      const customer3 = await request(app.server)
        .post(`/barbershops/${testBarbershopId}/queue`)
        .send({ customerPhone: "+5511988888883", customerName: "Customer 3" });
      expect(customer3.body.position).toBe(3);

      // Check queue status
      let queueStatus = await request(app.server).get(
        `/barbershops/${testBarbershopId}/queue`,
      );
      expect(queueStatus.body.totalInQueue).toBe(3);
      expect(queueStatus.body.waitingCount).toBe(3);

      // Call first customer
      await request(app.server).post(
        `/barbershops/${testBarbershopId}/queue/${customer1.body.id}/call`,
      );

      // Check queue status - 1 notified, 2 waiting
      queueStatus = await request(app.server).get(
        `/barbershops/${testBarbershopId}/queue`,
      );
      expect(queueStatus.body.totalInQueue).toBe(3);
      expect(queueStatus.body.notifiedCount).toBe(1);
      expect(queueStatus.body.waitingCount).toBe(2);

      // Customer 2 leaves
      await request(app.server).delete(
        `/barbershops/${testBarbershopId}/queue/${customer2.body.id}`,
      );

      // Check queue status - 1 notified, 1 waiting (customer 2 left)
      queueStatus = await request(app.server).get(
        `/barbershops/${testBarbershopId}/queue`,
      );
      expect(queueStatus.body.totalInQueue).toBe(2);
      expect(queueStatus.body.notifiedCount).toBe(1);
      expect(queueStatus.body.waitingCount).toBe(1);
    });
  });
});
