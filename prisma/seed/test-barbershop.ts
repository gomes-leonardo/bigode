import { prisma } from "../../src/infra/database/prisma/client.js";

// Deterministic IDs for "The Paula Barber" test barbershop
// These IDs are stable and can be used in tests and local development
export const TEST_BARBERSHOP = {
  id: "550e8400-e29b-41d4-a716-446655440100",
  name: "The Paula Barber",
  slug: "the-paula-barber",
  phone: "+5511999990000",
};

export const TEST_BARBERS = {
  john: {
    id: "550e8400-e29b-41d4-a716-446655440101",
    name: "John Doe",
  },
  jane: {
    id: "550e8400-e29b-41d4-a716-446655440102",
    name: "Jane Smith",
  },
  math: {
    id: "550e8400-e29b-41d4-a716-446655440104",
    name: "Barber Math",
  },
};

export const TEST_SERVICE = {
  id: "550e8400-e29b-41d4-a716-446655440103",
  name: "Haircut",
  durationMin: 30,
  price: 35.0,
};

// Test admins for authentication testing
export const TEST_ADMINS = {
  // Owner of Barbearia do Bigode
  carlos_owner: {
    id: "550e8400-e29b-41d4-a716-446655440901",
    email: "carlos@bigode.com",
    phone: "+5511999990001", // Use this phone for OTP testing
    name: "Carlos Silva",
    role: "OWNER" as const,
  },
  // Manager of Barbearia do Bigode
  maria_manager: {
    id: "550e8400-e29b-41d4-a716-446655440902",
    email: "maria@bigode.com",
    phone: "+5511999990002",
    name: "Maria Santos",
    role: "MANAGER" as const,
  },
  // Owner of Corte Certo
  lucas_owner: {
    id: "550e8400-e29b-41d4-a716-446655440903",
    email: "lucas@cortecerto.com",
    phone: "+5511999990003",
    name: "Lucas Ferreira",
    role: "OWNER" as const,
  },
};

// Additional realistic barbershops for more comprehensive testing
export const BARBEARIA_BIGODE = {
  id: "550e8400-e29b-41d4-a716-446655440200",
  name: "Barbearia do Bigode",
  slug: "barbearia-do-bigode",
  phone: "+5511988881111",
};

export const BARBEARIA_CORTE_CERTO = {
  id: "550e8400-e29b-41d4-a716-446655440300",
  name: "Corte Certo Barbearia",
  slug: "corte-certo-barbearia",
  phone: "+5511977772222",
};

// Barbers for Barbearia do Bigode
export const BIGODE_BARBERS = {
  carlos: {
    id: "550e8400-e29b-41d4-a716-446655440201",
    name: "Carlos Silva",
    phone: "+5511966661111",
  },
  rafael: {
    id: "550e8400-e29b-41d4-a716-446655440202",
    name: "Rafael Santos",
    phone: "+5511966662222",
  },
  fernando: {
    id: "550e8400-e29b-41d4-a716-446655440203",
    name: "Fernando Oliveira",
    phone: "+5511966663333",
  },
};

// Barbers for Corte Certo
export const CORTE_CERTO_BARBERS = {
  lucas: {
    id: "550e8400-e29b-41d4-a716-446655440301",
    name: "Lucas Ferreira",
    phone: "+5511955551111",
  },
  bruno: {
    id: "550e8400-e29b-41d4-a716-446655440302",
    name: "Bruno Costa",
    phone: "+5511955552222",
  },
};

