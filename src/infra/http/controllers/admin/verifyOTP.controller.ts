import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import {
  VerifyAdminOTPUseCase,
  InvalidOTPError,
  OTPExpiredError,
  TooManyAttemptsError,
  IJWTService,
} from "../../../../domain/scheduling/application/use-cases/admin/VerifyAdminOTP.js";
import { PrismaAdminOTPRepository } from "../../../database/prisma/repositories/admin-otp-repository.js";

// Initialize repository
const adminOTPRepository = new PrismaAdminOTPRepository();

/**
 * JWT Service implementation using Fastify JWT
 * This will be injected with the Fastify instance
 */
class FastifyJWTService implements IJWTService {
  constructor(
    private fastify: {
      jwt: { sign: (payload: object, options?: object) => string };
    },
  ) {}

  async signAdminToken(payload: {
    adminId: string;
    role: string;
    barbershopId: string;
  }): Promise<{ token: string; expiresAt: Date }> {
    const expiresInSeconds = 8 * 60 * 60; // 8 hours
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    const token = this.fastify.jwt.sign(
      {
        sub: payload.adminId,
        role: payload.role,
        barbershopId: payload.barbershopId,
        type: "ADMIN",
      },
      { expiresIn: expiresInSeconds },
    );

    return { token, expiresAt };
  }
}

/**
 * POST /admin/auth/verify-otp
 *
 * Verify OTP code and create admin session.
 *
 * Body: { phone: string, code: string }
 * Response: { admin: {...}, token: string, expiresAt: string }
 *
 * The token should be used in Authorization header for subsequent requests:
 * Authorization: Bearer <token>
 */
export async function verifyOTPController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const bodySchema = z.object({
    phone: z.string().min(10).max(15),
    code: z
      .string()
      .length(6, "OTP code must be exactly 6 digits")
      .regex(/^\d+$/, "OTP code must contain only numbers"),
  });

  const validationResult = bodySchema.safeParse(req.body);

  if (!validationResult.success) {
    return reply.status(400).send({
      message: "Validation error",
      errors: validationResult.error.format(),
    });
  }

  try {
    // Create JWT service with Fastify instance
    const jwtService = new FastifyJWTService(req.server);

    const verifyOTPUseCase = new VerifyAdminOTPUseCase(
      adminOTPRepository,
      jwtService,
    );

    const result = await verifyOTPUseCase.execute({
      phone: validationResult.data.phone,
      code: validationResult.data.code,
    });

    // Also set token as HttpOnly cookie for web clients
    reply.setCookie("admin_session", result.token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60, // 8 hours in seconds
    });

    return reply.status(200).send({
      message: "Login successful",
      admin: result.admin,
      token: result.token,
      expiresAt: result.expiresAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof InvalidOTPError) {
      return reply.status(401).send({
        message: "Código inválido. Verifique e tente novamente.",
      });
    }

    if (error instanceof OTPExpiredError) {
      return reply.status(401).send({
        message: "Código expirado. Solicite um novo código.",
      });
    }

    if (error instanceof TooManyAttemptsError) {
      return reply.status(429).send({
        message: "Muitas tentativas incorretas. Solicite um novo código.",
      });
    }

    throw error;
  }
}
