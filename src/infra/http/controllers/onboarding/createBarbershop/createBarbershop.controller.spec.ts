import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../../../app.js";
import { clearDatabase } from "../../../../database/prisma/test-utils.js";

describe("Create Barbershop (E2E)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  it("should create a barbershop with owner admin and 30-day trial", async () => {
    const response = await request(app.server).post("/barbershops").send({
      name: "Barbearia do Zé",
      slug: "barbearia-do-ze",
      phone: "+5511999990000",
      ownerEmail: "ze@email.com",
      ownerPhone: "+5511999990001",
      ownerName: "José Silva",
    });

    expect(response.statusCode).toEqual(201);
    expect(response.body).toMatchObject({
      barbershop: {
        id: expect.any(String),
        name: "Barbearia do Zé",
        slug: "barbearia-do-ze",
        phone: "+5511999990000",
        timezone: "America/Sao_Paulo",
        subscriptionStatus: "TRIAL",
        createdAt: expect.any(String),
      },
      admin: {
        id: expect.any(String),
        email: "ze@email.com",
        phone: "+5511999990001",
        name: "José Silva",
        role: "OWNER",
      },
      trialInfo: {
        startsAt: expect.any(String),
        endsAt: expect.any(String),
        daysRemaining: 30,
      },
    });

    // Verify trial ends in ~30 days
    const trialEndsAt = new Date(response.body.trialInfo.endsAt);
    const now = new Date();
    const diffDays = Math.ceil(
      (trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    expect(diffDays).toBeGreaterThanOrEqual(29);
    expect(diffDays).toBeLessThanOrEqual(31);
  });

  it("should normalize slug (remove diacritics, lowercase)", async () => {
    const response = await request(app.server).post("/barbershops").send({
      name: "Barbearia do João",
      slug: "Barbearia-do-João",
      phone: "+5511999990000",
      ownerEmail: "joao@email.com",
      ownerPhone: "+5511999990001",
      ownerName: "João Silva",
    });

    expect(response.statusCode).toEqual(201);
    expect(response.body.barbershop.slug).toEqual("barbearia-do-joao");
  });

  it("should return 400 for invalid input", async () => {
    const response = await request(app.server).post("/barbershops").send({
      name: "A", // Too short
      slug: "test",
      phone: "123", // Too short
      ownerEmail: "invalid-email",
      ownerPhone: "+5511999990001",
      ownerName: "Test",
    });

    expect(response.statusCode).toEqual(400);
    expect(response.body).toHaveProperty("message", "Validation error");
    expect(response.body).toHaveProperty("errors");
  });

  it("should return 409 when slug already exists", async () => {
    // Create first barbershop
    await request(app.server).post("/barbershops").send({
      name: "Barbearia 1",
      slug: "same-slug",
      phone: "+5511999990000",
      ownerEmail: "first@email.com",
      ownerPhone: "+5511999990001",
      ownerName: "First Owner",
    });

    // Try to create with same slug
    const response = await request(app.server).post("/barbershops").send({
      name: "Barbearia 2",
      slug: "same-slug",
      phone: "+5511999990002",
      ownerEmail: "second@email.com",
      ownerPhone: "+5511999990003",
      ownerName: "Second Owner",
    });

    expect(response.statusCode).toEqual(409);
    expect(response.body).toMatchObject({
      code: "SLUG_EXISTS",
      field: "slug",
    });
  });

  it("should return 409 when barbershop phone already exists", async () => {
    // Create first barbershop
    await request(app.server).post("/barbershops").send({
      name: "Barbearia 1",
      slug: "barbearia-1",
      phone: "+5511999990000",
      ownerEmail: "first@email.com",
      ownerPhone: "+5511999990001",
      ownerName: "First Owner",
    });

    // Try to create with same phone
    const response = await request(app.server).post("/barbershops").send({
      name: "Barbearia 2",
      slug: "barbearia-2",
      phone: "+5511999990000",
      ownerEmail: "second@email.com",
      ownerPhone: "+5511999990003",
      ownerName: "Second Owner",
    });

    expect(response.statusCode).toEqual(409);
    expect(response.body).toMatchObject({
      code: "PHONE_EXISTS",
      field: "phone",
    });
  });

  it("should return 409 when owner email already exists", async () => {
    // Create first barbershop
    await request(app.server).post("/barbershops").send({
      name: "Barbearia 1",
      slug: "barbearia-1",
      phone: "+5511999990000",
      ownerEmail: "same@email.com",
      ownerPhone: "+5511999990001",
      ownerName: "First Owner",
    });

    // Try to create with same owner email
    const response = await request(app.server).post("/barbershops").send({
      name: "Barbearia 2",
      slug: "barbearia-2",
      phone: "+5511999990002",
      ownerEmail: "same@email.com",
      ownerPhone: "+5511999990003",
      ownerName: "Second Owner",
    });

    expect(response.statusCode).toEqual(409);
    expect(response.body).toMatchObject({
      code: "EMAIL_EXISTS",
      field: "ownerEmail",
    });
  });

  it("should return 409 when owner phone already exists", async () => {
    // Create first barbershop
    await request(app.server).post("/barbershops").send({
      name: "Barbearia 1",
      slug: "barbearia-1",
      phone: "+5511999990000",
      ownerEmail: "first@email.com",
      ownerPhone: "+5511999990001",
      ownerName: "First Owner",
    });

    // Try to create with same owner phone
    const response = await request(app.server).post("/barbershops").send({
      name: "Barbearia 2",
      slug: "barbearia-2",
      phone: "+5511999990002",
      ownerEmail: "second@email.com",
      ownerPhone: "+5511999990001",
      ownerName: "Second Owner",
    });

    expect(response.statusCode).toEqual(409);
    expect(response.body).toMatchObject({
      code: "OWNER_PHONE_EXISTS",
      field: "ownerPhone",
    });
  });
});
