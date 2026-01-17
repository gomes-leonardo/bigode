import { prisma } from "../src/infra/database/prisma/client.js";
import { NotificationService } from "../src/domain/scheduling/application/services/NotificationService.js";
import { getTwilioClient } from "../src/infra/messaging/twilio/twilio.factory.js";
import { env } from "../src/infra/env/env.js";

async function main() {
  const phoneNumber = process.argv[2];

  if (!phoneNumber) {
    console.log(
      "\n❌ Uso: npx tsx scripts/test-booking-link.ts +5511999999999",
    );
    process.exit(1);
  }

  console.log(`\n📱 Enviando link de agendamento para: ${phoneNumber}`);

  // Buscar ou criar barbershop de teste
  let barbershop = await prisma.barbershop.findFirst({
    where: { slug: "teste-whatsapp" },
  });

  if (!barbershop) {
    barbershop = await prisma.barbershop.create({
      data: {
        name: "Barbearia Teste WhatsApp",
        slug: "teste-whatsapp",
        phone: "+5511999999999",
        isQueueEnabled: true,
        subscriptionTier: "PREMIUM",
      },
    });
  }

  console.log(`🏪 Barbearia: ${barbershop.name}`);

  // Simular URL de booking (em produção viria do BookingTokenService)
  const fakeToken = "abc123xyz789";
  const bookingUrl = `${env.FRONTEND_URL}/booking/${fakeToken}`;

  console.log(`🔗 URL de agendamento: ${bookingUrl}`);

  // Enviar mensagem
  const twilioClient = getTwilioClient();
  const notificationService = new NotificationService(twilioClient);

  try {
    const result = await notificationService.sendBookingLink({
      customerPhone: phoneNumber,
      customerName: "Leonardo",
      barbershopName: barbershop.name,
      bookingUrl: bookingUrl,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
    });

    if (result.success) {
      console.log("\n✅ Link de agendamento enviado com sucesso!");
      console.log(`   Message SID: ${result.messageSid}`);
      console.log("\n📲 Verifique seu WhatsApp!");
    } else {
      console.log("\n❌ Falha ao enviar:", result.error);
    }
  } catch (error) {
    console.error("\n❌ Erro:", error);
  }

  await prisma.$disconnect();
}

main();