// Services for Barbearia do Bigode
export const BIGODE_SERVICES = {
  corte: {
    id: "550e8400-e29b-41d4-a716-446655440210",
    name: "Corte Masculino",
    durationMin: 30,
    price: 45.0,
  },
  barba: {
    id: "550e8400-e29b-41d4-a716-446655440211",
    name: "Barba Completa",
    durationMin: 25,
    price: 35.0,
  },
  combo: {
    id: "550e8400-e29b-41d4-a716-446655440212",
    name: "Combo Corte + Barba",
    durationMin: 50,
    price: 70.0,
  },
  sobrancelha: {
    id: "550e8400-e29b-41d4-a716-446655440213",
    name: "Design de Sobrancelha",
    durationMin: 15,
    price: 20.0,
  },
  pezinho: {
    id: "550e8400-e29b-41d4-a716-446655440214",
    name: "Pezinho/Acabamento",
    durationMin: 15,
    price: 15.0,
  },
  hidratacao: {
    id: "550e8400-e29b-41d4-a716-446655440215",
    name: "Hidratação Capilar",
    durationMin: 20,
    price: 30.0,
  },
};

// Services for Corte Certo
export const CORTE_CERTO_SERVICES = {
  corte: {
    id: "550e8400-e29b-41d4-a716-446655440310",
    name: "Corte Social",
    durationMin: 25,
    price: 40.0,
  },
  degradê: {
    id: "550e8400-e29b-41d4-a716-446655440311",
    name: "Degradê/Fade",
    durationMin: 35,
    price: 50.0,
  },
  barba: {
    id: "550e8400-e29b-41d4-a716-446655440312",
    name: "Barba na Navalha",
    durationMin: 30,
    price: 40.0,
  },
  combo: {
    id: "550e8400-e29b-41d4-a716-446655440313",
    name: "Combo Premium",
    durationMin: 60,
    price: 85.0,
  },
};

export async function seedTestBarbershop() {
  console.log("Seeding test barbershop: The Paula Barber...");

  // Create barbershop
  const barbershop = await prisma.barbershop.upsert({
    where: { id: TEST_BARBERSHOP.id },
    update: {},
    create: {
      id: TEST_BARBERSHOP.id,
      name: TEST_BARBERSHOP.name,
      slug: TEST_BARBERSHOP.slug,
      phone: TEST_BARBERSHOP.phone,
    },
  });

  console.log(`  Created barbershop: ${barbershop.name} (${barbershop.id})`);

  // Create barber John with Mon-Fri schedule
  const john = await prisma.barber.upsert({
    where: { id: TEST_BARBERS.john.id },
    update: {},
    create: {
      id: TEST_BARBERS.john.id,
      name: TEST_BARBERS.john.name,
      barbershopId: TEST_BARBERSHOP.id,
    },
  });

  console.log(`  Created barber: ${john.name} (${john.id})`);

  // Create John's schedule (Mon-Fri, 09:00-18:00 with lunch break)
  for (const dayOfWeek of [1, 2, 3, 4, 5]) {
    const schedule = await prisma.barberSchedule.upsert({
      where: {
        barberId_dayOfWeek: {
          barberId: john.id,
          dayOfWeek,
        },
      },
      update: {},
      create: {
        barberId: john.id,
        dayOfWeek,
        startTime: "09:00",
        endTime: "18:00",
        isActive: true,
      },
    });

    // Add lunch break
    await prisma.barberBreak.upsert({
      where: { id: `break-${john.id}-${dayOfWeek}` },
      update: {},
      create: {
        id: `break-${john.id}-${dayOfWeek}`,
        scheduleId: schedule.id,
        startTime: "12:00",
        endTime: "13:00",
      },
    });
  }

  console.log(
    `  Created schedule for ${john.name}: Mon-Fri 09:00-18:00 (lunch 12:00-13:00)`,
  );

  // Create barber Jane with Tue-Sat schedule
  const jane = await prisma.barber.upsert({
    where: { id: TEST_BARBERS.jane.id },
    update: {},
    create: {
      id: TEST_BARBERS.jane.id,
      name: TEST_BARBERS.jane.name,
      barbershopId: TEST_BARBERSHOP.id,
    },
  });

  console.log(`  Created barber: ${jane.name} (${jane.id})`);

  // Create Jane's schedule (Tue-Sat, 10:00-19:00, no breaks)
  for (const dayOfWeek of [2, 3, 4, 5, 6]) {
    await prisma.barberSchedule.upsert({
      where: {
        barberId_dayOfWeek: {
          barberId: jane.id,
          dayOfWeek,
        },
      },
      update: {},
      create: {
        barberId: jane.id,
        dayOfWeek,
        startTime: "10:00",
        endTime: "19:00",
        isActive: true,
      },
    });
  }

  console.log(
    `  Created schedule for ${jane.name}: Tue-Sat 10:00-19:00 (no breaks)`,
  );

  // Create barber Math with Mon-Sat schedule
  const math = await prisma.barber.upsert({
    where: { id: TEST_BARBERS.math.id },
    update: {},
    create: {
      id: TEST_BARBERS.math.id,
      name: TEST_BARBERS.math.name,
      barbershopId: TEST_BARBERSHOP.id,
    },
  });

  console.log(`  Created barber: ${math.name} (${math.id})`);

  // Create Math's schedule (Mon-Sat, 08:00-17:00, no breaks)
  for (const dayOfWeek of [1, 2, 3, 4, 5, 6]) {
    await prisma.barberSchedule.upsert({
      where: {
        barberId_dayOfWeek: {
          barberId: math.id,
          dayOfWeek,
        },
      },
      update: {},
      create: {
        barberId: math.id,
        dayOfWeek,
        startTime: "08:00",
        endTime: "17:00",
        isActive: true,
      },
    });
  }

  console.log(
    `  Created schedule for ${math.name}: Mon-Sat 08:00-17:00 (no breaks)`,
  );

  // Create test service
  const service = await prisma.service.upsert({
    where: { id: TEST_SERVICE.id },
    update: {},
    create: {
      id: TEST_SERVICE.id,
      name: TEST_SERVICE.name,
      durationMin: TEST_SERVICE.durationMin,
      price: TEST_SERVICE.price,
      barbershopId: TEST_BARBERSHOP.id,
    },
  });

  console.log(`  Created service: ${service.name} (${service.id})`);

  console.log("\nTest barbershop seeded successfully!");
  console.log("\nDeterministic IDs for testing:");
  console.log(`  Barbershop: ${TEST_BARBERSHOP.id}`);
  console.log(`  Barber John: ${TEST_BARBERS.john.id}`);
  console.log(`  Barber Jane: ${TEST_BARBERS.jane.id}`);
  console.log(`  Barber Math: ${TEST_BARBERS.math.id}`);
  console.log(`  Service: ${TEST_SERVICE.id}`);
}

