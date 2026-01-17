import { FastifyInstance } from "fastify";
import { requestOTPController } from "../controllers/admin/requestOTP.controller.js";
import { verifyOTPController } from "../controllers/admin/verifyOTP.controller.js";
import {
  adminAuthMiddleware,
  ownerOnlyMiddleware,
} from "../middlewares/admin-auth.js";

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
  // PROTECTED ROUTES (Require Authentication)
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

  // ==========================================
  // DASHBOARD (TODO: Implement)
  // ==========================================

  /**
   * GET /admin/dashboard
   * Get dashboard stats
   */
  app.get(
    "/admin/dashboard",
    { preHandler: [adminAuthMiddleware] },
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
    { preHandler: [adminAuthMiddleware] },
    async (req, reply) => {
      // TODO: Implement GetBarberAgendaUseCase
      return reply.send({
        message: "Agenda endpoint - pending implementation",
        barbershopId: req.admin?.barbershopId,
      });
    },
  );

  // ==========================================
  // APPOINTMENTS MANAGEMENT (TODO)
  // ==========================================

  app.get(
    "/admin/appointments",
    { preHandler: [adminAuthMiddleware] },
    async (req, reply) => {
      return reply.send({
        message: "Appointments list - pending implementation",
      });
    },
  );

  app.patch(
    "/admin/appointments/:id/status",
    { preHandler: [adminAuthMiddleware] },
    async (req, reply) => {
      return reply.send({
        message: "Update appointment status - pending implementation",
      });
    },
  );

  // ==========================================
  // BARBERS MANAGEMENT (TODO)
  // ==========================================

  app.get(
    "/admin/barbers",
    { preHandler: [adminAuthMiddleware] },
    async (req, reply) => {
      return reply.send({
        message: "Barbers list - pending implementation",
      });
    },
  );

  app.post(
    "/admin/barbers",
    { preHandler: [adminAuthMiddleware] },
    async (req, reply) => {
      return reply.send({
        message: "Create barber - pending implementation",
      });
    },
  );

  // ==========================================
  // SERVICES MANAGEMENT (TODO)
  // ==========================================

  app.get(
    "/admin/services",
    { preHandler: [adminAuthMiddleware] },
    async (req, reply) => {
      return reply.send({
        message: "Services list - pending implementation",
      });
    },
  );

  app.post(
    "/admin/services",
    { preHandler: [adminAuthMiddleware] },
    async (req, reply) => {
      return reply.send({
        message: "Create service - pending implementation",
      });
    },
  );

  // ==========================================
  // ADMIN MANAGEMENT (Owner only)
  // ==========================================

  app.get(
    "/admin/admins",
    { preHandler: [adminAuthMiddleware, ownerOnlyMiddleware] },
    async (req, reply) => {
      return reply.send({
        message: "Admin list - pending implementation (owner only)",
      });
    },
  );

  app.post(
    "/admin/admins",
    { preHandler: [adminAuthMiddleware, ownerOnlyMiddleware] },
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
        protected: [
          "GET /admin/me",
          "GET /admin/dashboard",
          "GET /admin/agenda",
          "GET /admin/appointments",
          "PATCH /admin/appointments/:id/status",
          "GET /admin/barbers",
          "POST /admin/barbers",
          "GET /admin/services",
          "POST /admin/services",
        ],
        ownerOnly: ["GET /admin/admins", "POST /admin/admins"],
      },
    };
  });
}
