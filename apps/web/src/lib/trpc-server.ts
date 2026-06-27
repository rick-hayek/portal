import { appRouter, createContext } from '@portal/api';
import { cache } from 'react';
import { auth } from '@/auth';

/**
 * Direct server-side tRPC caller.
 * Set `useAuth: true` only when calling protected procedures (e.g. in admin pages).
 * For public pages, leave it as `false` to avoid Next-Auth cookie/session verification overhead.
 */
export const getTRPCServer = cache(async (useAuth = false) => {
  const session = useAuth ? await auth() : null;
  const ctx = await createContext({ session });
  return appRouter.createCaller(ctx);
});
