'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export function UserMenu() {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return (
            <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--portal-color-border)]" />
        );
    }

    if (!session) {
        return (
            <button
                onClick={() => signIn()}
                className="rounded-md border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)]
                   px-3 py-1.5 text-sm text-[var(--portal-color-text)]
                   transition-colors hover:border-[var(--portal-color-primary)] hover:text-[var(--portal-color-primary)]"
            >
                Sign In
            </button>
        );
    }

    return (
        <div className="relative flex items-center gap-2">
            {session.user.image ? (
                <img
                    src={session.user.image}
                    alt={session.user.name ?? 'User'}
                    className="h-8 w-8 rounded-full border border-[var(--portal-color-border)]"
                />
            ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--portal-color-primary)] text-sm font-bold text-white">
                    {(session.user.name ?? session.user.email ?? 'U')[0].toUpperCase()}
                </div>
            )}
            <button
                onClick={() => signOut()}
                className="text-xs text-[var(--portal-color-text-secondary)] transition-colors hover:text-[var(--portal-color-primary)]"
                title="Sign out"
            >
                ✕
            </button>
        </div>
    );
}
