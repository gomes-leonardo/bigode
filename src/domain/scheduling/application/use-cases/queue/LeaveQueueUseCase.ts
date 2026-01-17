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

interface LeaveQueueInput {
  queueItemId: string;
}

/**
 * LeaveQueueUseCase
 *
 * Allows a customer to leave the queue before being served.
 * Changes the queue item status to CANCELED.
 */
export class LeaveQueueUseCase {
  constructor(private queueRepository: IQueueRepository) {}

  async execute(input: LeaveQueueInput): Promise<QueueItemWithPosition> {
    const { queueItemId } = input;

    // Check if queue item exists
    const queueItem = await this.queueRepository.findQueueItemById(queueItemId);

    if (!queueItem) {
      throw new QueueItemNotFoundError(queueItemId);
    }

    // Update status to CANCELED
    const updatedItem = await this.queueRepository.updateQueueItemStatus(
      queueItemId,
      "CANCELED",
    );

    return updatedItem;
  }
}