export async function seedBarbeariaBigode() {
  console.log("\nSeeding Barbearia do Bigode...");

  // Create barbershop
  const barbershop = await prisma.barbershop.upsert({
    where: { id: BARBEARIA_BIGODE.id },
    update: {},
    create: {
      id: BARBEARIA_BIGODE.id,
      name: BARBEARIA_BIGODE.name,
      slug: BARBEARIA_BIGODE.slug,
      phone: BARBEARIA_BIGODE.phone,
    },
  });

  console.log(`  Created barbershop: ${barbershop.name} (${barbershop.id})`);

  // Create barber Carlos (owner, works Mon-Sat)
  const carlos = await prisma.barber.upsert({
    where: { id: BIGODE_BARBERS.carlos.id },
    update: {},
    create: {
      id: BIGODE_BARBERS.carlos.id,
      name: BIGODE_BARBERS.carlos.name,
      phone: BIGODE_BARBERS.carlos.phone,
      barbershopId: BARBEARIA_BIGODE.id,
    },
  });

  console.log(`  Created barber: ${carlos.name} (${carlos.id})`);

  // Carlos's schedule (Mon-Sat, 08:00-19:00 with lunch break)
  for (const dayOfWeek of [1, 2, 3, 4, 5, 6]) {
    const schedule = await prisma.barberSchedule.upsert({
      where: {
        barberId_dayOfWeek: {
          barberId: carlos.id,
          dayOfWeek,
        },
      },
      update: {},
      create: {
        barberId: carlos.id,
        dayOfWeek,
        startTime: "08:00",
        endTime: "19:00",
        isActive: true,
      },
    });

    await prisma.barberBreak.upsert({
      where: { id: `break-${carlos.id}-${dayOfWeek}` },
      update: {},
      create: {
        id: `break-${carlos.id}-${dayOfWeek}`,
        scheduleId: schedule.id,
        startTime: "12:00",
        endTime: "13:00",
      },
    });
  }

  console.log(
    `  Created schedule for ${carlos.name}: Mon-Sat 08:00-19:00 (lunch 12:00-13:00)`,
  );

  // Create barber Rafael (works Tue-Sat)
  const rafael = await prisma.barber.upsert({
    where: { id: BIGODE_BARBERS.rafael.id },
    update: {},
    create: {
      id: BIGODE_BARBERS.rafael.id,
      name: BIGODE_BARBERS.rafael.name,
      phone: BIGODE_BARBERS.rafael.phone,
      barbershopId: BARBEARIA_BIGODE.id,
    },
  });

  console.log(`  Created barber: ${rafael.name} (${rafael.id})`);

  // Rafael's schedule (Tue-Sat, 09:00-18:00)
  for (const dayOfWeek of [2, 3, 4, 5, 6]) {
    await prisma.barberSchedule.upsert({
      where: {
        barberId_dayOfWeek: {
          barberId: rafael.id,
          dayOfWeek,
        },
      },
      update: {},
      create: {
        barberId: rafael.id,
        dayOfWeek,
        startTime: "09:00",
        endTime: "18:00",
        isActive: true,
      },
    });
  }

  console.log(`  Created schedule for ${rafael.name}: Tue-Sat 09:00-18:00`);

  // Create barber Fernando (works Wed-Sun, different schedule)
  const fernando = await prisma.barber.upsert({
    where: { id: BIGODE_BARBERS.fernando.id },
    update: {},
    create: {
      id: BIGODE_BARBERS.fernando.id,
      name: BIGODE_BARBERS.fernando.name,
      phone: BIGODE_BARBERS.fernando.phone,
      barbershopId: BARBEARIA_BIGODE.id,
    },
  });

  console.log(`  Created barber: ${fernando.name} (${fernando.id})`);

  // Fernando's schedule (Wed-Sun, 10:00-20:00 with lunch)
  for (const dayOfWeek of [0, 3, 4, 5, 6]) {
    const schedule = await prisma.barberSchedule.upsert({
      where: {
        barberId_dayOfWeek: {
          barberId: fernando.id,
          dayOfWeek,
        },
      },
      update: {},
      create: {
        barberId: fernando.id,
        dayOfWeek,
        startTime: "10:00",
        endTime: "20:00",
        isActive: true,
      },
    });

    await prisma.barberBreak.upsert({
      where: { id: `break-${fernando.id}-${dayOfWeek}` },
      update: {},
      create: {
        id: `break-${fernando.id}-${dayOfWeek}`,
        scheduleId: schedule.id,
        startTime: "14:00",
        endTime: "15:00",
      },
    });
  }

  console.log(
    `  Created schedule for ${fernando.name}: Wed-Sun 10:00-20:00 (lunch 14:00-15:00)`,
  );

  // Create services
  for (const serviceData of Object.values(BIGODE_SERVICES)) {
    const service = await prisma.service.upsert({
      where: { id: serviceData.id },
      update: {},
      create: {
        id: serviceData.id,
        name: serviceData.name,
        durationMin: serviceData.durationMin,
        price: serviceData.price,
        barbershopId: BARBEARIA_BIGODE.id,
      },
    });
    console.log(`  Created service: ${service.name} - R$${serviceData.price}`);
  }

  console.log("\nBarbearia do Bigode seeded successfully!");
}

