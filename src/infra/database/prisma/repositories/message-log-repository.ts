import { MessageType, Prisma } from "@prisma/client";
import { prisma } from "../client.js";

export interface CreateMessageLogInput {
  twilioMessageSid?: string;
  twilioStatus?: string;
  toPhone: string;
  fromPhone: string;
  messageType: MessageType;
  content: string;
  appointmentId?: string;
  customerId?: string;
  barbershopId: string;
}

export interface UpdateMessageStatusInput {
  twilioStatus: string;
  deliveredAt?: Date;
  readAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  webhookPayload?: Record<string, unknown>;
}

export interface IMessageLogRepository {
  create(data: CreateMessageLogInput): Promise<{ id: string }>;
  findByTwilioSid(twilioMessageSid: string): Promise<{
    id: string;
    twilioStatus: string | null;
  } | null>;
  updateStatus(
    twilioMessageSid: string,
    data: UpdateMessageStatusInput,
  ): Promise<void>;
}

export class PrismaMessageLogRepository implements IMessageLogRepository {
  async create(data: CreateMessageLogInput): Promise<{ id: string }> {
    const log = await prisma.messageLog.create({
      data: {
        twilioMessageSid: data.twilioMessageSid,
        twilioStatus: data.twilioStatus ?? "queued",
        toPhone: data.toPhone,
        fromPhone: data.fromPhone,
        messageType: data.messageType,
        content: data.content,
        appointmentId: data.appointmentId,
        customerId: data.customerId,
        barbershopId: data.barbershopId,
      },
      select: { id: true },
    });

    return { id: log.id };
  }

  async findByTwilioSid(twilioMessageSid: string): Promise<{
    id: string;
    twilioStatus: string | null;
  } | null> {
    return prisma.messageLog.findUnique({
      where: { twilioMessageSid },
      select: { id: true, twilioStatus: true },
    });
  }

  async updateStatus(
    twilioMessageSid: string,
    data: UpdateMessageStatusInput,
  ): Promise<void> {
    await prisma.messageLog.update({
      where: { twilioMessageSid },
      data: {
        twilioStatus: data.twilioStatus,
        deliveredAt: data.deliveredAt,
        readAt: data.readAt,
        failedAt: data.failedAt,
        errorMessage: data.errorMessage,
        webhookPayload: data.webhookPayload as Prisma.InputJsonValue,
      },
    });
  }
}
