import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Singleton Instance
 * Ensures only one instance of Prisma Client exists,
 * especially in hot-reloading development environments.
 */

// A note on storing PrismaClient on globalThis (useful conceptually)
// var global: typeof globalThis & { prisma?: PrismaClient }

let prisma;

if (process.env.NODE_ENV === 'production') {
  // In production, create a new instance (hot-reloading is not an issue)
  // We will use a simple instance, as hot-reloading is not a concern in production.
  prisma = new PrismaClient();
} else {
  // In development, reuse a global instance to avoid re-instantiation
  // If global.prisma already exists, use it, otherwise create a new instance and store it on the global object.
  
  if (!global.prisma) {
    global.prisma = new PrismaClient();
    console.log('✨ New Prisma Client instance created (Development).');
  } else {
    console.log('🔁 Reusing existing Prisma Client instance (Development).');
  }
  
  prisma = global.prisma;
}

export default prisma;