export async function seedCorteCertoBarbearia() {
  console.log("\nSeeding Corte Certo Barbearia...");

  // Create barbershop
  const barbershop = await prisma.barbershop.upsert({
    where: { id: BARBEARIA_CORTE_CERTO.id },
    update: {},
    create: {
      id: BARBEARIA_CORTE_CERTO.id,
      name: BARBEARIA_CORTE_CERTO.name,
      slug: BARBEARIA_CORTE_CERTO.slug,
      phone: BARBEARIA_CORTE_CERTO.phone,
    },
  });

  console.log(`  Created barbershop: ${barbershop.name} (${barbershop.id})`);

  // Create barber Lucas (works Mon-Fri)
  const lucas = await prisma.barber.upsert({
    where: { id: CORTE_CERTO_BARBERS.lucas.id },
    update: {},
    create: {
      id: CORTE_CERTO_BARBERS.lucas.id,
      name: CORTE_CERTO_BARBERS.lucas.name,
      phone: CORTE_CERTO_BARBERS.lucas.phone,
      barbershopId: BARBEARIA_CORTE_CERTO.id,
    },
  });

  console.log(`  Created barber: ${lucas.name} (${lucas.id})`);

  // Lucas's schedule (Mon-Fri, 09:00-18:00)
  for (const dayOfWeek of [1, 2, 3, 4, 5]) {
    const schedule = await prisma.barberSchedule.upsert({
      where: {
        barberId_dayOfWeek: {
          barberId: lucas.id,
          dayOfWeek,
        },
      },
      update: {},
      create: {
        barberId: lucas.id,
        dayOfWeek,
        startTime: "09:00",
        endTime: "18:00",
        isActive: true,
      },
    });

    await prisma.barberBreak.upsert({
      where: { id: `break-${lucas.id}-${dayOfWeek}` },
      update: {},
      create: {
        id: `break-${lucas.id}-${dayOfWeek}`,
        scheduleId: schedule.id,
        startTime: "12:00",
        endTime: "13:00",
      },
    });
  }

  console.log(
    `  Created schedule for ${lucas.name}: Mon-Fri 09:00-18:00 (lunch 12:00-13:00)`,
  );

  // Create barber Bruno (works Tue-Sat)
  const bruno = await prisma.barber.upsert({
    where: { id: CORTE_CERTO_BARBERS.bruno.id },
    update: {},
    create: {
      id: CORTE_CERTO_BARBERS.bruno.id,
      name: CORTE_CERTO_BARBERS.bruno.name,
      phone: CORTE_CERTO_BARBERS.bruno.phone,
      barbershopId: BARBEARIA_CORTE_CERTO.id,
    },
  });

  console.log(`  Created barber: ${bruno.name} (${bruno.id})`);

  // Bruno's schedule (Tue-Sat, 10:00-19:00)
  for (const dayOfWeek of [2, 3, 4, 5, 6]) {
    await prisma.barberSchedule.upsert({
      where: {
        barberId_dayOfWeek: {
          barberId: bruno.id,
          dayOfWeek,
        },
      },
      update: {},
      create: {
        barberId: bruno.id,
        dayOfWeek,
        startTime: "10:00",
        endTime: "19:00",
        isActive: true,
      },
    });
  }

  console.log(`  Created schedule for ${bruno.name}: Tue-Sat 10:00-19:00`);

  // Create services
  for (const serviceData of Object.values(CORTE_CERTO_SERVICES)) {
    const service = await prisma.service.upsert({
      where: { id: serviceData.id },
      update: {},
      create: {
        id: serviceData.id,
        name: serviceData.name,
        durationMin: serviceData.durationMin,
        price: serviceData.price,
        barbershopId: BARBEARIA_CORTE_CERTO.id,
      },
    });
    console.log(`  Created service: ${service.name} - R$${serviceData.price}`);
  }

  console.log("\nCorte Certo Barbearia seeded successfully!");
}

