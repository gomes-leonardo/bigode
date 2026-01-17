import { QueueStatus } from "@prisma/client";
import {
  IQueueRepository,
  QueueItemWithPosition,
  BarbershopQueueSettings,
} from "../../../../domain/scheduling/application/repositories/IQueueRepository.js";
import { prisma } from "../client.js";

export class PrismaQueueRepository implements IQueueRepository {
  async findBarbershopById(
    barbershopId: string,
  ): Promise<BarbershopQueueSettings | null> {
    const barbershop = await prisma.barbershop.findUnique({
      where: { id: barbershopId },
      select: {
        id: true,
        isQueueEnabled: true,
        subscriptionTier: true,
      },
    });

    return barbershop;
  }

  async findCustomerById(
    customerId: string,
  ): Promise<{ id: string; name: string | null } | null> {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        name: true,
      },
    });

    return customer;
  }

  async findActiveQueueItem(
    customerId: string,
    barbershopId: string,
  ): Promise<QueueItemWithPosition | null> {
    const item = await prisma.queueItem.findFirst({
      where: {
        customerId,
        barbershopId,
        status: "WAITING",
      },
      select: {
        id: true,
        customerId: true,
        barbershopId: true,
        preferredBarberId: true,
        status: true,
        joinedAt: true,
      },
    });

    if (!item) return null;

    const position = await this.calculatePosition(barbershopId, item.joinedAt);

    return {
      ...item,
      position,
    };
  }

  async findQueueItemById(id: string): Promise<QueueItemWithPosition | null> {
    const item = await prisma.queueItem.findUnique({
      where: { id },
      select: {
        id: true,
        customerId: true,
        barbershopId: true,
        preferredBarberId: true,
        status: true,
        joinedAt: true,
      },
    });

    if (!item) return null;

    const position = await this.calculatePosition(
      item.barbershopId,
      item.joinedAt,
    );

    return {
      ...item,
      position,
    };
  }

  async countWaitingAhead(
    barbershopId: string,
    joinedAt: Date,
  ): Promise<number> {
    const count = await prisma.queueItem.count({
      where: {
        barbershopId,
        status: "WAITING",
        joinedAt: { lt: joinedAt },
      },
    });

    return count;
  }

  async createQueueItem(data: {
    customerId: string;
    barbershopId: string;
    preferredBarberId?: string;
  }): Promise<QueueItemWithPosition> {
    const item = await prisma.queueItem.create({
      data: {
        customerId: data.customerId,
        barbershopId: data.barbershopId,
        preferredBarberId: data.preferredBarberId,
        status: "WAITING",
      },
      select: {
        id: true,
        customerId: true,
        barbershopId: true,
        preferredBarberId: true,
        status: true,
        joinedAt: true,
      },
    });

    const position = await this.calculatePosition(
      item.barbershopId,
      item.joinedAt,
    );

    return {
      ...item,
      position,
    };
  }

  async updateQueueItemStatus(
    id: string,
    status: QueueStatus,
  ): Promise<QueueItemWithPosition> {
    const item = await prisma.queueItem.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        customerId: true,
        barbershopId: true,
        preferredBarberId: true,
        status: true,
        joinedAt: true,
      },
    });

    const position = await this.calculatePosition(
      item.barbershopId,
      item.joinedAt,
    );

    return {
      ...item,
      position,
    };
  }

  /**
   * Get all waiting items for a barbershop, ordered by join time
   */
  async findWaitingByBarbershop(
    barbershopId: string,
  ): Promise<QueueItemWithPosition[]> {
    const items = await prisma.queueItem.findMany({
      where: {
        barbershopId,
        status: { in: ["WAITING", "NOTIFIED"] },
      },
      select: {
        id: true,
        customerId: true,
        barbershopId: true,
        preferredBarberId: true,
        status: true,
        joinedAt: true,
        customer: {
          select: {
            name: true,
            phone: true,
          },
        },
        preferredBarber: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    });

    return items.map((item, index) => ({
      id: item.id,
      customerId: item.customerId,
      barbershopId: item.barbershopId,
      preferredBarberId: item.preferredBarberId,
      status: item.status,
      joinedAt: item.joinedAt,
      position: index + 1,
      customerName: item.customer.name,
      customerPhone: item.customer.phone,
      preferredBarberName: item.preferredBarber?.name,
    }));
  }

  private async calculatePosition(
    barbershopId: string,
    joinedAt: Date,
  ): Promise<number> {
    const aheadCount = await this.countWaitingAhead(barbershopId, joinedAt);
    return aheadCount + 1;
  }
}
