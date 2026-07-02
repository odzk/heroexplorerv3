import { PrismaClient } from '@prisma/client';
import { isDev } from './env';

// ============================================================================
// Prisma client singleton.
// A single instance is reused across the process (and across hot reloads in
// dev via globalThis) to avoid exhausting the Postgres connection pool.
// ============================================================================

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isDev ? ['warn', 'error'] : ['error'],
  });

if (isDev) globalForPrisma.prisma = prisma;

export default prisma;
