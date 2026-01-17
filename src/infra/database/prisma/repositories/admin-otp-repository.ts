import { prisma } from "../client.js";
import { IAdminOTPRepository } from "../../../../domain/scheduling/application/use-cases/admin/RequestAdminOTP.js";
import {
  IVerifyOTPRepository,
  AdminWithOTP,
} from "../../../../domain/scheduling/application/use-cases/admin/VerifyAdminOTP.js";

/**
 * Prisma implementation for Admin OTP repository
 * Implements both request and verify interfaces
 */
export class PrismaAdminOTPRepository
  implements IAdminOTPRepository, IVerifyOTPRepository
{
  // ==========================================
  // IAdminOTPRepository (for RequestAdminOTP)
  // ==========================================

  async findAdminByPhone(phone: string) {
    const admin = await prisma.admin.findUnique({
      where: { phone },
      select: {
        id: true,
        name: true,
        phone: true,
        isActive: true,
        barbershopId: true,
      },
    });

    return admin;
  }

  async countRecentOTPs(adminId: string, since: Date): Promise<number> {
    const count = await prisma.adminOTP.count({
      where: {
        adminId,
        createdAt: { gte: since },
      },
    });

    return count;
  }

  async createOTP(data: {
    adminId: string;
    codeHash: string;
    expiresAt: Date;
  }): Promise<void> {
    await prisma.adminOTP.create({
      data: {
        adminId: data.adminId,
        codeHash: data.codeHash,
        expiresAt: data.expiresAt,
      },
    });
  }

  async invalidatePreviousOTPs(adminId: string): Promise<void> {
    // Mark all unused OTPs as expired by setting usedAt
    await prisma.adminOTP.updateMany({
      where: {
        adminId,
        usedAt: null,
      },
      data: {
        usedAt: new Date(), // Mark as "used" to invalidate
      },
    });
  }

  // ==========================================
  // IVerifyOTPRepository (for VerifyAdminOTP)
  // ==========================================

  async findAdminWithOTP(phone: string): Promise<AdminWithOTP | null> {
    const admin = await prisma.admin.findUnique({
      where: { phone, isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        barbershopId: true,
        barbershop: {
          select: {
            name: true,
          },
        },
        otpCodes: {
          where: {
            usedAt: null,
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            codeHash: true,
            expiresAt: true,
            usedAt: true,
            attempts: true,
          },
        },
      },
    });

    if (!admin) return null;

    return {
      ...admin,
      role: admin.role as "OWNER" | "MANAGER",
    };
  }

  async markOTPAsUsed(otpId: string): Promise<void> {
    await prisma.adminOTP.update({
      where: { id: otpId },
      data: { usedAt: new Date() },
    });
  }

  async incrementOTPAttempts(otpId: string): Promise<void> {
    await prisma.adminOTP.update({
      where: { id: otpId },
      data: {
        attempts: { increment: 1 },
        lastAttemptAt: new Date(),
      },
    });
  }

  async updateLastLogin(adminId: string): Promise<void> {
    await prisma.admin.update({
      where: { id: adminId },
      data: { lastLoginAt: new Date() },
    });
  }

  // ==========================================
  // Cleanup (for maintenance jobs)
  // ==========================================

  async deleteExpiredOTPs(): Promise<number> {
    const result = await prisma.adminOTP.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { usedAt: { not: null } }],
        createdAt: {
          lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Older than 24h
        },
      },
    });

    return result.count;
  }
}
