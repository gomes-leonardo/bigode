import crypto from "crypto";

export interface AdminCredentials {
  email: string;
  password: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  barbershopId: string;
  role: "OWNER" | "MANAGER";
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid email or password");
    this.name = "InvalidCredentialsError";
  }
}

export interface IAdminRepository {
  findByEmail(email: string): Promise<{
    id: string;
    email: string;
    name: string;
    passwordHash: string;
    barbershopId: string;
    role: "OWNER" | "MANAGER";
  } | null>;
}

export class AdminLoginUseCase {
  constructor(private adminRepository: IAdminRepository) {}

  async execute(credentials: AdminCredentials): Promise<AdminUser> {
    const admin = await this.adminRepository.findByEmail(credentials.email);

    if (!admin) {
      throw new InvalidCredentialsError();
    }

    // Verify password using secure comparison
    const inputHash = crypto
      .createHash("sha256")
      .update(credentials.password)
      .digest("hex");

    const isValidPassword = crypto.timingSafeEqual(
      Buffer.from(inputHash),
      Buffer.from(admin.passwordHash),
    );

    if (!isValidPassword) {
      throw new InvalidCredentialsError();
    }

    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      barbershopId: admin.barbershopId,
      role: admin.role,
    };
  }
}
