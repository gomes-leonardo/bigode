/**
 * Test script for simulating Twilio incoming messages
 *
 * Usage: npx tsx scripts/test-incoming-webhook.ts [message]
 *
 * Examples:
 *   npx tsx scripts/test-incoming-webhook.ts "oi"
 *   npx tsx scripts/test-incoming-webhook.ts "1"
 *   npx tsx scripts/test-incoming-webhook.ts "agendar"
 *   npx tsx scripts/test-incoming-webhook.ts "2"
 */

import "dotenv/config";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3333";
const TEST_PHONE = process.env.TEST_PHONE || "+5511999998888";

async function simulateIncomingMessage(body: string) {
  const payload = new URLSearchParams({
    MessageSid: `SM${Date.now()}${Math.random().toString(36).slice(2, 10)}`,
    From: `whatsapp:${TEST_PHONE}`,
    To: "whatsapp:+14155238886",
    Body: body,
    ProfileName: "Test User",
    NumMedia: "0",
  });

  console.log("\n📱 Simulating incoming WhatsApp message...");
  console.log(`   From: ${TEST_PHONE}`);
  console.log(`   Message: "${body}"`);
  console.log(`   URL: ${BASE_URL}/webhook/twilio/incoming`);

  try {
    const response = await fetch(`${BASE_URL}/webhook/twilio/incoming`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload.toString(),
    });

    const responseText = await response.text();

    console.log("\n📨 Response:");
    console.log(`   Status: ${response.status}`);
    console.log(`   Body: ${responseText}`);

    if (response.ok) {
      console.log("\n✅ Message processed successfully!");
      console.log(
        "\n💡 Check server logs to see the bot response that was sent.",
      );
    } else {
      console.log("\n❌ Error processing message");
    }
  } catch (error) {
    console.error("\n❌ Error sending request:", error);
    console.log("\n💡 Make sure the server is running: npm run dev");
  }
}

// Get message from command line args or use default
const message = process.argv[2] || "oi";

console.log("=".repeat(60));
console.log("🧪 Twilio Incoming Webhook Test");
console.log("=".repeat(60));

simulateIncomingMessage(message);
