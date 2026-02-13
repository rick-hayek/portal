import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { prisma } from '@portal/db';

/**
 * tRPC Context — provides Prisma client to all procedures.
 * In Phase 3, session/auth will be added here.
 */
export async function createContext() {
    return { prisma };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
    transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;
