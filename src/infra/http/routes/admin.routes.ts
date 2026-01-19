import { FastifyInstance } from "fastify";
import { requestOTPController } from "../controllers/admin/requestOTP.controller.js";
import { verifyOTPController } from "../controllers/admin/verifyOTP.controller.js";
import {
  adminAuthMiddleware,
  ownerOnlyMiddleware,
} from "../middlewares/admin-auth.js";
import { subscriptionGuardMiddleware } from "../middlewares/subscription-guard.js";

// Barbers CRUD
import { listBarbersController } from "../controllers/admin/barbers/listBarbers.controller.js";
import { createBarberController } from "../controllers/admin/barbers/createBarber.controller.js";
import { updateBarberController } from "../controllers/admin/barbers/updateBarber.controller.js";
import { deleteBarberController } from "../controllers/admin/barbers/deleteBarber.controller.js";

// Services CRUD
import { listServicesController } from "../controllers/admin/services/listServices.controller.js";
import { createServiceController } from "../controllers/admin/services/createService.controller.js";
import { updateServiceController } from "../controllers/admin/services/updateService.controller.js";
import { deleteServiceController } from "../controllers/admin/services/deleteService.controller.js";

// Barbershop
import { getBarbershopController } from "../controllers/admin/barbershop/getBarbershop.controller.js";
import { updateBarbershopController } from "../controllers/admin/barbershop/updateBarbershop.controller.js";

// Subscription
import { getSubscriptionController } from "../controllers/admin/subscription/getSubscription.controller.js";

/**
 * Admin Routes
 *
 * Authentication Flow (WhatsApp OTP):
 * 1. POST /admin/auth/request-otp - Request OTP code via WhatsApp
 * 2. POST /admin/auth/verify-otp  - Verify OTP and get JWT token
 *
 * Protected routes require:
 * - Authorization: Bearer <token> header, OR
 * - admin_session cookie (set automatically on login)
 *
 * Subscription Guard:
 * Some routes require an active subscription or valid trial.
 * Routes without subscription guard are always accessible for authenticated users.
 */
