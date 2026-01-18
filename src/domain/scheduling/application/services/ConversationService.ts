import { ConversationState } from "@prisma/client";
import { prisma } from "../../../../infra/database/prisma/client.js";
import { CreateBookingTokenUseCase } from "../use-cases/auth/CreateBookingToken.js";
import { PrismaBookingTokenRepository } from "../../../../infra/database/prisma/repositories/booking-token-repository.js";

const SESSION_EXPIRY_MINUTES = 30;

export interface IncomingMessage {
  from: string; // Customer phone (whatsapp:+5511999998888)
  to: string; // Twilio number
  body: string;
  messageSid: string;
}

export interface BotResponse {
  message: string;
  endConversation?: boolean;
}

/**
 * Conversation Service
 *
 * Manages WhatsApp bot conversations with customers.
 * Handles state transitions and generates appropriate responses.
 *
 * Flow:
 * 1. Customer sends "oi", "agenda", "olá" -> Show welcome + menu
 * 2. Customer sends "1" or "agendar" -> Generate booking link
 * 3. Customer sends "2" or "dúvidas" -> Show contact info
 */
export class ConversationService {
  private bookingTokenUseCase: CreateBookingTokenUseCase;

  constructor() {
    const bookingTokenRepository = new PrismaBookingTokenRepository();
    this.bookingTokenUseCase = new CreateBookingTokenUseCase(
      bookingTokenRepository,
    );
  }

  /**
   * Process incoming message and return bot response
   */
  async processMessage(message: IncomingMessage): Promise<BotResponse> {
    const customerPhone = this.normalizePhone(message.from);
    const messageText = message.body.trim().toLowerCase();

    // Get or create session
    const session = await this.getOrCreateSession(customerPhone);

    // Get barbershop context
    const barbershop = await this.getBarbershopForSession(session);

    if (!barbershop) {
      // If we can't identify the barbershop, use a default welcome
      return this.handleUnknownBarbershop(customerPhone);
    }

    // Process based on current state
    switch (session.state) {
      case "INITIAL":
      case "AWAITING_ACTION":
        return this.handleInitialOrAwaitingAction(
          session,
          barbershop,
          messageText,
          customerPhone,
        );

      case "COMPLETED":
        // Start fresh conversation
        await this.resetSession(session.id);
        return this.handleInitialOrAwaitingAction(
          { ...session, state: "INITIAL" },
          barbershop,
          messageText,
          customerPhone,
        );

      default:
        return this.getWelcomeMessage(barbershop.name);
    }
  }

  private async handleInitialOrAwaitingAction(
    session: { id: string; state: ConversationState; context: unknown },
    barbershop: { id: string; name: string; phone: string },
    messageText: string,
    customerPhone: string,
  ): Promise<BotResponse> {
    // Check if user wants to book
    if (this.isBookingIntent(messageText)) {
      return this.generateBookingLink(session.id, barbershop, customerPhone);
    }

    // Check if user has questions
    if (this.isQuestionIntent(messageText)) {
      await this.updateSessionState(session.id, "COMPLETED");
      return this.getContactMessage(barbershop);
    }

    // Check for greeting or unknown - show menu
    if (this.isGreeting(messageText) || session.state === "INITIAL") {
      await this.updateSessionState(session.id, "AWAITING_ACTION");
      return this.getWelcomeMessage(barbershop.name);
    }

    // Unknown input in AWAITING_ACTION state - show menu again
    await this.updateSessionState(session.id, "AWAITING_ACTION");
    return this.getMenuMessage();
  }

  private isGreeting(text: string): boolean {
    const greetings = [
      "oi",
      "olá",
      "ola",
      "bom dia",
      "boa tarde",
      "boa noite",
      "ei",
      "hey",
      "hello",
      "hi",
      "e aí",
      "e ai",
      "fala",
    ];
    return greetings.some((g) => text.includes(g));
  }

  private isBookingIntent(text: string): boolean {
    const bookingKeywords = [
      "1",
      "agendar",
      "agenda",
      "marcar",
      "horario",
      "horário",
      "corte",
      "cortar",
      "reservar",
      "quero agendar",
      "sim",
    ];
    return bookingKeywords.some((k) => text.includes(k));
  }

  private isQuestionIntent(text: string): boolean {
    const questionKeywords = [
      "2",
      "duvida",
      "dúvida",
      "duvidas",
      "dúvidas",
      "ajuda",
      "help",
      "pergunta",
      "informacao",
      "informação",
      "contato",
      "telefone",
      "endereco",
      "endereço",
      "onde",
      "como",
    ];
    return questionKeywords.some((k) => text.includes(k));
  }

  private getWelcomeMessage(barbershopName: string): BotResponse {
    return {
      message: `Olá! 👋 Bem-vindo à *${barbershopName}*!

Como posso ajudar você hoje?

*1* - 📅 Agendar horário
*2* - ❓ Dúvidas / Contato

_Digite o número da opção desejada._`,
    };
  }

