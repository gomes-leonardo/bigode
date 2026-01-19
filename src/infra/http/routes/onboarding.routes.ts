import { FastifyInstance } from "fastify";
import { createBarbershopController } from "../controllers/onboarding/createBarbershop/createBarbershop.controller.js";

/**
 * Onboarding Routes
 *
 * Public endpoints for barbershop signup/registration.
 * These endpoints do not require authentication.
 */
export async function onboardingRoutes(app: FastifyInstance) {
  /**
   * POST /barbershops
   * Create a new barbershop with owner admin (signup/onboarding).
   * Automatically starts a 30-day free trial.
   *
   * Body: {
   *   name: string,
   *   slug: string,
   *   phone: string,
   *   ownerEmail: string,
   *   ownerPhone: string,
   *   ownerName: string
   * }
   */
  app.post("/barbershops", createBarbershopController);
}