export async function seedAdmins() {
  console.log("\nSeeding Admin users...");

  // Carlos - Owner of Barbearia do Bigode
  const carlosAdmin = await prisma.admin.upsert({
    where: { id: TEST_ADMINS.carlos_owner.id },
    update: {},
    create: {
      id: TEST_ADMINS.carlos_owner.id,
      email: TEST_ADMINS.carlos_owner.email,
      phone: TEST_ADMINS.carlos_owner.phone,
      name: TEST_ADMINS.carlos_owner.name,
      role: TEST_ADMINS.carlos_owner.role,
      barbershopId: BARBEARIA_BIGODE.id,
    },
  });
  console.log(
    `  Created admin: ${carlosAdmin.name} (${carlosAdmin.role}) - ${carlosAdmin.phone}`,
  );

  // Maria - Manager of Barbearia do Bigode
  const mariaAdmin = await prisma.admin.upsert({
    where: { id: TEST_ADMINS.maria_manager.id },
    update: {},
    create: {
      id: TEST_ADMINS.maria_manager.id,
      email: TEST_ADMINS.maria_manager.email,
      phone: TEST_ADMINS.maria_manager.phone,
      name: TEST_ADMINS.maria_manager.name,
      role: TEST_ADMINS.maria_manager.role,
      barbershopId: BARBEARIA_BIGODE.id,
    },
  });
  console.log(
    `  Created admin: ${mariaAdmin.name} (${mariaAdmin.role}) - ${mariaAdmin.phone}`,
  );

  // Lucas - Owner of Corte Certo
  const lucasAdmin = await prisma.admin.upsert({
    where: { id: TEST_ADMINS.lucas_owner.id },
    update: {},
    create: {
      id: TEST_ADMINS.lucas_owner.id,
      email: TEST_ADMINS.lucas_owner.email,
      phone: TEST_ADMINS.lucas_owner.phone,
      name: TEST_ADMINS.lucas_owner.name,
      role: TEST_ADMINS.lucas_owner.role,
      barbershopId: BARBEARIA_CORTE_CERTO.id,
    },
  });
  console.log(
    `  Created admin: ${lucasAdmin.name} (${lucasAdmin.role}) - ${lucasAdmin.phone}`,
  );

  console.log("\nAdmin users seeded successfully!");
}

