import {
  IBookingTokenRepository,
  CreateBookingTokenInput,
  BookingTokenData,
} from "../../../../domain/scheduling/application/repositories/IBookingTokenRepository.js";
import { prisma } from "../client.js";

export class PrismaBookingTokenRepository implements IBookingTokenRepository {
  async create(input: CreateBookingTokenInput): Promise<BookingTokenData> {
    const token = await prisma.bookingToken.create({
      data: {
        tokenHash: input.tokenHash,
        barbershopId: input.barbershopId,
        barberId: input.barberId ?? null,
        customerPhone: input.customerPhone,
        expiresAt: input.expiresAt,
        singleUse: input.singleUse ?? true,
      },
    });

    return token;
  }

  async findByHash(tokenHash: string): Promise<BookingTokenData | null> {
    const token = await prisma.bookingToken.findUnique({
      where: { tokenHash },
    });

    return token;
  }

  async markAsUsed(id: string): Promise<void> {
    await prisma.bookingToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  async incrementValidationAttempts(id: string): Promise<void> {
    await prisma.bookingToken.update({
      where: { id },
      data: {
        validationAttempts: { increment: 1 },
        lastAttemptAt: new Date(),
      },
    });
  }

  async deleteExpired(): Promise<number> {
    const result = await prisma.bookingToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    return result.count;
  }
}
