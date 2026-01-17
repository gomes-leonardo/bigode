import { FastifyInstance } from "fastify";
import { createBookingLinkController } from "../controllers/auth/createBookingLink.controller.js";
import { validateBookingTokenController } from "../controllers/auth/validateBookingToken.controller.js";

export async function authRoutes(app: FastifyInstance) {
  /**
   * Creates a secure booking link.
   * Called by barbershop system to generate a link for customer.
   *
   * POST /auth/booking-link
   * Body: { barbershopId, barberId?, customerPhone }
   * Response: { bookingUrl, expiresAt }
   */
  app.post("/auth/booking-link", createBookingLinkController);

  /**
   * Validates booking token and creates session.
   * Called when customer clicks the booking link.
   *
   * GET /auth/booking/:token
   * Response: Sets HttpOnly session cookie + { barbershopId, barberId }
   */
  app.get("/auth/booking/:token", validateBookingTokenController);
}
