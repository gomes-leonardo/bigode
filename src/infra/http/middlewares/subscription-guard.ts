import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../database/prisma/client.js";
import { SubscriptionStatus } from "@prisma/client";

/**
 * Subscription Guard Middleware
 *
 * Checks if the barbershop has an active subscription or valid trial.
 * Use after adminAuthMiddleware to protect subscription-required endpoints.
 *
 * Allows access if:
 * - subscriptionStatus is ACTIVE or PAST_DUE
 * - subscriptionStatus is TRIAL and trialEndsAt > now
 *
 * Blocks access if:
 * - subscriptionStatus is EXPIRED or CANCELED
 * - subscriptionStatus is TRIAL but trial has expired
 */
export async function subscriptionGuardMiddleware(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  if (!req.admin) {
    return reply.status(401).send({
      message: "Authentication required",
      code: "UNAUTHORIZED",
    });
  }

  const barbershop = await prisma.barbershop.findUnique({
    where: { id: req.admin.barbershopId },
    select: {
      id: true,
      subscriptionStatus: true,
      trialEndsAt: true,
    },
  });

  if (!barbershop) {
    return reply.status(404).send({
      message: "Barbershop not found",
      code: "BARBERSHOP_NOT_FOUND",
    });
  }

  const { subscriptionStatus, trialEndsAt } = barbershop;
  const now = new Date();

  // Allow active or past_due subscriptions
  if (
    subscriptionStatus === SubscriptionStatus.ACTIVE ||
    subscriptionStatus === SubscriptionStatus.PAST_DUE
  ) {
    return;
  }

  // Check trial status
  if (subscriptionStatus === SubscriptionStatus.TRIAL) {
    if (trialEndsAt && trialEndsAt > now) {
      // Trial is still valid
      return;
    }

    // Trial has expired - update status and block
    await prisma.barbershop.update({
      where: { id: barbershop.id },
      data: { subscriptionStatus: SubscriptionStatus.EXPIRED },
    });

    return reply.status(403).send({
      message: "Subscription inactive",
      code: "SUBSCRIPTION_BLOCKED",
      reason:
        "Your 30-day trial has expired. Please upgrade to continue using the platform.",
      action: {
        type: "UPGRADE_REQUIRED",
        url: "/admin/subscription/upgrade",
      },
    });
  }

  // Expired or canceled subscription
  const reason =
    subscriptionStatus === SubscriptionStatus.CANCELED
      ? "Your subscription has been canceled. Please reactivate to continue using the platform."
      : "Your subscription has expired. Please renew to continue using the platform.";

  return reply.status(403).send({
    message: "Subscription inactive",
    code: "SUBSCRIPTION_BLOCKED",
    reason,
    action: {
      type: "UPGRADE_REQUIRED",
      url: "/admin/subscription/upgrade",
    },
  });
}

/**
 * Get subscription info for a barbershop
 */
export async function getSubscriptionInfo(barbershopId: string) {
  const barbershop = await prisma.barbershop.findUnique({
    where: { id: barbershopId },
    select: {
      subscriptionStatus: true,
      subscriptionTier: true,
      trialStartedAt: true,
      trialEndsAt: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
    },
  });

  if (!barbershop) {
    return null;
  }

  const now = new Date();
  let isActive = false;
  let daysRemaining: number | null = null;

  if (
    barbershop.subscriptionStatus === SubscriptionStatus.ACTIVE ||
    barbershop.subscriptionStatus === SubscriptionStatus.PAST_DUE
  ) {
    isActive = true;
  } else if (barbershop.subscriptionStatus === SubscriptionStatus.TRIAL) {
    if (barbershop.trialEndsAt && barbershop.trialEndsAt > now) {
      isActive = true;
      daysRemaining = Math.ceil(
        (barbershop.trialEndsAt.getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24),
      );
    }
  }

  return {
    status: barbershop.subscriptionStatus,
    tier: barbershop.subscriptionTier,
    isActive,
    trial: barbershop.trialStartedAt
      ? {
          startedAt: barbershop.trialStartedAt,
          endsAt: barbershop.trialEndsAt,
          daysRemaining,
        }
      : null,
    hasStripeSubscription: !!barbershop.stripeSubscriptionId,
  };
}
