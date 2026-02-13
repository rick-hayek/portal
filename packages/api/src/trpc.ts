import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { prisma } from '@portal/db';

/**
 * tRPC Context — provides Prisma client and optional session to all procedures.
 */
export async function createContext(opts?: {
    session?: {
        user: { id: string; role: string; name?: string | null; email?: string | null; image?: string | null };
        expires: string;
    } | null;
}) {
    return {
        prisma,
        session: opts?.session ?? null,
    };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
    transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

/** Requires authenticated user */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
    if (!ctx.session?.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
    }
    return next({
        ctx: { ...ctx, user: ctx.session.user },
    });
});

/** Requires admin role */
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
    if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
    }
    return next();
});
