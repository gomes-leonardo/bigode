import Twilio from "twilio";

export interface SendMessageParams {
  to: string; // Customer phone: +5511999998888
  body: string;
  templateSid?: string; // For approved WhatsApp templates
  templateVariables?: Record<string, string>;
}

export interface SendMessageResult {
  success: boolean;
  messageSid?: string;
  error?: string;
}

export interface MessageStatusUpdate {
  messageSid: string;
  status: "queued" | "sent" | "delivered" | "read" | "failed" | "undelivered";
  errorCode?: string;
  errorMessage?: string;
  timestamp: Date;
}

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  whatsappNumber: string;
}

/**
 * Interface for Twilio client to allow mocking in tests
 */
export interface ITwilioClient {
  sendWhatsAppMessage(params: SendMessageParams): Promise<SendMessageResult>;
  validateWebhookSignature(
    signature: string,
    url: string,
    params: Record<string, string>,
  ): boolean;
}

/**
 * Production Twilio client implementation
 */
export class TwilioClient implements ITwilioClient {
  private config: TwilioConfig;
  private client: ReturnType<typeof Twilio>;

  constructor(config: TwilioConfig) {
    this.config = config;
    this.client = Twilio(config.accountSid, config.authToken);
  }

  async sendWhatsAppMessage(
    params: SendMessageParams,
  ): Promise<SendMessageResult> {
    try {
      // Format phone number for WhatsApp
      const toWhatsApp = params.to.startsWith("whatsapp:")
        ? params.to
        : `whatsapp:${params.to}`;

      const message = await this.client.messages.create({
        from: this.config.whatsappNumber,
        to: toWhatsApp,
        body: params.body,
      });

      return {
        success: true,
        messageSid: message.sid,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("[TWILIO ERROR]", errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  validateWebhookSignature(
    signature: string,
    url: string,
    params: Record<string, string>,
  ): boolean {
    return Twilio.validateRequest(
      this.config.authToken,
      signature,
      url,
      params,
    );
  }
}

/**
 * Mock client for testing
 */
export class MockTwilioClient implements ITwilioClient {
  public sentMessages: SendMessageParams[] = [];

  async sendWhatsAppMessage(
    params: SendMessageParams,
  ): Promise<SendMessageResult> {
    this.sentMessages.push(params);
    return {
      success: true,
      messageSid: `MOCK_${Date.now()}_${this.sentMessages.length}`,
    };
  }

  validateWebhookSignature(): boolean {
    return true;
  }

  clearMessages(): void {
    this.sentMessages = [];
  }
}
