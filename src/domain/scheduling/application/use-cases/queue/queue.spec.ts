import { describe, it, expect, beforeEach } from "vitest";
import {
  JoinQueueUseCase,
  QueueDisabledError,
  AlreadyInQueueError,
  CustomerNotFoundError,
} from "./JoinQueueUseCase.js";
import {
  LeaveQueueUseCase,
  QueueItemNotFoundError,
} from "./LeaveQueueUseCase.js";
import {
  CallCustomerUseCase,
  InvalidQueueStatusError,
  QueueItemNotFoundError as CallQueueItemNotFoundError,
} from "./CallCustomerUseCase.js";
import {
  IQueueRepository,
  QueueItemWithPosition,
} from "../../repositories/IQueueRepository.js";
import { QueueStatus, SubscriptionTier } from "@prisma/client";

// In-memory repository for unit tests
class InMemoryQueueRepository implements IQueueRepository {
  private queueItems: Map<
    string,
    QueueItemWithPosition & { sequence: number }
  > = new Map();
  private barbershops: Map<
    string,
    {
      id: string;
      isQueueEnabled: boolean;
      subscriptionTier: SubscriptionTier;
    }
  > = new Map();
  private customers: Map<string, { id: string; name: string | null }> =
    new Map();
  private sequenceCounter = 0;

  addBarbershop(barbershop: {
    id: string;
    isQueueEnabled: boolean;
    subscriptionTier: SubscriptionTier;
  }): void {
    this.barbershops.set(barbershop.id, barbershop);
  }

  addCustomer(customer: { id: string; name: string | null }): void {
    this.customers.set(customer.id, customer);
  }

  addQueueItem(item: Omit<QueueItemWithPosition, "position">): void {
    this.sequenceCounter++;
    this.queueItems.set(item.id, {
      ...item,
      position: this.sequenceCounter,
      sequence: this.sequenceCounter,
    });
  }

  async findBarbershopById(barbershopId: string): Promise<{
    id: string;
    isQueueEnabled: boolean;
    subscriptionTier: SubscriptionTier;
  } | null> {
    return this.barbershops.get(barbershopId) ?? null;
  }

  async findCustomerById(customerId: string): Promise<{
    id: string;
    name: string | null;
  } | null> {
    return this.customers.get(customerId) ?? null;
  }

  async findActiveQueueItem(
    customerId: string,
    barbershopId: string,
  ): Promise<QueueItemWithPosition | null> {
    for (const item of this.queueItems.values()) {
      if (
        item.customerId === customerId &&
        item.barbershopId === barbershopId &&
        item.status === "WAITING"
      ) {
        return item;
      }
    }
    return null;
  }

  async findQueueItemById(id: string): Promise<QueueItemWithPosition | null> {
    return this.queueItems.get(id) ?? null;
  }

  async countWaitingAhead(
    barbershopId: string,
    joinedAt: Date,
  ): Promise<number> {
    // Find the item that was just created (the one with this joinedAt)
    let currentSequence = 0;
    for (const item of this.queueItems.values()) {
      if (item.joinedAt === joinedAt) {
        currentSequence = item.sequence;
        break;
      }
    }

    let count = 0;
    for (const item of this.queueItems.values()) {
      if (
        item.barbershopId === barbershopId &&
        item.status === "WAITING" &&
        item.sequence < currentSequence
      ) {
        count++;
      }
    }
    return count;
  }

  async createQueueItem(data: {
    customerId: string;
    barbershopId: string;
    preferredBarberId?: string;
  }): Promise<QueueItemWithPosition> {
    const id = `queue-${Date.now()}-${Math.random()}`;
    const joinedAt = new Date();
    this.sequenceCounter++;

    const item: QueueItemWithPosition & { sequence: number } = {
      id,
      customerId: data.customerId,
      barbershopId: data.barbershopId,
      preferredBarberId: data.preferredBarberId ?? null,
      status: "WAITING",
      joinedAt,
      position: this.sequenceCounter,
      sequence: this.sequenceCounter,
    };

    this.queueItems.set(id, item);
    return item;
  }

