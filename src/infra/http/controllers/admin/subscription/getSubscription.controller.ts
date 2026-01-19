import { FastifyReply, FastifyRequest } from "fastify";
import { getAdmin } from "../../../middlewares/admin-auth.js";
import { getSubscriptionInfo } from "../../../middlewares/subscription-guard.js";

/**
 * GET /admin/subscription
 *
 * Get subscription status for the authenticated admin's barbershop.
 * This endpoint does NOT require subscription guard (always accessible).
 *
 * Response: {
 *   subscription: {
 *     status: "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "EXPIRED",
 *     tier: "FREE" | "PREMIUM" | "PRO",
 *     isActive: boolean,
 *     trial: { startedAt, endsAt, daysRemaining } | null,
 *     hasStripeSubscription: boolean
 *   },
 *   actions: {
 *     canUpgrade: boolean,
 *     canManageBilling: boolean,
 *     upgradeUrl: string | null,
 *     billingUrl: string | null
 *   }
 * }
 */
export async function getSubscriptionController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const admin = getAdmin(req);

  const subscriptionInfo = await getSubscriptionInfo(admin.barbershopId);

  if (!subscriptionInfo) {
    return reply.status(404).send({
      message: "Barbershop not found",
      code: "BARBERSHOP_NOT_FOUND",
    });
  }

  // Determine available actions
  const canUpgrade =
    subscriptionInfo.status === "TRIAL" ||
    subscriptionInfo.status === "EXPIRED" ||
    subscriptionInfo.status === "CANCELED";

  const canManageBilling =
    subscriptionInfo.hasStripeSubscription &&
    (subscriptionInfo.status === "ACTIVE" ||
      subscriptionInfo.status === "PAST_DUE");

  return reply.send({
    subscription: {
      status: subscriptionInfo.status,
      tier: subscriptionInfo.tier,
      isActive: subscriptionInfo.isActive,
      trial: subscriptionInfo.trial
        ? {
            startedAt: subscriptionInfo.trial.startedAt?.toISOString() ?? null,
            endsAt: subscriptionInfo.trial.endsAt?.toISOString() ?? null,
            daysRemaining: subscriptionInfo.trial.daysRemaining,
          }
        : null,
      hasStripeSubscription: subscriptionInfo.hasStripeSubscription,
    },
    actions: {
      canUpgrade,
      canManageBilling,
      upgradeUrl: canUpgrade ? "/admin/subscription/upgrade" : null,
      billingUrl: canManageBilling ? "/admin/subscription/billing" : null,
    },
  });
}
