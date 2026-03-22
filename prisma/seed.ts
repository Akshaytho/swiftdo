import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Test@1234', 12);

  // Buyer
  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@swiftdo.test' },
    update: {},
    create: {
      email: 'buyer@swiftdo.test',
      name: 'Test Buyer',
      passwordHash,
      role: 'BUYER',
      buyerProfile: { create: {} },
    },
  });

  // Worker
  const worker = await prisma.user.upsert({
    where: { email: 'worker@swiftdo.test' },
    update: {},
    create: {
      email: 'worker@swiftdo.test',
      name: 'Test Worker',
      passwordHash,
      role: 'WORKER',
      workerProfile: { create: {} },
    },
  });

  // Citizen
  const citizen = await prisma.user.upsert({
    where: { email: 'citizen@swiftdo.test' },
    update: {},
    create: {
      email: 'citizen@swiftdo.test',
      name: 'Test Citizen',
      passwordHash,
      role: 'CITIZEN',
    },
  });

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@swiftdo.test' },
    update: {},
    create: {
      email: 'admin@swiftdo.test',
      name: 'Test Admin',
      passwordHash,
      role: 'ADMIN',
    },
  });

  console.log('Seed data created:');
  console.log(`  Buyer:   ${buyer.email} (${buyer.id})`);
  console.log(`  Worker:  ${worker.email} (${worker.id})`);
  console.log(`  Citizen: ${citizen.email} (${citizen.id})`);
  console.log(`  Admin:   ${admin.email} (${admin.id})`);
  console.log('  Password for all: Test@1234');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
