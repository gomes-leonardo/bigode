import { IBookingTokenRepository } from "../../repositories/IBookingTokenRepository.js";
import { bookingTokenService } from "../../services/BookingTokenService.js";

export interface CreateBookingTokenInput {
  barbershopId: string;
  barberId?: string;
  customerPhone: string;
  expiryMinutes?: number;
}

export interface CreateBookingTokenOutput {
  bookingUrl: string;
  expiresAt: Date;
}

export class CreateBookingTokenUseCase {
  constructor(
    private bookingTokenRepository: IBookingTokenRepository,
    private baseUrl: string = process.env.FRONTEND_URL ||
      "http://localhost:3000",
  ) {}

  async execute(
    input: CreateBookingTokenInput,
  ): Promise<CreateBookingTokenOutput> {
    const { barbershopId, barberId, customerPhone, expiryMinutes } = input;

    // Generate cryptographically secure token
    const { plainToken, tokenHash } = bookingTokenService.generateToken();

    // Calculate expiry
    const expiresAt = bookingTokenService.calculateExpiry(expiryMinutes);

    // Store only the hash in database
    await this.bookingTokenRepository.create({
      tokenHash,
      barbershopId,
      barberId,
      customerPhone,
      expiresAt,
      singleUse: true,
    });

    // Build secure URL with only the opaque token
    // No sensitive data in URL - token is the only identifier
    const bookingUrl = `${this.baseUrl}/booking/${plainToken}`;

    return {
      bookingUrl,
      expiresAt,
    };
  }
}
