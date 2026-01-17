import { describe, it, expect } from "vitest";
import { BookingTokenService } from "./BookingTokenService.js";

describe("BookingTokenService", () => {
  const service = new BookingTokenService();

  describe("generateToken", () => {
    it("should generate a token with 43 characters (256 bits base64)", () => {
      const { plainToken } = service.generateToken();
      // 32 bytes = 256 bits, base64 without padding = 43 chars
      expect(plainToken.length).toBe(43);
    });

    it("should generate URL-safe tokens (no +, /, =)", () => {
      // Generate multiple tokens to ensure URL safety
      for (let i = 0; i < 10; i++) {
        const { plainToken } = service.generateToken();
        expect(plainToken).not.toContain("+");
        expect(plainToken).not.toContain("/");
        expect(plainToken).not.toContain("=");
      }
    });

    it("should generate unique tokens", () => {
      const tokens = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const { plainToken } = service.generateToken();
        expect(tokens.has(plainToken)).toBe(false);
        tokens.add(plainToken);
      }
    });

    it("should return both plain token and hash", () => {
      const result = service.generateToken();
      expect(result).toHaveProperty("plainToken");
      expect(result).toHaveProperty("tokenHash");
      expect(result.plainToken).toBeTruthy();
      expect(result.tokenHash).toBeTruthy();
    });

    it("should return a 64-character hex hash (SHA-256)", () => {
      const { tokenHash } = service.generateToken();
      expect(tokenHash.length).toBe(64);
      expect(/^[0-9a-f]+$/.test(tokenHash)).toBe(true);
    });
  });

  describe("hashToken", () => {
    it("should produce consistent hashes for same input", () => {
      const token = "test-token-123";
      const hash1 = service.hashToken(token);
      const hash2 = service.hashToken(token);
      expect(hash1).toBe(hash2);
    });

    it("should produce different hashes for different inputs", () => {
      const hash1 = service.hashToken("token-1");
      const hash2 = service.hashToken("token-2");
      expect(hash1).not.toBe(hash2);
    });

    it("should produce 64-character hex hash", () => {
      const hash = service.hashToken("any-token");
      expect(hash.length).toBe(64);
      expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
    });
  });

  describe("calculateExpiry", () => {
    it("should default to 15 minutes", () => {
      const now = Date.now();
      const expiry = service.calculateExpiry();
      const expectedMinTime = now + 14 * 60 * 1000;
      const expectedMaxTime = now + 16 * 60 * 1000;

      expect(expiry.getTime()).toBeGreaterThan(expectedMinTime);
      expect(expiry.getTime()).toBeLessThan(expectedMaxTime);
    });

    it("should respect custom expiry minutes", () => {
      const now = Date.now();
      const expiry = service.calculateExpiry(30);
      const expectedMinTime = now + 29 * 60 * 1000;
      const expectedMaxTime = now + 31 * 60 * 1000;

      expect(expiry.getTime()).toBeGreaterThan(expectedMinTime);
      expect(expiry.getTime()).toBeLessThan(expectedMaxTime);
    });
  });

  describe("validateTokenState", () => {
    it("should return not_found for null token", () => {
      const result = service.validateTokenState(null);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe("not_found");
    });

    it("should return expired for past expiration", () => {
      const result = service.validateTokenState({
        expiresAt: new Date(Date.now() - 1000),
        usedAt: null,
        singleUse: true,
        validationAttempts: 0,
        lastAttemptAt: null,
      });
      expect(result.valid).toBe(false);
      expect(result.reason).toBe("expired");
    });

    it("should return already_used for used single-use token", () => {
      const result = service.validateTokenState({
        expiresAt: new Date(Date.now() + 60000),
        usedAt: new Date(),
        singleUse: true,
        validationAttempts: 0,
        lastAttemptAt: null,
      });
      expect(result.valid).toBe(false);
      expect(result.reason).toBe("already_used");
    });

    it("should return rate_limited for too many attempts", () => {
      const result = service.validateTokenState({
        expiresAt: new Date(Date.now() + 60000),
        usedAt: null,
        singleUse: true,
        validationAttempts: 5,
        lastAttemptAt: new Date(), // Recent attempt
      });
      expect(result.valid).toBe(false);
      expect(result.reason).toBe("rate_limited");
    });

    it("should allow after rate limit window expires", () => {
      const result = service.validateTokenState({
        expiresAt: new Date(Date.now() + 60000),
        usedAt: null,
        singleUse: true,
        validationAttempts: 5,
        lastAttemptAt: new Date(Date.now() - 120000), // 2 minutes ago
      });
      expect(result.valid).toBe(true);
    });

    it("should return valid for unused, non-expired token", () => {
      const result = service.validateTokenState({
        expiresAt: new Date(Date.now() + 60000),
        usedAt: null,
        singleUse: true,
        validationAttempts: 0,
        lastAttemptAt: null,
      });
      expect(result.valid).toBe(true);
    });

    it("should allow reuse of non-single-use tokens", () => {
      const result = service.validateTokenState({
        expiresAt: new Date(Date.now() + 60000),
        usedAt: new Date(), // Already used
        singleUse: false, // But not single-use
        validationAttempts: 0,
        lastAttemptAt: null,
      });
      expect(result.valid).toBe(true);
    });
  });
});
