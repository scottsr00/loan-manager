import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    // Truncate tables to remove all data
    await prisma.$executeRaw`TRUNCATE TABLE "LenderPosition" CASCADE;`;
    await prisma.$executeRaw`TRUNCATE TABLE "Inventory" CASCADE;`;

    console.log('All data has been removed from the database.');
  } catch (error) {
    console.error('Error clearing the database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase(); 