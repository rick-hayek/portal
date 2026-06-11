import type { AppRouter } from '@portal/api';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

function getBaseUrl() {
  if (typeof window !== 'undefined') return '';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  // Server-side: use localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

/** Vanilla tRPC client for server components & route handlers */
export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
});
