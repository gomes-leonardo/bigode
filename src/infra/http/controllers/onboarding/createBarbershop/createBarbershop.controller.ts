import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import {
  CreateBarbershopUseCase,
  SlugAlreadyExistsError,
  PhoneAlreadyExistsError,
  AdminEmailAlreadyExistsError,
  AdminPhoneAlreadyExistsError,
} from "../../../../../domain/scheduling/application/use-cases/onboarding/CreateBarbershopUseCase.js";
import { PrismaBarbershopRepository } from "../../../../database/prisma/repositories/barbershop-repository.js";

// Initialize dependencies
const barbershopRepository = new PrismaBarbershopRepository();
const createBarbershopUseCase = new CreateBarbershopUseCase(
  barbershopRepository,
);

// Helper function to normalize slug
function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9-]/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * POST /barbershops
 *
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
 *
 * Response: {
 *   barbershop: { id, name, slug, ... },
 *   admin: { id, email, phone, name, role },
 *   trialInfo: { startsAt, endsAt, daysRemaining }
 * }
 */
export async function createBarbershopController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const bodySchema = z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be at most 100 characters"),
    slug: z
      .string()
      .min(2, "Slug must be at least 2 characters")
      .max(50, "Slug must be at most 50 characters")
      .transform(normalizeSlug),
    phone: z
      .string()
      .min(10, "Phone must be at least 10 digits")
      .max(15, "Phone must be at most 15 characters"),
    ownerEmail: z.string().email("Invalid email format"),
    ownerPhone: z
      .string()
      .min(10, "Owner phone must be at least 10 digits")
      .max(15, "Owner phone must be at most 15 characters"),
    ownerName: z
      .string()
      .min(2, "Owner name must be at least 2 characters")
      .max(100, "Owner name must be at most 100 characters"),
  });

  const validationResult = bodySchema.safeParse(req.body);

  if (!validationResult.success) {
    return reply.status(400).send({
      message: "Validation error",
      errors: validationResult.error.format(),
    });
  }

  try {
    const result = await createBarbershopUseCase.execute(validationResult.data);

    // Calculate trial info
    const now = new Date();
    const trialEndsAt = result.barbershop.trialEndsAt!;
    const daysRemaining = Math.ceil(
      (trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    return reply.status(201).send({
      barbershop: {
        id: result.barbershop.id,
        name: result.barbershop.name,
        slug: result.barbershop.slug,
        phone: result.barbershop.phone,
        timezone: result.barbershop.timezone,
        subscriptionStatus: result.barbershop.subscriptionStatus,
        createdAt: result.barbershop.createdAt.toISOString(),
      },
      admin: {
        id: result.admin.id,
        email: result.admin.email,
        phone: result.admin.phone,
        name: result.admin.name,
        role: result.admin.role,
      },
      trialInfo: {
        startsAt: result.barbershop.trialStartedAt!.toISOString(),
        endsAt: trialEndsAt.toISOString(),
        daysRemaining,
      },
    });
  } catch (error) {
    if (error instanceof SlugAlreadyExistsError) {
      return reply.status(409).send({
        message: error.message,
        code: "SLUG_EXISTS",
        field: "slug",
      });
    }

    if (error instanceof PhoneAlreadyExistsError) {
      return reply.status(409).send({
        message: error.message,
        code: "PHONE_EXISTS",
        field: "phone",
      });
    }

    if (error instanceof AdminEmailAlreadyExistsError) {
      return reply.status(409).send({
        message: error.message,
        code: "EMAIL_EXISTS",
        field: "ownerEmail",
      });
    }

    if (error instanceof AdminPhoneAlreadyExistsError) {
      return reply.status(409).send({
        message: error.message,
        code: "OWNER_PHONE_EXISTS",
        field: "ownerPhone",
      });
    }

    throw error;
  }
}
