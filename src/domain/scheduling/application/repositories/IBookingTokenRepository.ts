export interface CreateBookingTokenInput {
  tokenHash: string;
  barbershopId: string;
  barberId?: string;
  customerPhone: string;
  expiresAt: Date;
  singleUse?: boolean;
}

export interface BookingTokenData {
  id: string;
  tokenHash: string;
  barbershopId: string;
  barberId: string | null;
  customerPhone: string;
  expiresAt: Date;
  usedAt: Date | null;
  singleUse: boolean;
  validationAttempts: number;
  lastAttemptAt: Date | null;
  createdAt: Date;
}

export interface IBookingTokenRepository {
  /**
   * Creates a new booking token record.
   */
  create(input: CreateBookingTokenInput): Promise<BookingTokenData>;

  /**
   * Finds a token by its hash.
   * Returns null if not found.
   */
  findByHash(tokenHash: string): Promise<BookingTokenData | null>;

  /**
   * Marks a token as used (sets usedAt timestamp).
   */
  markAsUsed(id: string): Promise<void>;

  /**
   * Increments validation attempt counter for rate limiting.
   */
  incrementValidationAttempts(id: string): Promise<void>;

  /**
   * Deletes expired tokens (cleanup job).
   */
  deleteExpired(): Promise<number>;
}
