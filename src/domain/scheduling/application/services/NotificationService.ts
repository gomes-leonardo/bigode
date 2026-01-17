import {
  ITwilioClient,
  SendMessageResult,
} from "../../../../infra/messaging/twilio/twilio.service.js";

export interface AdminOTPNotification {
  phone: string;
  adminName: string;
  code: string;
  expiresInMinutes: number;
}

export interface BookingLinkNotification {
  customerPhone: string;
  customerName?: string;
  barbershopName: string;
  bookingUrl: string;
  expiresAt: Date;
}

export interface AppointmentConfirmation {
  customerPhone: string;
  customerName?: string;
  barbershopName: string;
  barberName: string;
  serviceName: string;
  appointmentDate: Date;
  appointmentTime: string;
  duration: number;
  price: number;
}

export interface AppointmentReminder {
  customerPhone: string;
  customerName?: string;
  barbershopName: string;
  barberName: string;
  serviceName: string;
  appointmentDate: Date;
  appointmentTime: string;
  hoursUntil: number;
}

export interface CancellationNotification {
  customerPhone: string;
  customerName?: string;
  barbershopName: string;
  appointmentDate: Date;
  appointmentTime: string;
  reason?: string;
}

export interface QueueCallNotification {
  customerPhone: string;
  customerName?: string;
  barbershopName: string;
  position: number;
}

export interface RescheduleNotification {
  customerPhone: string;
  customerName?: string;
  barbershopName: string;
  barberName: string;
  serviceName: string;
  oldDate: Date;
  oldTime: string;
  newDate: Date;
  newTime: string;
}

/**
 * Notification Service
 *
 * Handles all customer notifications via WhatsApp.
 * Uses template messages that can be customized per barbershop.
 */
export class NotificationService {
  constructor(private twilioClient: ITwilioClient) {}

  /**
   * Send OTP code to admin via WhatsApp
   */
  async sendAdminOTP(data: AdminOTPNotification): Promise<SendMessageResult> {
    const message = `🔐 *Código de Acesso - Bigode*

Olá ${data.adminName}!

Seu código de verificação é:

*${data.code}*

⏰ Este código expira em ${data.expiresInMinutes} minutos.

⚠️ Não compartilhe este código com ninguém.

_Se você não solicitou este código, ignore esta mensagem._`;

    return this.twilioClient.sendWhatsAppMessage({
      to: data.phone,
      body: message,
    });
  }

  /**
   * Send booking link to customer
   */
  async sendBookingLink(
    data: BookingLinkNotification,
  ): Promise<SendMessageResult> {
    const greeting = data.customerName ? `Olá ${data.customerName}!` : "Olá!";

    const message = `${greeting} 💈

*${data.barbershopName}* enviou um link para você agendar seu horário.

📅 Clique no link abaixo para escolher o melhor horário:
${data.bookingUrl}

⏰ Este link expira em 15 minutos.

_Não responda esta mensagem._`;

    return this.twilioClient.sendWhatsAppMessage({
      to: data.customerPhone,
      body: message,
    });
  }

  /**
   * Send appointment confirmation
   */
  async sendAppointmentConfirmation(
    data: AppointmentConfirmation,
  ): Promise<SendMessageResult> {
    const greeting = data.customerName
      ? `Olá ${data.customerName}!`
      : "Olá! 👋";

    const dateStr = data.appointmentDate.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });

    const message = `${greeting}

✅ *Agendamento Confirmado!*

📍 *${data.barbershopName}*
✂️ Serviço: ${data.serviceName}
👤 Barbeiro: ${data.barberName}
📅 Data: ${dateStr}
🕐 Horário: ${data.appointmentTime}
⏱️ Duração: ${data.duration} minutos
💰 Valor: R$ ${data.price.toFixed(2)}

Até lá! 💈`;

    return this.twilioClient.sendWhatsAppMessage({
      to: data.customerPhone,
      body: message,
    });
  }

  /**
   * Send appointment reminder
   */
  async sendAppointmentReminder(
    data: AppointmentReminder,
  ): Promise<SendMessageResult> {
    const greeting = data.customerName ? `Olá ${data.customerName}!` : "Olá!";

    const timeUntilText =
      data.hoursUntil === 24
        ? "amanhã"
        : data.hoursUntil === 1
          ? "em 1 hora"
          : `em ${data.hoursUntil} horas`;

    const dateStr = data.appointmentDate.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });

    const message = `${greeting}

⏰ *Lembrete de Agendamento*

Seu horário é ${timeUntilText}!

📍 *${data.barbershopName}*
✂️ ${data.serviceName}
👤 ${data.barberName}
📅 ${dateStr}
🕐 ${data.appointmentTime}

Te esperamos! 💈`;

    return this.twilioClient.sendWhatsAppMessage({
      to: data.customerPhone,
      body: message,
    });
  }

  /**
   * Send cancellation notification
   */
  async sendCancellationNotification(
    data: CancellationNotification,
  ): Promise<SendMessageResult> {
    const greeting = data.customerName ? `Olá ${data.customerName}!` : "Olá!";

    const dateStr = data.appointmentDate.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });

    const reasonText = data.reason ? `\n\nMotivo: ${data.reason}` : "";

    const message = `${greeting}

❌ *Agendamento Cancelado*

Seu horário em *${data.barbershopName}* foi cancelado.

📅 Data: ${dateStr}
🕐 Horário: ${data.appointmentTime}${reasonText}

Para reagendar, entre em contato com a barbearia.`;

    return this.twilioClient.sendWhatsAppMessage({
      to: data.customerPhone,
      body: message,
    });
  }

  /**
   * Send queue call notification
   * Notifies customer that it's their turn
   */
  async sendQueueCallNotification(
    data: QueueCallNotification,
  ): Promise<SendMessageResult> {
    const greeting = data.customerName ? `Olá ${data.customerName}!` : "Olá!";

    const message = `${greeting}

🔔 *É a sua vez!*

Você está sendo chamado na *${data.barbershopName}*!

📍 Por favor, dirija-se ao estabelecimento.

⏰ Compareça em até 5 minutos para não perder sua vez.

_Se não puder comparecer, sua posição na fila será perdida._`;

    return this.twilioClient.sendWhatsAppMessage({
      to: data.customerPhone,
      body: message,
    });
  }

  /**
   * Send reschedule notification
   * Notifies customer that their appointment was rescheduled
   */
  async sendRescheduleNotification(
    data: RescheduleNotification,
  ): Promise<SendMessageResult> {
    const greeting = data.customerName ? `Olá ${data.customerName}!` : "Olá!";

    const oldDateStr = data.oldDate.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });

    const newDateStr = data.newDate.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });

    const message = `${greeting}

🔄 *Agendamento Reagendado*

Seu horário em *${data.barbershopName}* foi alterado.

❌ *Horário anterior:*
📅 ${oldDateStr}
🕐 ${data.oldTime}

✅ *Novo horário:*
📅 ${newDateStr}
🕐 ${data.newTime}

✂️ Serviço: ${data.serviceName}
👤 Barbeiro: ${data.barberName}

Nos vemos em breve! 💈`;

    return this.twilioClient.sendWhatsAppMessage({
      to: data.customerPhone,
      body: message,
    });
  }
}
