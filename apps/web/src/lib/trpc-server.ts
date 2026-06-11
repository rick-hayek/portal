import { appRouter, createContext } from '@portal/api';
import { auth } from '@/auth';
import { cache } from 'react';

/**
 * Direct server-side tRPC caller.
 * Used in Next.js Server Components to bypass HTTP/network overhead
 * and query the database directly.
 */
export const getTRPCServer = cache(async () => {
  const session = await auth();
  const ctx = await createContext({ session });
  return appRouter.createCaller(ctx);
});
