import { IBookingTokenRepository } from "../../repositories/IBookingTokenRepository.js";
import { bookingTokenService } from "../../services/BookingTokenService.js";

export interface ValidateBookingTokenInput {
  plainToken: string;
}

export interface BookingSession {
  barbershopId: string;
  barberId: string | null;
  customerPhone: string;
  tokenId: string;
}

export class TokenExpiredError extends Error {
  constructor() {
    super("Booking link has expired");
    this.name = "TokenExpiredError";
  }
}

export class TokenAlreadyUsedError extends Error {
  constructor() {
    super("Booking link has already been used");
    this.name = "TokenAlreadyUsedError";
  }
}

export class TokenNotFoundError extends Error {
  constructor() {
    super("Invalid booking link");
    this.name = "TokenNotFoundError";
  }
}

export class TokenRateLimitedError extends Error {
  constructor() {
    super("Too many attempts. Please try again later");
    this.name = "TokenRateLimitedError";
  }
}

export class ValidateBookingTokenUseCase {
  constructor(private bookingTokenRepository: IBookingTokenRepository) {}

  async execute(input: ValidateBookingTokenInput): Promise<BookingSession> {
    const { plainToken } = input;

    // Hash the provided token for comparison
    const tokenHash = bookingTokenService.hashToken(plainToken);

    // Find token by hash
    const tokenData = await this.bookingTokenRepository.findByHash(tokenHash);

    // Always increment attempts (even for not found - prevents timing attacks)
    if (tokenData) {
      await this.bookingTokenRepository.incrementValidationAttempts(
        tokenData.id,
      );
    }

    // Validate token state
    const validation = bookingTokenService.validateTokenState(tokenData);

    if (!validation.valid) {
      switch (validation.reason) {
        case "expired":
          throw new TokenExpiredError();
        case "already_used":
          throw new TokenAlreadyUsedError();
        case "rate_limited":
          throw new TokenRateLimitedError();
        case "not_found":
        default:
          throw new TokenNotFoundError();
      }
    }

    // Token is valid - mark as used if single-use
    if (tokenData!.singleUse) {
      await this.bookingTokenRepository.markAsUsed(tokenData!.id);
    }

    // Return session data for JWT creation
    return {
      barbershopId: tokenData!.barbershopId,
      barberId: tokenData!.barberId,
      customerPhone: tokenData!.customerPhone,
      tokenId: tokenData!.id,
    };
  }
}
