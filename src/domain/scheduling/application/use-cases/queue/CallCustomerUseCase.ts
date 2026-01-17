import {
  IQueueRepository,
  QueueItemWithPosition,
} from "../../repositories/IQueueRepository.js";

export class QueueItemNotFoundError extends Error {
  constructor(queueItemId: string) {
    super(`Queue item ${queueItemId} not found`);
    this.name = "QueueItemNotFoundError";
  }
}

export class InvalidQueueStatusError extends Error {
  constructor(queueItemId: string, currentStatus: string) {
    super(
      `Cannot call customer for queue item ${queueItemId}. Current status: ${currentStatus}. Expected: WAITING or NOTIFIED`,
    );
    this.name = "InvalidQueueStatusError";
  }
}

interface CallCustomerInput {
  queueItemId: string;
}

/**
 * CallCustomerUseCase
 *
 * Allows a barber/admin to call the next customer in queue.
 * Changes the queue item status to NOTIFIED.
 *
 * Rules:
 * - Queue item must exist
 * - Status must be WAITING or NOTIFIED (idempotent for re-notification)
 */
export class CallCustomerUseCase {
  constructor(private queueRepository: IQueueRepository) {}

  async execute(input: CallCustomerInput): Promise<QueueItemWithPosition> {
    const { queueItemId } = input;

    // Check if queue item exists
    const queueItem = await this.queueRepository.findQueueItemById(queueItemId);

    if (!queueItem) {
      throw new QueueItemNotFoundError(queueItemId);
    }

    // Check if status allows calling (WAITING or NOTIFIED for idempotency)
    if (queueItem.status !== "WAITING" && queueItem.status !== "NOTIFIED") {
      throw new InvalidQueueStatusError(queueItemId, queueItem.status);
    }

    // If already NOTIFIED, return as is (idempotent)
    if (queueItem.status === "NOTIFIED") {
      return queueItem;
    }

    // Update status to NOTIFIED
    const updatedItem = await this.queueRepository.updateQueueItemStatus(
      queueItemId,
      "NOTIFIED",
    );

    return updatedItem;
  }
}
