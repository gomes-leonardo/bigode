import { prisma } from "../src/infra/database/prisma/client.js";

async function main() {
  const barbershopId = process.argv[2];

  if (!barbershopId) {
    console.log("\n❌ Uso: npx tsx scripts/create-barber.ts <barbershopId>");
    console.log(
      "   Exemplo: npx tsx scripts/create-barber.ts 2013f7bf-4036-4f6f-80cc-07701584395f",
    );
    process.exit(1);
  }

  const barberName = "Paula";

  console.log(`\n👨‍💼 Criando barbeiro para a barbearia: ${barbershopId}`);
  console.log(`   Nome: ${barberName}`);

  try {
    // Verificar se a barbearia existe
    const barbershop = await prisma.barbershop.findUnique({
      where: { id: barbershopId },
    });

    if (!barbershop) {
      console.error(`\n❌ Barbearia não encontrada: ${barbershopId}`);
      process.exit(1);
    }

    console.log(`   Barbearia: ${barbershop.name}`);

    // Criar barbeiro
    const barber = await prisma.barber.create({
      data: {
        name: barberName,
        barbershopId,
      },
    });

    console.log(`\n✅ Barbeiro criado com sucesso!`);
    console.log(`   ID: ${barber.id}`);
    console.log(`   Nome: ${barber.name}`);
    console.log(`   Barbearia: ${barbershop.name} (${barbershop.slug})`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("\n❌ Erro ao criar barbeiro:", message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
