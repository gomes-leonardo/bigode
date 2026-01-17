import {
  IQueueRepository,
  QueueItemWithPosition,
} from "../../repositories/IQueueRepository.js";

export class QueueDisabledError extends Error {
  constructor(barbershopId: string) {
    super(`Queue is not enabled for barbershop ${barbershopId}`);
    this.name = "QueueDisabledError";
  }
}

export class AlreadyInQueueError extends Error {
  constructor(customerId: string, barbershopId: string) {
    super(
      `Customer ${customerId} is already in the queue for barbershop ${barbershopId}`,
    );
    this.name = "AlreadyInQueueError";
  }
}

export class CustomerNotFoundError extends Error {
  constructor(customerId: string) {
    super(`Customer ${customerId} not found`);
    this.name = "CustomerNotFoundError";
  }
}

export class BarbershopNotFoundError extends Error {
  constructor(barbershopId: string) {
    super(`Barbershop ${barbershopId} not found`);
    this.name = "BarbershopNotFoundError";
  }
}

interface JoinQueueInput {
  customerId: string;
  barbershopId: string;
  preferredBarberId?: string;
}

const ESTIMATED_MINUTES_PER_CUSTOMER = 15;

/**
 * JoinQueueUseCase
 *
 * Allows a customer to join the virtual waiting queue at a barbershop.
 *
 * Rules:
 * - Queue must be enabled for the barbershop (isQueueEnabled = true)
 * - Customer cannot join if already in WAITING status for the same barbershop
 * - Returns queue position and estimated wait time
 */
export class JoinQueueUseCase {
  constructor(private queueRepository: IQueueRepository) {}

  async execute(input: JoinQueueInput): Promise<QueueItemWithPosition> {
    const { customerId, barbershopId, preferredBarberId } = input;

    // Check if barbershop exists and has queue enabled
    const barbershop =
      await this.queueRepository.findBarbershopById(barbershopId);

    if (!barbershop) {
      throw new BarbershopNotFoundError(barbershopId);
    }

    if (!barbershop.isQueueEnabled) {
      throw new QueueDisabledError(barbershopId);
    }

    // Check if customer exists
    const customer = await this.queueRepository.findCustomerById(customerId);

    if (!customer) {
      throw new CustomerNotFoundError(customerId);
    }

    // Check if customer is already in queue
    const existingItem = await this.queueRepository.findActiveQueueItem(
      customerId,
      barbershopId,
    );

    if (existingItem) {
      throw new AlreadyInQueueError(customerId, barbershopId);
    }

    // Create queue item
    const queueItem = await this.queueRepository.createQueueItem({
      customerId,
      barbershopId,
      preferredBarberId,
    });

    // Calculate position (number of people ahead + 1)
    const aheadCount = await this.queueRepository.countWaitingAhead(
      barbershopId,
      queueItem.joinedAt,
    );

    const position = aheadCount + 1;
    const estimatedWaitMinutes = aheadCount * ESTIMATED_MINUTES_PER_CUSTOMER;

    return {
      ...queueItem,
      position,
      estimatedWaitMinutes,
    };
  }
}
