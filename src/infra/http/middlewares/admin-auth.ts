import { FastifyReply, FastifyRequest } from "fastify";

/**
 * Admin JWT payload structure
 */
export interface AdminJWTPayload {
  sub: string; // adminId
  role: "OWNER" | "MANAGER";
  barbershopId: string;
  type: "ADMIN";
  iat: number;
  exp: number;
}

/**
 * Extend FastifyRequest to include admin info
 */
declare module "fastify" {
  interface FastifyRequest {
    admin?: {
      id: string;
      role: "OWNER" | "MANAGER";
      barbershopId: string;
    };
  }
}

/**
 * Admin Authentication Middleware
 *
 * Verifies JWT token from:
 * 1. Authorization header: Bearer <token>
 * 2. Cookie: admin_session
 *
 * Adds admin info to request object for use in controllers.
 */
export async function adminAuthMiddleware(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    // Try to get token from cookie first, then header
    let token = req.cookies.admin_session;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.slice(7);
      }
    }

    if (!token) {
      return reply.status(401).send({
        message: "Authentication required",
        code: "UNAUTHORIZED",
      });
    }

    // Verify token
    const decoded = req.server.jwt.verify<AdminJWTPayload>(token);

    // Check if it's an admin token
    if (decoded.type !== "ADMIN") {
      return reply.status(403).send({
        message: "Admin access required",
        code: "FORBIDDEN",
      });
    }

    // Attach admin info to request
    req.admin = {
      id: decoded.sub,
      role: decoded.role,
      barbershopId: decoded.barbershopId,
    };
  } catch {
    return reply.status(401).send({
      message: "Invalid or expired token",
      code: "INVALID_TOKEN",
    });
  }
}

/**
 * Owner Only Middleware
 *
 * Use after adminAuthMiddleware to restrict access to OWNER role only.
 * For operations like managing other admins.
 */
export async function ownerOnlyMiddleware(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  if (!req.admin) {
    return reply.status(401).send({
      message: "Authentication required",
      code: "UNAUTHORIZED",
    });
  }

  if (req.admin.role !== "OWNER") {
    return reply.status(403).send({
      message: "Owner access required for this operation",
      code: "OWNER_ONLY",
    });
  }
}

/**
 * Helper to get admin from request (with type safety)
 */
export function getAdmin(req: FastifyRequest) {
  if (!req.admin) {
    throw new Error("Admin not authenticated - use adminAuthMiddleware first");
  }
  return req.admin;
}
