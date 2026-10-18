import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export const checkDatabaseConnection = async (): Promise<boolean> => {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      if (attempt === 3) {
        console.warn('[Database] Could not connect to PostgreSQL:', error instanceof Error ? error.message : error);
        return false;
      }
      // Neon cloud databases auto-suspend when idle; wait 2s for compute wake-up
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  return false;
};
