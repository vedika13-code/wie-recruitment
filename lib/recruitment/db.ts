import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

// Next.js dev-mode hot-reloads modules, unlike the old Express server — cache the client
// on `globalThis` across reloads so we don't open a fresh Postgres connection pool every
// time a file changes (see docs/DECISIONS.md's Prisma-7-adapter entry for why the adapter
// itself, not just the client, is required as of Prisma 7).
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const prisma = globalThis.__prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}

export default prisma;
