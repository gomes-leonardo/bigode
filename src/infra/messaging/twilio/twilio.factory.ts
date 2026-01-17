import { env } from "../../env/env.js";
import {
  ITwilioClient,
  MockTwilioClient,
  TwilioClient,
} from "./twilio.service.js";

/**
 * Creates the appropriate Twilio client based on environment configuration
 *
 * - Production with credentials: Real TwilioClient
 * - Development/Test without credentials: MockTwilioClient with console logs
 * - Test environment: MockTwilioClient
 */
export function createTwilioClient(): ITwilioClient {
  const hasCredentials =
    env.TWILIO_ACCOUNT_SID &&
    env.TWILIO_AUTH_TOKEN &&
    env.TWILIO_WHATSAPP_NUMBER;

  // Always use mock in test environment
  if (env.NODE_ENV === "test") {
    return new MockTwilioClient();
  }

  // Use real client if credentials are configured
  if (hasCredentials) {
    console.log("[TWILIO] Using production Twilio client");
    return new TwilioClient({
      accountSid: env.TWILIO_ACCOUNT_SID!,
      authToken: env.TWILIO_AUTH_TOKEN!,
      whatsappNumber: env.TWILIO_WHATSAPP_NUMBER!,
    });
  }

  // Fall back to mock in development without credentials
  console.log(
    "[TWILIO] No credentials configured, using mock client (messages logged to console)",
  );
  return new MockTwilioClient();
}

// Singleton instance
let twilioClientInstance: ITwilioClient | null = null;

/**
 * Get or create the Twilio client singleton
 */
export function getTwilioClient(): ITwilioClient {
  if (!twilioClientInstance) {
    twilioClientInstance = createTwilioClient();
  }
  return twilioClientInstance;
}

/**
 * Reset the singleton (useful for testing)
 */
export function resetTwilioClient(): void {
  twilioClientInstance = null;
}
