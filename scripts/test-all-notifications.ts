import { NotificationService } from "../src/domain/scheduling/application/services/NotificationService.js";
import { getTwilioClient } from "../src/infra/messaging/twilio/twilio.factory.js";

async function main() {
  const phoneNumber = process.argv[2];

  if (!phoneNumber) {
    console.log(
      "\n❌ Uso: npx tsx scripts/test-all-notifications.ts +5511999999999",
    );
    process.exit(1);
  }

  console.log(`\n📱 Testando TODAS as notificações para: ${phoneNumber}`);
  console.log("═".repeat(50));

  const twilioClient = getTwilioClient();
  const notificationService = new NotificationService(twilioClient);

  const results: { name: string; success: boolean; error?: string }[] = [];

  // Helper function
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // 1. OTP Admin
  console.log("\n1️⃣ Enviando OTP Admin...");
  try {
    const result = await notificationService.sendAdminOTP({
      phone: phoneNumber,
      adminName: "Leonardo",
      code: "123456",
      expiresInMinutes: 5,
    });
    results.push({
      name: "OTP Admin",
      success: result.success,
      error: result.error,
    });
    console.log(
      result.success ? "   ✅ Enviado!" : `   ❌ Falha: ${result.error}`,
    );
  } catch (e) {
    results.push({ name: "OTP Admin", success: false, error: String(e) });
    console.log(`   ❌ Erro: ${e}`);
  }

  await delay(2000); // Esperar 2s entre mensagens

  // 2. Booking Link
  console.log("\n2️⃣ Enviando Link de Agendamento...");
  try {
    const result = await notificationService.sendBookingLink({
      customerPhone: phoneNumber,
      customerName: "Leonardo",
      barbershopName: "Barbearia Bigode",
      bookingUrl: "http://localhost:3000/booking/abc123xyz",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });
    results.push({
      name: "Booking Link",
      success: result.success,
      error: result.error,
    });
    console.log(
      result.success ? "   ✅ Enviado!" : `   ❌ Falha: ${result.error}`,
    );
  } catch (e) {
    results.push({ name: "Booking Link", success: false, error: String(e) });
    console.log(`   ❌ Erro: ${e}`);
  }

  await delay(2000);

  // 3. Appointment Confirmation
  console.log("\n3️⃣ Enviando Confirmação de Agendamento...");
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await notificationService.sendAppointmentConfirmation({
      customerPhone: phoneNumber,
      customerName: "Leonardo",
      barbershopName: "Barbearia Bigode",
      barberName: "Carlos",
      serviceName: "Corte + Barba",
      appointmentDate: tomorrow,
      appointmentTime: "14:00",
      duration: 45,
      price: 65.0,
    });
    results.push({
      name: "Confirmação",
      success: result.success,
      error: result.error,
    });
    console.log(
      result.success ? "   ✅ Enviado!" : `   ❌ Falha: ${result.error}`,
    );
  } catch (e) {
    results.push({ name: "Confirmação", success: false, error: String(e) });
    console.log(`   ❌ Erro: ${e}`);
  }

  await delay(2000);

  // 4. Appointment Reminder
  console.log("\n4️⃣ Enviando Lembrete...");
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await notificationService.sendAppointmentReminder({
      customerPhone: phoneNumber,
      customerName: "Leonardo",
      barbershopName: "Barbearia Bigode",
      barberName: "Carlos",
      serviceName: "Corte + Barba",
      appointmentDate: tomorrow,
      appointmentTime: "14:00",
      hoursUntil: 24,
    });
    results.push({
      name: "Lembrete",
      success: result.success,
      error: result.error,
    });
    console.log(
      result.success ? "   ✅ Enviado!" : `   ❌ Falha: ${result.error}`,
    );
  } catch (e) {
    results.push({ name: "Lembrete", success: false, error: String(e) });
    console.log(`   ❌ Erro: ${e}`);
  }

  await delay(2000);

  // 5. Cancellation
  console.log("\n5️⃣ Enviando Cancelamento...");
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await notificationService.sendCancellationNotification({
      customerPhone: phoneNumber,
      customerName: "Leonardo",
      barbershopName: "Barbearia Bigode",
      appointmentDate: tomorrow,
      appointmentTime: "14:00",
      reason: "Barbeiro indisponível",
    });
    results.push({
      name: "Cancelamento",
      success: result.success,
      error: result.error,
    });
    console.log(
      result.success ? "   ✅ Enviado!" : `   ❌ Falha: ${result.error}`,
    );
  } catch (e) {
    results.push({ name: "Cancelamento", success: false, error: String(e) });
    console.log(`   ❌ Erro: ${e}`);
  }

  await delay(2000);

  // 6. Queue Call
  console.log("\n6️⃣ Enviando Chamada de Fila...");
  try {
    const result = await notificationService.sendQueueCallNotification({
      customerPhone: phoneNumber,
      customerName: "Leonardo",
      barbershopName: "Barbearia Bigode",
      position: 1,
    });
    results.push({
      name: "Chamada Fila",
      success: result.success,
      error: result.error,
    });
    console.log(
      result.success ? "   ✅ Enviado!" : `   ❌ Falha: ${result.error}`,
    );
  } catch (e) {
    results.push({ name: "Chamada Fila", success: false, error: String(e) });
    console.log(`   ❌ Erro: ${e}`);
  }

  await delay(2000);

  // 7. Reschedule
  console.log("\n7️⃣ Enviando Reagendamento...");
  try {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() + 1);

    const newDate = new Date();
    newDate.setDate(newDate.getDate() + 3);

    const result = await notificationService.sendRescheduleNotification({
      customerPhone: phoneNumber,
      customerName: "Leonardo",
      barbershopName: "Barbearia Bigode",
      barberName: "Carlos",
      serviceName: "Corte + Barba",
      oldDate: oldDate,
      oldTime: "14:00",
      newDate: newDate,
      newTime: "16:30",
    });
    results.push({
      name: "Reagendamento",
      success: result.success,
      error: result.error,
    });
    console.log(
      result.success ? "   ✅ Enviado!" : `   ❌ Falha: ${result.error}`,
    );
  } catch (e) {
    results.push({ name: "Reagendamento", success: false, error: String(e) });
    console.log(`   ❌ Erro: ${e}`);
  }

  // Summary
  console.log("\n" + "═".repeat(50));
  console.log("📊 RESUMO:");
  console.log("═".repeat(50));

  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  results.forEach((r) => {
    console.log(`   ${r.success ? "✅" : "❌"} ${r.name}`);
  });

  console.log("\n" + "─".repeat(50));
  console.log(
    `   Total: ${results.length} | ✅ ${successful} sucessos | ❌ ${failed} falhas`,
  );
  console.log("\n📲 Verifique seu WhatsApp para ver todas as mensagens!\n");
}

main();
