import { randomBytes, createHash } from "crypto";

export interface GenerateTokenResult {
  plainToken: string; // Send this to client (once)
  tokenHash: string; // Store this in database
}

export interface TokenValidationResult {
  valid: boolean;
  reason?: "expired" | "already_used" | "not_found" | "rate_limited";
}

const TOKEN_BYTES = 32; // 256 bits of entropy
const TOKEN_EXPIRY_MINUTES = 15;
const MAX_VALIDATION_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

export class BookingTokenService {
  /**
   * Generates a cryptographically secure, opaque booking token.
   *
   * Security properties:
   * - 32 bytes (256 bits) of cryptographic randomness
   * - URL-safe base64 encoding
   * - Non-decodable (no embedded data)
   * - Only the hash is stored in database
   */
  generateToken(): GenerateTokenResult {
    // Generate 32 bytes of cryptographically secure random data
    const tokenBuffer = randomBytes(TOKEN_BYTES);

    // Encode as URL-safe base64 (no padding, replace +/ with -_)
    const plainToken = tokenBuffer
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    // Hash the token for storage (never store plain token)
    const tokenHash = this.hashToken(plainToken);

    return { plainToken, tokenHash };
  }

  /**
   * Creates SHA-256 hash of a token for secure storage/comparison.
   * Using SHA-256 because:
   * - Fast enough for validation
   * - Secure for this use case (tokens have high entropy)
   * - Deterministic (same input = same hash)
   */
  hashToken(plainToken: string): string {
    return createHash("sha256").update(plainToken).digest("hex");
  }

  /**
   * Calculates token expiration timestamp.
   */
  calculateExpiry(minutes: number = TOKEN_EXPIRY_MINUTES): Date {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + minutes);
    return expiry;
  }

  /**
   * Validates token state without database interaction.
   * Database validation should be done by the repository.
   */
  validateTokenState(
    tokenData: {
      expiresAt: Date;
      usedAt: Date | null;
      singleUse: boolean;
      validationAttempts: number;
      lastAttemptAt: Date | null;
    } | null,
  ): TokenValidationResult {
    // Token not found
    if (!tokenData) {
      return { valid: false, reason: "not_found" };
    }

    // Check rate limiting
    if (tokenData.validationAttempts >= MAX_VALIDATION_ATTEMPTS) {
      const timeSinceLastAttempt = tokenData.lastAttemptAt
        ? Date.now() - tokenData.lastAttemptAt.getTime()
        : Infinity;

      if (timeSinceLastAttempt < RATE_LIMIT_WINDOW_MS) {
        return { valid: false, reason: "rate_limited" };
      }
    }

    // Check expiration
    if (new Date() > tokenData.expiresAt) {
      return { valid: false, reason: "expired" };
    }

    // Check single-use constraint
    if (tokenData.singleUse && tokenData.usedAt !== null) {
      return { valid: false, reason: "already_used" };
    }

    return { valid: true };
  }
}

// Singleton instance for convenience
export const bookingTokenService = new BookingTokenService();
