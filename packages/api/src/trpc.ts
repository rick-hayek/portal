import { prisma } from '@portal/db';
import type { SiteConfig } from '@portal/shared';
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';

/**
 * tRPC Context — provides Prisma client and optional session to all procedures.
 */
export async function createContext(opts?: {
  req?: Request;
  session?: {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    expires: string;
  } | null;
  siteConfig?: SiteConfig;
  revalidateTag?: (...args: any[]) => any;
  revalidatePath?: (...args: any[]) => any;
  unstable_cache?: (...args: any[]) => any;
}) {
  let clientIp = '127.0.0.1';
  if (opts?.req) {
    const cfIp = opts.req.headers.get('cf-connecting-ip');
    const forwardedFor = opts.req.headers.get('x-forwarded-for');
    const realIp = opts.req.headers.get('x-real-ip');
    if (cfIp) {
      clientIp = cfIp.trim();
    } else if (forwardedFor) {
      clientIp = forwardedFor.split(',')[0]?.trim() || '127.0.0.1';
    } else if (realIp) {
      clientIp = realIp.trim();
    }
  }

  return {
    prisma,
    session: opts?.session ?? null,
    req: opts?.req,
    siteConfig: opts?.siteConfig,
    clientIp,
    revalidateTag: opts?.revalidateTag,
    revalidatePath: opts?.revalidatePath,
    unstable_cache: opts?.unstable_cache,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const mergeRouters = t.mergeRouters;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;
export const createCallerFactory = t.createCallerFactory;

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
