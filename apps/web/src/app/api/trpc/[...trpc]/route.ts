import { appRouter, createContext } from '@portal/api';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import { auth } from '@/auth';

const handler = async (req: Request) => {
  const session = await auth();
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () =>
      createContext({
        session,
        unstable_cache,
        revalidateTag,
        revalidatePath,
      }),
  });
};

export { handler as GET, handler as POST };
