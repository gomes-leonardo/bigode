import crypto from "crypto";

export interface VerifyOTPInput {
  phone: string;
  code: string;
}

export interface VerifyOTPOutput {
  admin: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: "OWNER" | "MANAGER";
    barbershopId: string;
    barbershopName: string;
  };
  token: string;
  expiresAt: Date;
}

export class InvalidOTPError extends Error {
  constructor() {
    super("Invalid or expired OTP code");
    this.name = "InvalidOTPError";
  }
}

export class OTPExpiredError extends Error {
  constructor() {
    super("OTP code has expired. Please request a new one.");
    this.name = "OTPExpiredError";
  }
}

export class TooManyAttemptsError extends Error {
  constructor() {
    super("Too many invalid attempts. Please request a new code.");
    this.name = "TooManyAttemptsError";
  }
}

export interface AdminWithOTP {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "OWNER" | "MANAGER";
  barbershopId: string;
  barbershop: {
    name: string;
  };
  otpCodes: {
    id: string;
    codeHash: string;
    expiresAt: Date;
    usedAt: Date | null;
    attempts: number;
  }[];
}

export interface IVerifyOTPRepository {
  findAdminWithOTP(phone: string): Promise<AdminWithOTP | null>;

  markOTPAsUsed(otpId: string): Promise<void>;

  incrementOTPAttempts(otpId: string): Promise<void>;

  updateLastLogin(adminId: string): Promise<void>;
}

export interface IJWTService {
  signAdminToken(payload: {
    adminId: string;
    role: string;
    barbershopId: string;
  }): Promise<{ token: string; expiresAt: Date }>;
}

/**
 * Verify OTP and create admin session
 *
 * Security:
 * - Max 5 attempts per OTP
 * - Timing-safe comparison
 * - OTP marked as used after success
 * - JWT token for subsequent requests
 */
export class VerifyAdminOTPUseCase {
  private MAX_ATTEMPTS = 5;
  private TOKEN_EXPIRATION_HOURS = 8; // 8-hour session

  constructor(
    private verifyOTPRepository: IVerifyOTPRepository,
    private jwtService: IJWTService,
  ) {}

  async execute(input: VerifyOTPInput): Promise<VerifyOTPOutput> {
    const phone = this.normalizePhone(input.phone);
    const code = input.code.trim();

    // Find admin with their OTPs
    const admin = await this.verifyOTPRepository.findAdminWithOTP(phone);

    if (!admin) {
      throw new InvalidOTPError();
    }

    // Find valid (unused, unexpired) OTP
    const validOTP = admin.otpCodes.find(
      (otp) => !otp.usedAt && otp.expiresAt > new Date(),
    );

    if (!validOTP) {
      throw new OTPExpiredError();
    }

    // Check attempts
    if (validOTP.attempts >= this.MAX_ATTEMPTS) {
      throw new TooManyAttemptsError();
    }

    // Verify code using timing-safe comparison
    const inputHash = crypto.createHash("sha256").update(code).digest("hex");

    const isValid = crypto.timingSafeEqual(
      Buffer.from(inputHash),
      Buffer.from(validOTP.codeHash),
    );

    if (!isValid) {
      // Increment attempts
      await this.verifyOTPRepository.incrementOTPAttempts(validOTP.id);
      throw new InvalidOTPError();
    }

    // Mark OTP as used
    await this.verifyOTPRepository.markOTPAsUsed(validOTP.id);

    // Update last login
    await this.verifyOTPRepository.updateLastLogin(admin.id);

    // Generate JWT token
    const { token, expiresAt } = await this.jwtService.signAdminToken({
      adminId: admin.id,
      role: admin.role,
      barbershopId: admin.barbershopId,
    });

    return {
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        barbershopId: admin.barbershopId,
        barbershopName: admin.barbershop.name,
      },
      token,
      expiresAt,
    };
  }

  private normalizePhone(phone: string): string {
    return phone.replace(/[^\d+]/g, "");
  }
}
