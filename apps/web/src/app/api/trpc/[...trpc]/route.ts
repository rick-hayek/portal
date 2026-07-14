import { appRouter, createContext } from '@portal/api';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { auth } from '@/auth';
import { unstable_cache, revalidateTag, revalidatePath } from 'next/cache';

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