export async function adminRoutes(app: FastifyInstance) {
  // ==========================================
  // AUTHENTICATION (Public)
  // ==========================================

  /**
   * POST /admin/auth/request-otp
   * Request OTP code via WhatsApp
   *
   * Body: { phone: "+5511999998888" }
   * Response: { success: true, message: string, expiresAt: string }
   *
   * In dev mode, also returns devCode for testing
   */
  app.post("/admin/auth/request-otp", requestOTPController);

  /**
   * POST /admin/auth/verify-otp
   * Verify OTP and create session
   *
   * Body: { phone: "+5511999998888", code: "123456" }
   * Response: { admin: {...}, token: string, expiresAt: string }
   */
  app.post("/admin/auth/verify-otp", verifyOTPController);

  // ==========================================
  // ALWAYS ACCESSIBLE (Auth only, no subscription check)
  // ==========================================

  /**
   * GET /admin/me
   * Get current admin info
   */
  app.get(
    "/admin/me",
    { preHandler: [adminAuthMiddleware] },
    async (req, reply) => {
      return reply.send({
        admin: req.admin,
        message: "Authenticated successfully",
      });
    },
  );

  /**
   * POST /admin/auth/logout
   * Clear session cookie
   */
  app.post(
    "/admin/auth/logout",
    { preHandler: [adminAuthMiddleware] },
    async (req, reply) => {
      reply.clearCookie("admin_session", { path: "/" });
      return reply.send({ message: "Logged out successfully" });
    },
  );

  /**
   * GET /admin/barbershop
   * Get barbershop info (always accessible)
   */
  app.get(
    "/admin/barbershop",
    { preHandler: [adminAuthMiddleware] },
    getBarbershopController,
  );

  /**
   * GET /admin/subscription
   * Get subscription status (always accessible)
   */
  app.get(
    "/admin/subscription",
    { preHandler: [adminAuthMiddleware] },
    getSubscriptionController,
  );

  // ==========================================
  // SUBSCRIPTION REQUIRED ROUTES
  // ==========================================

  /**
   * PATCH /admin/barbershop
   * Update barbershop info
   */
  app.patch(
    "/admin/barbershop",
    { preHandler: [adminAuthMiddleware, subscriptionGuardMiddleware] },
    updateBarbershopController,
  );

  // ==========================================
  // BARBERS MANAGEMENT (Subscription required)
  // ==========================================

  /**
   * GET /admin/barbers
   * List all barbers
   */
  app.get(
    "/admin/barbers",
    { preHandler: [adminAuthMiddleware, subscriptionGuardMiddleware] },
    listBarbersController,
  );

  /**
   * POST /admin/barbers
   * Create a new barber
   */
  app.post(
    "/admin/barbers",
    { preHandler: [adminAuthMiddleware, subscriptionGuardMiddleware] },
    createBarberController,
  );

  /**
   * PATCH /admin/barbers/:id
   * Update a barber
   */
  app.patch(
    "/admin/barbers/:id",
    { preHandler: [adminAuthMiddleware, subscriptionGuardMiddleware] },
    updateBarberController,
  );

  /**
   * DELETE /admin/barbers/:id
   * Delete a barber
   */
  app.delete(
    "/admin/barbers/:id",
    { preHandler: [adminAuthMiddleware, subscriptionGuardMiddleware] },
    deleteBarberController,
  );

  // ==========================================
  // SERVICES MANAGEMENT (Subscription required)
  // ==========================================

  /**
   * GET /admin/services
   * List all services
   */
  app.get(
    "/admin/services",
    { preHandler: [adminAuthMiddleware, subscriptionGuardMiddleware] },
    listServicesController,
  );

  /**
   * POST /admin/services
   * Create a new service
   */
  app.post(
    "/admin/services",
    { preHandler: [adminAuthMiddleware, subscriptionGuardMiddleware] },
    createServiceController,
  );

  /**
   * PATCH /admin/services/:id
   * Update a service
   */
  app.patch(
    "/admin/services/:id",
    { preHandler: [adminAuthMiddleware, subscriptionGuardMiddleware] },
    updateServiceController,
  );

  /**
   * DELETE /admin/services/:id
   * Delete a service
   */
  app.delete(
    "/admin/services/:id",
    { preHandler: [adminAuthMiddleware, subscriptionGuardMiddleware] },
    deleteServiceController,
  );

  // ==========================================
  // DASHBOARD (Subscription required)
  // ==========================================

  /**
   * GET /admin/dashboard
   * Get dashboard stats
   */
  app.get(
    "/admin/dashboard",
    { preHandler: [adminAuthMiddleware, subscriptionGuardMiddleware] },
    async (req, reply) => {
      // TODO: Implement GetDashboardUseCase
      return reply.send({
        message: "Dashboard endpoint - pending implementation",
        barbershopId: req.admin?.barbershopId,
      });
    },
  );

  /**
   * GET /admin/agenda
   * Get barbers agenda for a specific date
   *
   * Query: { date: "2026-01-17", barberId?: string }
   */
  app.get(
    "/admin/agenda",
    { preHandler: [adminAuthMiddleware, subscriptionGuardMiddleware] },
    async (req, reply) => {
      // TODO: Implement GetBarberAgendaUseCase
      return reply.send({
        message: "Agenda endpoint - pending implementation",
        barbershopId: req.admin?.barbershopId,
      });
    },
  );

  // ==========================================
  // APPOINTMENTS MANAGEMENT (Subscription required)
  // ==========================================

  app.get(
    "/admin/appointments",
    { preHandler: [adminAuthMiddleware, subscriptionGuardMiddleware] },
    async (req, reply) => {
      return reply.send({
        message: "Appointments list - pending implementation",
      });
    },
  );

  app.patch(
    "/admin/appointments/:id/status",
    { preHandler: [adminAuthMiddleware, subscriptionGuardMiddleware] },
    async (req, reply) => {
      return reply.send({
        message: "Update appointment status - pending implementation",
      });
    },
  );

  // ==========================================
  // ADMIN MANAGEMENT (Owner only, subscription required)
  // ==========================================

  app.get(
    "/admin/admins",
    {
      preHandler: [
        adminAuthMiddleware,
        subscriptionGuardMiddleware,
        ownerOnlyMiddleware,
      ],
    },
    async (req, reply) => {
      return reply.send({
        message: "Admin list - pending implementation (owner only)",
      });
    },
  );

  app.post(
    "/admin/admins",
    {
      preHandler: [
        adminAuthMiddleware,
        subscriptionGuardMiddleware,
        ownerOnlyMiddleware,
      ],
    },
    async (req, reply) => {
      return reply.send({
        message: "Create admin - pending implementation (owner only)",
      });
    },
  );

  // ==========================================
  // STATUS (Health check for admin routes)
  // ==========================================

  app.get("/admin/status", async () => {
    return {
      status: "ok",
      message: "Admin routes are registered",
      endpoints: {
        auth: [
          "POST /admin/auth/request-otp",
          "POST /admin/auth/verify-otp",
          "POST /admin/auth/logout",
        ],
        alwaysAccessible: [
          "GET /admin/me",
          "GET /admin/barbershop",
          "GET /admin/subscription",
        ],
        subscriptionRequired: [
          "PATCH /admin/barbershop",
          "GET /admin/barbers",
          "POST /admin/barbers",
          "PATCH /admin/barbers/:id",
          "DELETE /admin/barbers/:id",
          "GET /admin/services",
          "POST /admin/services",
          "PATCH /admin/services/:id",
          "DELETE /admin/services/:id",
          "GET /admin/dashboard",
          "GET /admin/agenda",
          "GET /admin/appointments",
          "PATCH /admin/appointments/:id/status",
        ],
        ownerOnly: ["GET /admin/admins", "POST /admin/admins"],
      },
    };
  });
}
