import {
  IBarbershopRepository,
  BarbershopData,
  AdminData,
} from "../../repositories/IBarbershopRepository.js";

// Trial period duration in days
const TRIAL_PERIOD_DAYS = 30;

// Error classes
export class SlugAlreadyExistsError extends Error {
  constructor(slug: string) {
    super(`Barbershop with slug "${slug}" already exists`);
    this.name = "SlugAlreadyExistsError";
  }
}

export class PhoneAlreadyExistsError extends Error {
  constructor(phone: string) {
    super(`Barbershop with phone "${phone}" already exists`);
    this.name = "PhoneAlreadyExistsError";
  }
}

export class AdminEmailAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`Admin with email "${email}" already exists`);
    this.name = "AdminEmailAlreadyExistsError";
  }
}

export class AdminPhoneAlreadyExistsError extends Error {
  constructor(phone: string) {
    super(`Admin with phone "${phone}" already exists`);
    this.name = "AdminPhoneAlreadyExistsError";
  }
}

export interface CreateBarbershopInput {
  name: string;
  slug: string;
  phone: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerName: string;
  timezone?: string;
}

export interface CreateBarbershopOutput {
  barbershop: BarbershopData;
  admin: AdminData;
}

export class CreateBarbershopUseCase {
  constructor(private barbershopRepository: IBarbershopRepository) {}

  async execute(input: CreateBarbershopInput): Promise<CreateBarbershopOutput> {
    const { name, slug, phone, ownerEmail, ownerPhone, ownerName, timezone } =
      input;

    // Check if slug already exists
    const slugExists = await this.barbershopRepository.slugExists(slug);
    if (slugExists) {
      throw new SlugAlreadyExistsError(slug);
    }

    // Check if barbershop phone already exists
    const phoneExists = await this.barbershopRepository.phoneExists(phone);
    if (phoneExists) {
      throw new PhoneAlreadyExistsError(phone);
    }

    // Check if admin email already exists
    const adminEmailExists =
      await this.barbershopRepository.adminEmailExists(ownerEmail);
    if (adminEmailExists) {
      throw new AdminEmailAlreadyExistsError(ownerEmail);
    }

    // Check if admin phone already exists
    const adminPhoneExists =
      await this.barbershopRepository.adminPhoneExists(ownerPhone);
    if (adminPhoneExists) {
      throw new AdminPhoneAlreadyExistsError(ownerPhone);
    }

    // Calculate trial period
    const now = new Date();
    const trialEndsAt = new Date(now);
    trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_PERIOD_DAYS);

    // Create barbershop with trial period
    const barbershop = await this.barbershopRepository.create({
      name,
      slug,
      phone,
      timezone,
      trialStartedAt: now,
      trialEndsAt,
    });

    // Create owner admin
    const admin = await this.barbershopRepository.createAdmin({
      email: ownerEmail,
      phone: ownerPhone,
      name: ownerName,
      barbershopId: barbershop.id,
      role: "OWNER",
    });

    return {
      barbershop,
      admin,
    };
  }
}
