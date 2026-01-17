import Stripe from "stripe";
import { env } from "../env/env.js";

export interface CreateCustomerParams {
  email: string;
  name: string;
  metadata?: Record<string, string>;
}

export interface CreateCustomerResult {
  customerId: string;
}

export interface IPaymentProvider {
  createCustomer(params: CreateCustomerParams): Promise<CreateCustomerResult>;
}

/**
 * Stripe Payment Provider
 *
 * Handles integration with Stripe for subscription management.
 * Currently supports:
 * - Customer creation (for linking barbershops to Stripe customers)
 *
 * Future features:
 * - Subscription management
 * - Checkout session creation
 * - Webhook handling for subscription events
 */
export class StripeProvider implements IPaymentProvider {
  private stripe: Stripe;

  constructor(apiKey?: string) {
    const key = apiKey ?? env.STRIPE_SECRET_KEY;

    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY is required. Set it in environment variables.",
      );
    }

    this.stripe = new Stripe(key, {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    });
  }

  /**
   * Create a Stripe customer
   *
   * Used when a new barbershop registers on the SaaS platform.
   * The returned customerId should be stored in the Barbershop.stripeCustomerId field.
   */
  async createCustomer(
    params: CreateCustomerParams,
  ): Promise<CreateCustomerResult> {
    const customer = await this.stripe.customers.create({
      email: params.email,
      name: params.name,
      metadata: params.metadata,
    });

    return {
      customerId: customer.id,
    };
  }

  /**
   * Validate webhook signature
   *
   * Used to verify that incoming webhooks are from Stripe.
   */
  validateWebhookSignature(
    payload: string | Buffer,
    signature: string,
    webhookSecret?: string,
  ): Stripe.Event {
    const secret = webhookSecret ?? env.STRIPE_WEBHOOK_SECRET;

    if (!secret) {
      throw new Error(
        "STRIPE_WEBHOOK_SECRET is required for webhook validation.",
      );
    }

    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }

  /**
   * Get the underlying Stripe instance for advanced operations
   */
  getStripeInstance(): Stripe {
    return this.stripe;
  }
}

/**
 * Mock Stripe Provider for testing
 *
 * Stores created customers in memory for verification in tests.
 */
export class MockStripeProvider implements IPaymentProvider {
  public createdCustomers: CreateCustomerParams[] = [];
  private customerCounter = 0;

  async createCustomer(
    params: CreateCustomerParams,
  ): Promise<CreateCustomerResult> {
    this.createdCustomers.push(params);
    this.customerCounter++;

    return {
      customerId: `cus_mock_${this.customerCounter}`,
    };
  }

  clearCustomers(): void {
    this.createdCustomers = [];
    this.customerCounter = 0;
  }
}

/**
 * Factory function to create the appropriate payment provider
 *
 * - Production/Development with credentials: Real StripeProvider
 * - Test environment: MockStripeProvider
 * - Development without credentials: MockStripeProvider
 */
export function createPaymentProvider(): IPaymentProvider {
  if (env.NODE_ENV === "test") {
    return new MockStripeProvider();
  }

  if (env.STRIPE_SECRET_KEY) {
    console.log("[STRIPE] Using production Stripe provider");
    return new StripeProvider();
  }

  console.log(
    "[STRIPE] No credentials configured, using mock provider (customers logged to memory)",
  );
  return new MockStripeProvider();
}

// Singleton instance
let stripeProviderInstance: IPaymentProvider | null = null;

/**
 * Get or create the payment provider singleton
 */
export function getPaymentProvider(): IPaymentProvider {
  if (!stripeProviderInstance) {
    stripeProviderInstance = createPaymentProvider();
  }
  return stripeProviderInstance;
}

/**
 * Reset the singleton (useful for testing)
 */
export function resetPaymentProvider(): void {
  stripeProviderInstance = null;
}
