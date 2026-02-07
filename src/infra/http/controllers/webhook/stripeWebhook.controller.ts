import { FastifyReply, FastifyRequest } from "fastify";
import Stripe from "stripe";
import { env } from "../../../env/env.js";
import { StripeProvider } from "../../../payment/stripe-provider.js";
import { prisma } from "../../../database/prisma/client.js";
import { SubscriptionTier } from "@prisma/client";

/**
 * Stripe Webhook Controller
 *
 * Handles incoming webhook events from Stripe.
 * Used to sync subscription status with our database.
 *
 * Important: Stripe sends webhooks as raw body, not JSON.
 * We need to access the raw body for signature verification.
 *
 * Events handled:
 * - checkout.session.completed: New subscription created
 * - customer.subscription.updated: Plan changed or status changed
 * - customer.subscription.deleted: Subscription cancelled
 * - invoice.paid: Payment successful
 * - invoice.payment_failed: Payment failed
 */

// Map Stripe price IDs to our subscription tiers
// These should match the prices created in Stripe Dashboard
const PRICE_TO_TIER: Record<string, SubscriptionTier> = {
  // Replace with your actual Stripe Price IDs
  price_premium_monthly: "PREMIUM",
  price_pro_monthly: "PRO",
};

export async function stripeWebhookController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Skip in development without Stripe credentials
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    console.log("[STRIPE WEBHOOK] Skipping - no credentials configured");
    return reply.status(200).send({ received: true, skipped: true });
  }

  try {
    const signature = request.headers["stripe-signature"] as string;

    if (!signature) {
      console.error("[STRIPE WEBHOOK] Missing stripe-signature header");
      return reply.status(400).send({ error: "Missing signature" });
    }

    // Get raw body for signature verification
    // Fastify stores raw body in request.rawBody (configured in app.ts)
    const rawBody = (request as FastifyRequest & { rawBody?: string }).rawBody;

    if (!rawBody) {
      console.error("[STRIPE WEBHOOK] Missing raw body");
      return reply.status(400).send({ error: "Missing body" });
    }

    const stripeProvider = new StripeProvider();
    const event = stripeProvider.validateWebhookSignature(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );

    console.log(`[STRIPE WEBHOOK] Event received: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;

      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`[STRIPE WEBHOOK] Unhandled event type: ${event.type}`);
    }

    return reply.status(200).send({ received: true });
  } catch (error) {
    console.error("[STRIPE WEBHOOK] Error:", error);

    if (error instanceof Error && error.message.includes("signature")) {
      return reply.status(400).send({ error: "Invalid signature" });
    }

    return reply.status(500).send({ error: "Webhook processing failed" });
  }
}

/**
 * Handle checkout.session.completed
 * Called when a customer completes a checkout session
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!customerId || !subscriptionId) {
    console.log(
      "[STRIPE WEBHOOK] Checkout completed but missing customer/subscription",
    );
    return;
  }

  const barbershopId = session.metadata?.barbershopId;

  if (!barbershopId) {
    console.log("[STRIPE WEBHOOK] No barbershopId in metadata");
    return;
  }

  // Link the Stripe customer and subscription to the barbershop
  await prisma.barbershop.update({
    where: { id: barbershopId },
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      subscriptionTier: "PREMIUM", // Default tier for new subscriptions
    },
  });

  console.log(
    `[STRIPE WEBHOOK] Linked subscription to barbershop ${barbershopId}`,
  );
}

/**
 * Handle customer.subscription.updated
 * Called when a subscription is updated (plan change, status change)
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;
  const status = subscription.status;

  const barbershop = await prisma.barbershop.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!barbershop) {
    console.log(
      `[STRIPE WEBHOOK] No barbershop found for subscription ${subscriptionId}`,
    );
    return;
  }

  // Get the price ID from the subscription
  const priceId = subscription.items?.data?.[0]?.price?.id;
  const newTier = priceId ? PRICE_TO_TIER[priceId] : undefined;

  // Update subscription tier based on status
  if (status === "active" && newTier) {
    await prisma.barbershop.update({
      where: { id: barbershop.id },
      data: { subscriptionTier: newTier },
    });
    console.log(`[STRIPE WEBHOOK] Updated ${barbershop.name} to ${newTier}`);
  } else if (status === "past_due" || status === "unpaid") {
    // Keep the tier but log warning
    console.log(`[STRIPE WEBHOOK] Subscription ${subscriptionId} is ${status}`);
  } else if (status === "canceled" || status === "incomplete_expired") {
    await prisma.barbershop.update({
      where: { id: barbershop.id },
      data: { subscriptionTier: "FREE" },
    });
    console.log(`[STRIPE WEBHOOK] Downgraded ${barbershop.name} to FREE`);
  }
}

/**
 * Handle customer.subscription.deleted
 * Called when a subscription is cancelled
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;

  const barbershop = await prisma.barbershop.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!barbershop) {
    console.log(
      `[STRIPE WEBHOOK] No barbershop found for subscription ${subscriptionId}`,
    );
    return;
  }

  await prisma.barbershop.update({
    where: { id: barbershop.id },
    data: {
      subscriptionTier: "FREE",
      stripeSubscriptionId: null,
    },
  });

  console.log(`[STRIPE WEBHOOK] Subscription cancelled for ${barbershop.name}`);
}

/**
 * Extract subscription ID from invoice
 * The structure varies by Stripe API version
 */
function getSubscriptionFromInvoice(invoice: Stripe.Invoice): string | null {
  // Try parent field (newer API versions)
  const parent = invoice.parent as {
    subscription_details?: { subscription?: string };
  } | null;
  if (parent?.subscription_details?.subscription) {
    return parent.subscription_details.subscription;
  }

  // Check billing_reason for subscription-related invoices
  if (invoice.billing_reason?.startsWith("subscription")) {
    // For subscription invoices, the subscription ID is in the line items
    const lineItem = invoice.lines?.data?.[0];
    if (lineItem) {
      // Use metadata or parent reference if available
      const metadata = lineItem.metadata as Record<string, string> | undefined;
      if (metadata?.subscription_id) {
        return metadata.subscription_id;
      }
    }
  }

  return null;
}

/**
 * Handle invoice.paid
 * Called when an invoice is successfully paid
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId = getSubscriptionFromInvoice(invoice);

  if (!subscriptionId) {
    console.log("[STRIPE WEBHOOK] Invoice paid - no subscription associated");
    return;
  }

  console.log(
    `[STRIPE WEBHOOK] Invoice paid for subscription ${subscriptionId}`,
  );
  // Could trigger "thank you" notification to customer here
}

/**
 * Handle invoice.payment_failed
 * Called when a payment fails
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = getSubscriptionFromInvoice(invoice);

  if (!subscriptionId) {
    console.log(
      "[STRIPE WEBHOOK] Invoice payment failed - no subscription associated",
    );
    return;
  }

  const barbershop = await prisma.barbershop.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (barbershop) {
    console.log(`[STRIPE WEBHOOK] Payment failed for ${barbershop.name}`);
    // Could trigger notification to admin here
  }
}
