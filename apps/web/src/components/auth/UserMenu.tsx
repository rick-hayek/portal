'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--portal-color-border)]" />;
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn()}
        className="rounded-full bg-[var(--portal-color-text)] text-[0.78rem] font-semibold text-white transition-all hover:bg-[var(--portal-color-primary)]"
        style={{ padding: '.35rem 1rem' }}
      >
        Sign In
      </button>
    );
  }

  return (
    <div className="relative flex items-center gap-2">
      {session.user.image ? (
        <Image
          src={session.user.image}
          alt={session.user.name ?? 'User'}
          width={32}
          height={32}
          className="h-8 w-8 rounded-full border border-compat object-cover"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--portal-color-primary)] text-sm font-bold text-white">
          {(session.user.name ?? session.user.email ?? 'U')[0].toUpperCase()}
        </div>
      )}
      <button
        onClick={() => signOut()}
        className="text-xs text-[var(--portal-color-text-secondary)] transition-colors hover:text-[var(--portal-color-primary)] cursor-pointer font-medium"
        title="Sign out"
        aria-label="Sign out"
      >
        Sign Out
      </button>
    </div>
  );
}
