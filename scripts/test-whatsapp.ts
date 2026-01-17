import { prisma } from "../src/infra/database/prisma/client.js";
import { NotificationService } from "../src/domain/scheduling/application/services/NotificationService.js";
import { getTwilioClient } from "../src/infra/messaging/twilio/twilio.factory.js";
import { env } from "../src/infra/env/env.js";

async function main() {
  console.log("\n🔧 Configuração Twilio:");
  console.log(
    `   Account SID: ${env.TWILIO_ACCOUNT_SID ? "✅ Configurado" : "❌ Não configurado"}`,
  );
  console.log(
    `   Auth Token: ${env.TWILIO_AUTH_TOKEN ? "✅ Configurado" : "❌ Não configurado"}`,
  );
  console.log(
    `   WhatsApp Number: ${env.TWILIO_WHATSAPP_NUMBER || "❌ Não configurado"}`,
  );

  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
    console.log("\n❌ Credenciais Twilio não configuradas. Configure no .env");
    process.exit(1);
  }

  // Pegar número do celular do argumento
  const phoneNumber = process.argv[2];

  if (!phoneNumber) {
    console.log("\n❌ Uso: npx tsx scripts/test-whatsapp.ts +5511999999999");
    console.log(
      "   Informe seu número de WhatsApp para receber a mensagem de teste",
    );
    process.exit(1);
  }

  console.log(`\n📱 Número de destino: ${phoneNumber}`);

  // Criar ou buscar barbershop de teste
  let barbershop = await prisma.barbershop.findFirst({
    where: { slug: "teste-whatsapp" },
  });

  if (!barbershop) {
    console.log("\n📝 Criando barbearia de teste...");
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

  console.log(`\n🏪 Barbearia: ${barbershop.name} (${barbershop.id})`);

  // Testar envio de mensagem
  console.log("\n📤 Enviando mensagem de teste via WhatsApp...");

  const twilioClient = getTwilioClient();
  const notificationService = new NotificationService(twilioClient);

  try {
    const result = await notificationService.sendQueueCallNotification({
      customerPhone: phoneNumber,
      customerName: "Usuário Teste",
      barbershopName: barbershop.name,
      position: 1,
    });

    if (result.success) {
      console.log("\n✅ Mensagem enviada com sucesso!");
      console.log(`   Message SID: ${result.messageSid}`);
      console.log("\n📲 Verifique seu WhatsApp para confirmar o recebimento.");
    } else {
      console.log("\n❌ Falha ao enviar mensagem:");
      console.log(`   Erro: ${result.error}`);
    }
  } catch (error) {
    console.error("\n❌ Erro ao enviar mensagem:", error);
  }

  await prisma.$disconnect();
}

main();
