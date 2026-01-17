import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["dev", "test", "production"]).default("dev"),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().default("default-secret-change-in-production"),

  // Frontend URL for booking links
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),

  // Twilio WhatsApp Integration (optional for dev)
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_WHATSAPP_NUMBER: z.string().optional(), // Format: whatsapp:+14155238886

  // Stripe Payment Integration (optional for dev)
  STRIPE_SECRET_KEY: z.string().optional(), // sk_test_... or sk_live_...
  STRIPE_WEBHOOK_SECRET: z.string().optional(), // whsec_...
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  throw new Error("Invalid environment variables.");
}

export const env = _env.data;