  async updateQueueItemStatus(
    id: string,
    status: QueueStatus,
  ): Promise<QueueItemWithPosition> {
    const item = this.queueItems.get(id);
    if (!item) throw new Error("Queue item not found");
    item.status = status;
    return item;
  }
}

describe("Queue Use Cases", () => {
  let repository: InMemoryQueueRepository;
  let joinQueueUseCase: JoinQueueUseCase;
  let leaveQueueUseCase: LeaveQueueUseCase;
  let callCustomerUseCase: CallCustomerUseCase;

  const TEST_BARBERSHOP_ID = "barbershop-001";
  const TEST_CUSTOMER_ID = "customer-001";
  const OTHER_CUSTOMER_ID = "customer-002";

  beforeEach(() => {
    repository = new InMemoryQueueRepository();
    joinQueueUseCase = new JoinQueueUseCase(repository);
    leaveQueueUseCase = new LeaveQueueUseCase(repository);
    callCustomerUseCase = new CallCustomerUseCase(repository);

    // Setup: Add a barbershop with queue enabled
    repository.addBarbershop({
      id: TEST_BARBERSHOP_ID,
      isQueueEnabled: true,
      subscriptionTier: "PREMIUM",
    });

    // Setup: Add customers
    repository.addCustomer({ id: TEST_CUSTOMER_ID, name: "John Doe" });
    repository.addCustomer({ id: OTHER_CUSTOMER_ID, name: "Jane Smith" });
  });

  describe("JoinQueueUseCase", () => {
    it("should join queue successfully when queue is enabled", async () => {
      const result = await joinQueueUseCase.execute({
        customerId: TEST_CUSTOMER_ID,
        barbershopId: TEST_BARBERSHOP_ID,
      });

      expect(result.id).toBeDefined();
      expect(result.status).toBe("WAITING");
      expect(result.position).toBe(1);
      expect(result.customerId).toBe(TEST_CUSTOMER_ID);
      expect(result.barbershopId).toBe(TEST_BARBERSHOP_ID);
    });

    it("should throw QueueDisabledError when queue is disabled", async () => {
      repository.addBarbershop({
        id: "disabled-shop",
        isQueueEnabled: false,
        subscriptionTier: "PREMIUM",
      });

      await expect(
        joinQueueUseCase.execute({
          customerId: TEST_CUSTOMER_ID,
          barbershopId: "disabled-shop",
        }),
      ).rejects.toThrow(QueueDisabledError);
    });

    it("should throw AlreadyInQueueError when customer is already waiting", async () => {
      // First join
      await joinQueueUseCase.execute({
        customerId: TEST_CUSTOMER_ID,
        barbershopId: TEST_BARBERSHOP_ID,
      });

      // Try to join again
      await expect(
        joinQueueUseCase.execute({
          customerId: TEST_CUSTOMER_ID,
          barbershopId: TEST_BARBERSHOP_ID,
        }),
      ).rejects.toThrow(AlreadyInQueueError);
    });

    it("should throw CustomerNotFoundError when customer does not exist", async () => {
      await expect(
        joinQueueUseCase.execute({
          customerId: "non-existent",
          barbershopId: TEST_BARBERSHOP_ID,
        }),
      ).rejects.toThrow(CustomerNotFoundError);
    });

    it("should calculate position correctly with multiple customers", async () => {
      // Customer 1 joins
      const result1 = await joinQueueUseCase.execute({
        customerId: TEST_CUSTOMER_ID,
        barbershopId: TEST_BARBERSHOP_ID,
      });

      // Customer 2 joins
      const result2 = await joinQueueUseCase.execute({
        customerId: OTHER_CUSTOMER_ID,
        barbershopId: TEST_BARBERSHOP_ID,
      });

      expect(result1.position).toBe(1);
      expect(result2.position).toBe(2);
    });

    it("should allow joining with preferred barber", async () => {
      const preferredBarberId = "barber-001";

      const result = await joinQueueUseCase.execute({
        customerId: TEST_CUSTOMER_ID,
        barbershopId: TEST_BARBERSHOP_ID,
        preferredBarberId,
      });

      expect(result.preferredBarberId).toBe(preferredBarberId);
    });

    it("should allow customer to join different barbershop queues", async () => {
      repository.addBarbershop({
        id: "another-shop",
        isQueueEnabled: true,
        subscriptionTier: "PRO",
      });

      const result1 = await joinQueueUseCase.execute({
        customerId: TEST_CUSTOMER_ID,
        barbershopId: TEST_BARBERSHOP_ID,
      });

      const result2 = await joinQueueUseCase.execute({
        customerId: TEST_CUSTOMER_ID,
        barbershopId: "another-shop",
      });

      expect(result1.barbershopId).toBe(TEST_BARBERSHOP_ID);
      expect(result2.barbershopId).toBe("another-shop");
    });
  });

  describe("LeaveQueueUseCase", () => {
    it("should leave queue successfully", async () => {
      // First join
      const joinResult = await joinQueueUseCase.execute({
        customerId: TEST_CUSTOMER_ID,
        barbershopId: TEST_BARBERSHOP_ID,
      });

      // Then leave
      const result = await leaveQueueUseCase.execute({
        queueItemId: joinResult.id,
      });

      expect(result.status).toBe("CANCELED");
    });

    it("should throw QueueItemNotFoundError when item does not exist", async () => {
      await expect(
        leaveQueueUseCase.execute({
          queueItemId: "non-existent",
        }),
      ).rejects.toThrow(QueueItemNotFoundError);
    });
  });

  describe("CallCustomerUseCase", () => {
    it("should change status to NOTIFIED when customer is WAITING", async () => {
      // First join
      const joinResult = await joinQueueUseCase.execute({
        customerId: TEST_CUSTOMER_ID,
        barbershopId: TEST_BARBERSHOP_ID,
      });

      // Then call
      const result = await callCustomerUseCase.execute({
        queueItemId: joinResult.id,
      });

      expect(result.status).toBe("NOTIFIED");
    });

    it("should throw QueueItemNotFoundError when item does not exist", async () => {
      await expect(
        callCustomerUseCase.execute({
          queueItemId: "non-existent",
        }),
      ).rejects.toThrow(CallQueueItemNotFoundError);
    });

    it("should throw InvalidQueueStatusError when status is not WAITING", async () => {
      // First join
      const joinResult = await joinQueueUseCase.execute({
        customerId: TEST_CUSTOMER_ID,
        barbershopId: TEST_BARBERSHOP_ID,
      });

      // Cancel the queue item
      await leaveQueueUseCase.execute({ queueItemId: joinResult.id });

      // Try to call canceled item
      await expect(
        callCustomerUseCase.execute({
          queueItemId: joinResult.id,
        }),
      ).rejects.toThrow(InvalidQueueStatusError);
    });

    it("should allow calling customer multiple times (idempotent for NOTIFIED)", async () => {
      // First join
      const joinResult = await joinQueueUseCase.execute({
        customerId: TEST_CUSTOMER_ID,
        barbershopId: TEST_BARBERSHOP_ID,
      });

      // Call once
      await callCustomerUseCase.execute({ queueItemId: joinResult.id });

      // Call again - should work since status is already NOTIFIED (idempotent)
      const result = await callCustomerUseCase.execute({
        queueItemId: joinResult.id,
      });

      expect(result.status).toBe("NOTIFIED");
    });
  });

  describe("Queue position estimation", () => {
    it("should return estimated wait time based on position", async () => {
      // Add 3 customers to queue
      repository.addCustomer({ id: "customer-003", name: "Alice" });

      await joinQueueUseCase.execute({
        customerId: TEST_CUSTOMER_ID,
        barbershopId: TEST_BARBERSHOP_ID,
      });

      await joinQueueUseCase.execute({
        customerId: OTHER_CUSTOMER_ID,
        barbershopId: TEST_BARBERSHOP_ID,
      });

      const result = await joinQueueUseCase.execute({
        customerId: "customer-003",
        barbershopId: TEST_BARBERSHOP_ID,
      });

      // Position 3, assuming ~15 min per customer = 30 min wait
      expect(result.position).toBe(3);
      expect(result.estimatedWaitMinutes).toBeGreaterThan(0);
    });
  });
});
