import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { env } from "../../env/env.js";
import { SlotOccupiedError } from "../../../domain/scheduling/application/use-cases/schedulling/CreateAppointment.js";

interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  details?: unknown;
}

export function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const fastifyError = error as FastifyError;

  // Slot Occupied Error
  if (error instanceof SlotOccupiedError) {
    const response: ErrorResponse = {
      statusCode: 409,
      error: "Conflict",
      message: "Appointment already exists",
    };
    return reply.status(409).send(response);
  }

  // Zod Validation Errors
  if (error instanceof ZodError) {
    const response: ErrorResponse = {
      statusCode: 400,
      error: "Validation Error",
      message: "Invalid request data",
      details: error.format(),
    };
    return reply.status(400).send(response);
  }

  // Fastify Validation Errors
  if (fastifyError.validation) {
    const response: ErrorResponse = {
      statusCode: 400,
      error: "Validation Error",
      message: "Invalid request data",
      details: fastifyError.validation,
    };
    return reply.status(400).send(response);
  }

  // JWT Errors
  if (
    error.name === "JsonWebTokenError" ||
    error.name === "TokenExpiredError" ||
    fastifyError.code === "FST_JWT_AUTHORIZATION_TOKEN_INVALID" ||
    fastifyError.code === "FST_JWT_BAD_REQUEST"
  ) {
    const response: ErrorResponse = {
      statusCode: 401,
      error: "Unauthorized",
      message: "Invalid or expired token",
    };
    return reply.status(401).send(response);
  }

  // Not Found (404)
  if (
    fastifyError.statusCode === 404 ||
    fastifyError.code === "FST_ERR_NOT_FOUND"
  ) {
    const response: ErrorResponse = {
      statusCode: 404,
      error: "Not Found",
      message: "The requested resource was not found",
    };
    return reply.status(404).send(response);
  }

  // Database/Prisma Errors
  if (fastifyError.code === "P2002") {
    const response: ErrorResponse = {
      statusCode: 409,
      error: "Conflict",
      message: "A record with this information already exists",
    };
    return reply.status(409).send(response);
  }

  if (fastifyError.code?.toString().startsWith("P")) {
    const response: ErrorResponse = {
      statusCode: 500,
      error: "Database Error",
      message: "An error occurred while processing your request",
    };

    if (env.NODE_ENV === "dev") {
      response.details = error.message;
    }

    return reply.status(500).send(response);
  }

  // Use error statusCode if available, otherwise default to 500
  const statusCode = fastifyError.statusCode ?? 500;

  const response: ErrorResponse = {
    statusCode,
    error: error.name ?? "Internal Server Error",
    message: error.message ?? "An unexpected error occurred",
  };

  // Log and add details for 5xx errors in development
  if (statusCode >= 500) {
    if (env.NODE_ENV === "dev") {
      request.log?.error({
        error: {
          message: error.message,
          stack: error.stack,
          code: fastifyError.code,
        },
        url: request.url,
        method: request.method,
      });

      response.details = {
        message: error.message,
        code: fastifyError.code,
        stack: error.stack,
      };
    } else {
      // In production, don't expose internal error details
      response.message = "An internal server error occurred";
    }
  }

  return reply.status(statusCode).send(response);
}
