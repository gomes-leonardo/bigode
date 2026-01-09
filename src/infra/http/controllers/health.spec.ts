import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../../app.js";

describe("Health Check (E2E)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should return healthy status when database is connected", async () => {
    const response = await request(app.server).get("/health").send();

    expect(response.statusCode).toEqual(200);
    expect(response.body).toMatchObject({
      status: "healthy",
      database: {
        status: "connected",
        openConnections: expect.any(Number),
      },
    });
    expect(response.body.database.openConnections).toBeGreaterThanOrEqual(0);
  });
});
