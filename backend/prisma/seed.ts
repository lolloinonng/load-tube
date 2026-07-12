import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
}

main()
  .then(() => {
    console.log('Seed completed');
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error('Seed failed:', e);
    return prisma.$disconnect();
  });