  private getMenuMessage(): BotResponse {
    return {
      message: `Desculpe, não entendi. 😅

Por favor, escolha uma opção:

*1* - 📅 Agendar horário
*2* - ❓ Dúvidas / Contato

_Digite apenas o número da opção._`,
    };
  }

  private async generateBookingLink(
    sessionId: string,
    barbershop: { id: string; name: string },
    customerPhone: string,
  ): Promise<BotResponse> {
    try {
      const result = await this.bookingTokenUseCase.execute({
        barbershopId: barbershop.id,
        customerPhone: customerPhone,
      });

      await this.updateSessionState(sessionId, "COMPLETED");

      return {
        message: `Perfeito! 💈

Clique no link abaixo para escolher o serviço, barbeiro e horário:

${result.bookingUrl}

⏰ Este link expira em *15 minutos*.

Estamos te esperando! ✂️`,
        endConversation: true,
      };
    } catch (error) {
      console.error("[CONVERSATION] Error generating booking link:", error);
      return {
        message: `Desculpe, houve um erro ao gerar seu link de agendamento. 😔

Por favor, tente novamente em alguns instantes ou entre em contato diretamente com a barbearia.`,
      };
    }
  }

  private getContactMessage(barbershop: {
    name: string;
    phone: string;
  }): BotResponse {
    return {
      message: `📍 *${barbershop.name}*

Para dúvidas ou informações adicionais:
📞 ${barbershop.phone}

Você também pode agendar pelo nosso site ou enviando *"agendar"* aqui no WhatsApp.

Obrigado pelo contato! 💈`,
      endConversation: true,
    };
  }

  private async handleUnknownBarbershop(
    customerPhone: string,
  ): Promise<BotResponse> {
    // For MVP with single barbershop, try to get the first active one
    const barbershop = await prisma.barbershop.findFirst({
      where: {
        isAppointmentsEnabled: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (barbershop) {
      // Create session with this barbershop
      await this.createSessionWithBarbershop(customerPhone, barbershop.id);
      return this.getWelcomeMessage(barbershop.name);
    }

    return {
      message: `Olá! 👋

Desculpe, não conseguimos identificar a barbearia associada a este número.

Por favor, acesse o link de agendamento fornecido pela sua barbearia.`,
      endConversation: true,
    };
  }

  private normalizePhone(phone: string): string {
    // Remove whatsapp: prefix if present
    return phone.replace("whatsapp:", "");
  }

  private async getOrCreateSession(customerPhone: string) {
    const now = new Date();

    // Try to find active session
    let session = await prisma.conversationSession.findFirst({
      where: {
        customerPhone,
        expiresAt: { gt: now },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    if (session) {
      // Update last message time and extend expiry
      session = await prisma.conversationSession.update({
        where: { id: session.id },
        data: {
          lastMessageAt: now,
          expiresAt: new Date(now.getTime() + SESSION_EXPIRY_MINUTES * 60000),
        },
      });
      return session;
    }

    // Create new session
    session = await prisma.conversationSession.create({
      data: {
        customerPhone,
        state: "INITIAL",
        lastMessageAt: now,
        expiresAt: new Date(now.getTime() + SESSION_EXPIRY_MINUTES * 60000),
      },
    });

    return session;
  }

  private async createSessionWithBarbershop(
    customerPhone: string,
    barbershopId: string,
  ) {
    const now = new Date();

    return prisma.conversationSession.upsert({
      where: {
        customerPhone_barbershopId: {
          customerPhone,
          barbershopId,
        },
      },
      create: {
        customerPhone,
        barbershopId,
        state: "AWAITING_ACTION",
        lastMessageAt: now,
        expiresAt: new Date(now.getTime() + SESSION_EXPIRY_MINUTES * 60000),
      },
      update: {
        state: "AWAITING_ACTION",
        lastMessageAt: now,
        expiresAt: new Date(now.getTime() + SESSION_EXPIRY_MINUTES * 60000),
      },
    });
  }

  private async getBarbershopForSession(session: {
    barbershopId: string | null;
  }) {
    if (session.barbershopId) {
      return prisma.barbershop.findUnique({
        where: { id: session.barbershopId },
        select: { id: true, name: true, phone: true },
      });
    }

    // For MVP: get first barbershop
    return prisma.barbershop.findFirst({
      where: { isAppointmentsEnabled: true },
      select: { id: true, name: true, phone: true },
      orderBy: { createdAt: "asc" },
    });
  }

  private async updateSessionState(
    sessionId: string,
    state: ConversationState,
  ) {
    return prisma.conversationSession.update({
      where: { id: sessionId },
      data: { state },
    });
  }

  private async resetSession(sessionId: string) {
    const now = new Date();
    return prisma.conversationSession.update({
      where: { id: sessionId },
      data: {
        state: "INITIAL",
        lastMessageAt: now,
        expiresAt: new Date(now.getTime() + SESSION_EXPIRY_MINUTES * 60000),
      },
    });
  }
}