export async function seedAllBarbershops() {
  await seedTestBarbershop();
  await seedBarbeariaBigode();
  await seedCorteCertoBarbearia();
  await seedAdmins();

  console.log("\n========================================");
  console.log("All data seeded successfully!");
  console.log("========================================");
  console.log("\nAvailable barbershops:");
  console.log(`  1. ${TEST_BARBERSHOP.name} (${TEST_BARBERSHOP.slug})`);
  console.log(`     - Barbers: John Doe, Jane Smith, Barber Math`);
  console.log(`     - Services: Haircut`);
  console.log(`  2. ${BARBEARIA_BIGODE.name} (${BARBEARIA_BIGODE.slug})`);
  console.log(`     - Barbers: Carlos Silva, Rafael Santos, Fernando Oliveira`);
  console.log(
    `     - Services: Corte, Barba, Combo, Sobrancelha, Pezinho, Hidratação`,
  );
  console.log(
    `  3. ${BARBEARIA_CORTE_CERTO.name} (${BARBEARIA_CORTE_CERTO.slug})`,
  );
  console.log(`     - Barbers: Lucas Ferreira, Bruno Costa`);
  console.log(
    `     - Services: Corte Social, Degradê/Fade, Barba na Navalha, Combo Premium`,
  );

  console.log("\n👤 Test Admins (for WhatsApp OTP login):");
  console.log(
    `  1. ${TEST_ADMINS.carlos_owner.name} - Phone: ${TEST_ADMINS.carlos_owner.phone} (OWNER - Bigode)`,
  );
  console.log(
    `  2. ${TEST_ADMINS.maria_manager.name} - Phone: ${TEST_ADMINS.maria_manager.phone} (MANAGER - Bigode)`,
  );
  console.log(
    `  3. ${TEST_ADMINS.lucas_owner.name} - Phone: ${TEST_ADMINS.lucas_owner.phone} (OWNER - Corte Certo)`,
  );
}

// Run if called directly
const isMainModule = process.argv[1]?.includes("test-barbershop");
if (isMainModule) {
  seedAllBarbershops()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error seeding barbershops:", error);
      process.exit(1);
    });
}
