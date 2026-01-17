import { QueueStatus, SubscriptionTier } from "@prisma/client";

export interface QueueItemWithPosition {
  id: string;
  customerId: string;
  barbershopId: string;
  preferredBarberId: string | null;
  status: QueueStatus;
  joinedAt: Date;
  position: number;
  estimatedWaitMinutes?: number;
  // Optional customer details (populated when listing queue)
  customerName?: string | null;
  customerPhone?: string;
  preferredBarberName?: string | null;
}

export interface BarbershopQueueSettings {
  id: string;
  isQueueEnabled: boolean;
  subscriptionTier: SubscriptionTier;
}

export interface IQueueRepository {
  findBarbershopById(
    barbershopId: string,
  ): Promise<BarbershopQueueSettings | null>;

  findCustomerById(customerId: string): Promise<{
    id: string;
    name: string | null;
  } | null>;

  findActiveQueueItem(
    customerId: string,
    barbershopId: string,
  ): Promise<QueueItemWithPosition | null>;

  findQueueItemById(id: string): Promise<QueueItemWithPosition | null>;

  countWaitingAhead(barbershopId: string, joinedAt: Date): Promise<number>;

  createQueueItem(data: {
    customerId: string;
    barbershopId: string;
    preferredBarberId?: string;
  }): Promise<QueueItemWithPosition>;

  updateQueueItemStatus(
    id: string,
    status: QueueStatus,
  ): Promise<QueueItemWithPosition>;
}
