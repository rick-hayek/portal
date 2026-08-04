import { appRouter, createCallerFactory, createContext } from '@portal/api';
import { prisma } from '@portal/db';
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';

const createCaller = createCallerFactory(appRouter);

export interface ApiAuthResult {
  session: {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    expires: string;
  } | null;
  caller: ReturnType<typeof createCaller>;
}

export async function authenticateRequest(req: Request): Promise<ApiAuthResult | null> {
  const apiKey =
    req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '');

  if (!apiKey || !process.env.ADMIN_API_KEY || apiKey !== process.env.ADMIN_API_KEY) {
    return null;
  }

  // Find the first admin user in the database
  const adminUser = await prisma.user.findFirst({
    where: { role: 'admin' },
    select: { id: true, email: true, name: true, image: true },
  });

  if (!adminUser) {
    return null;
  }

  const session = {
    user: {
      id: adminUser.id,
      role: 'admin',
      name: adminUser.name,
      email: adminUser.email,
      image: adminUser.image,
    },
    expires: new Date(Date.now() + 3600 * 1000).toISOString(),
  };

  const context = await createContext({
    session,
    unstable_cache,
    revalidateTag,
    revalidatePath,
  });

  const caller = createCaller(context);

  return { session, caller };
}

/**
 * Creates a public context/caller (without admin session) for read-only routes.
 */
export async function getPublicCaller() {
  const context = await createContext({
    session: null,
    unstable_cache,
    revalidateTag,
    revalidatePath,
  });
  return createCaller(context);
}
