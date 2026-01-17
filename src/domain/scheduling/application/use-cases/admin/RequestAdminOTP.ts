import crypto from "crypto";

export interface RequestOTPInput {
  phone: string; // WhatsApp number
}

export interface RequestOTPOutput {
  success: boolean;
  message: string;
  expiresAt: Date;
  // In dev mode, we return the code for testing (NEVER in production)
  devCode?: string;
}

export class AdminNotFoundError extends Error {
  constructor() {
    super("No admin account found with this phone number");
    this.name = "AdminNotFoundError";
  }
}

export class AdminInactiveError extends Error {
  constructor() {
    super("Admin account is inactive");
    this.name = "AdminInactiveError";
  }
}

export class RateLimitExceededError extends Error {
  constructor() {
    super("Too many OTP requests. Please wait before trying again.");
    this.name = "RateLimitExceededError";
  }
}

export interface IAdminOTPRepository {
  findAdminByPhone(phone: string): Promise<{
    id: string;
    name: string;
    phone: string;
    isActive: boolean;
    barbershopId: string;
  } | null>;

  countRecentOTPs(adminId: string, since: Date): Promise<number>;

  createOTP(data: {
    adminId: string;
    codeHash: string;
    expiresAt: Date;
  }): Promise<void>;

  invalidatePreviousOTPs(adminId: string): Promise<void>;
}

export interface INotificationService {
  sendAdminOTP(params: {
    phone: string;
    adminName: string;
    code: string;
    expiresInMinutes: number;
  }): Promise<{ success: boolean }>;
}

/**
 * Request OTP for Admin WhatsApp Authentication
 *
 * Flow:
 * 1. Admin enters their WhatsApp number
 * 2. System generates 6-digit OTP
 * 3. OTP is sent via WhatsApp
 * 4. Only hash is stored in database
 *
 * Security:
 * - 6-digit code (1 million possibilities)
 * - 5 minute expiration
 * - Max 3 OTP requests per 15 minutes
 * - Previous OTPs invalidated on new request
 */
export class RequestAdminOTPUseCase {
  private OTP_EXPIRATION_MINUTES = 5;
  private MAX_REQUESTS_PER_WINDOW = 3;
  private RATE_LIMIT_WINDOW_MINUTES = 15;

  constructor(
    private adminOTPRepository: IAdminOTPRepository,
    private notificationService: INotificationService,
    private isDevelopment: boolean = false,
  ) {}

  async execute(input: RequestOTPInput): Promise<RequestOTPOutput> {
    // Normalize phone number
    const phone = this.normalizePhone(input.phone);

    // Find admin by phone
    const admin = await this.adminOTPRepository.findAdminByPhone(phone);

    if (!admin) {
      throw new AdminNotFoundError();
    }

    if (!admin.isActive) {
      throw new AdminInactiveError();
    }

    // Check rate limit
    const windowStart = new Date();
    windowStart.setMinutes(
      windowStart.getMinutes() - this.RATE_LIMIT_WINDOW_MINUTES,
    );

    const recentRequests = await this.adminOTPRepository.countRecentOTPs(
      admin.id,
      windowStart,
    );

    if (recentRequests >= this.MAX_REQUESTS_PER_WINDOW) {
      throw new RateLimitExceededError();
    }

    // Invalidate previous OTPs
    await this.adminOTPRepository.invalidatePreviousOTPs(admin.id);

    // Generate 6-digit OTP
    const code = this.generateOTP();
    const codeHash = this.hashCode(code);

    // Calculate expiration
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRATION_MINUTES);

    // Store OTP hash
    await this.adminOTPRepository.createOTP({
      adminId: admin.id,
      codeHash,
      expiresAt,
    });

    // Send OTP via WhatsApp
    await this.notificationService.sendAdminOTP({
      phone: admin.phone,
      adminName: admin.name,
      code,
      expiresInMinutes: this.OTP_EXPIRATION_MINUTES,
    });

    const result: RequestOTPOutput = {
      success: true,
      message: `Código enviado para WhatsApp ${this.maskPhone(phone)}`,
      expiresAt,
    };

    // In development, return the code for testing
    if (this.isDevelopment) {
      result.devCode = code;
    }

    return result;
  }

  private generateOTP(): string {
    // Generate cryptographically secure 6-digit code
    const buffer = crypto.randomBytes(4);
    const num = buffer.readUInt32BE(0);
    const code = (num % 900000) + 100000; // Ensures 6 digits (100000-999999)
    return code.toString();
  }

  private hashCode(code: string): string {
    return crypto.createHash("sha256").update(code).digest("hex");
  }

  private normalizePhone(phone: string): string {
    // Remove all non-numeric characters except +
    return phone.replace(/[^\d+]/g, "");
  }

  private maskPhone(phone: string): string {
    // +5511999998888 -> +55119****8888
    if (phone.length < 8) return phone;
    const start = phone.slice(0, 5);
    const end = phone.slice(-4);
    return `${start}****${end}`;
  }
}
