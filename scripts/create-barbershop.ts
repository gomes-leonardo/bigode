import { prisma } from "../src/infra/database/prisma/client.js";

async function main() {
  const barbershopName = "d paula barber";
  const slug = "d-paula-barber";
  const phone = `+5511999${Date.now().toString().slice(-6)}`;

  console.log(`\n🏪 Criando barbearia: ${barbershopName}`);
  console.log(`   Slug: ${slug}`);
  console.log(`   Telefone: ${phone}`);

  try {
    const barbershop = await prisma.barbershop.upsert({
      where: { slug },
      update: {
        name: barbershopName,
        phone,
      },
      create: {
        name: barbershopName,
        slug,
        phone,
      },
    });

    console.log(`\n✅ Barbearia criada/encontrada com sucesso!`);
    console.log(`   ID: ${barbershop.id}`);
    console.log(`   Nome: ${barbershop.name}`);
    console.log(`   Slug: ${barbershop.slug}`);
    console.log(`   Telefone: ${barbershop.phone}`);
    console.log(`   Timezone: ${barbershop.timezone}`);
    console.log(`   Criada em: ${barbershop.createdAt.toISOString()}`);
  } catch (error) {
    console.error("\n❌ Erro ao criar barbearia:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
