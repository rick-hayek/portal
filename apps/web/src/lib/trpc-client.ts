import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '@portal/api';

function getBaseUrl() {
    if (typeof window !== 'undefined') return '';
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
