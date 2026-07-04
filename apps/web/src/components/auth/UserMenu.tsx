'use client';

import Image from 'next/image';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';

export function UserMenu() {
  const { data: session, status } = useSession();
  const t = useTranslations('Navigation');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const closeMenu = () => setIsOpen(false);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [isOpen]);

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
        {t('signIn')}
      </button>
    );
  }

  const userInitial = (session.user.name ?? session.user.email ?? 'U')[0].toUpperCase();

  return (
    <div className="relative">
      {/* Dropdown Trigger */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-1.5 focus:outline-none focus:ring-0 cursor-pointer"
        aria-label="User menu"
      >
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name ?? 'User'}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full border border-compat object-cover hover:border-[var(--portal-color-primary)] transition-colors"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--portal-color-primary)] text-sm font-bold text-white hover:opacity-90 transition-opacity">
            {userInitial}
          </div>
        )}
        <svg
          className={`h-3 w-3 text-[var(--portal-color-text-secondary)] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-10 z-50 w-44 origin-top-right rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] py-1 shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* User brief info */}
          <div className="px-3.5 py-2 border-b border-[var(--portal-color-border)]/60 text-left">
            <p className="text-xs font-semibold text-[var(--portal-color-text)] truncate">
              {session.user.name ?? 'User'}
            </p>
            <p className="text-[10px] text-[var(--portal-color-text-secondary)] truncate">
              {session.user.email}
            </p>
          </div>

          <div className="py-1">
            {/* Profile & Password link */}
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center px-3.5 py-1.5 text-xs text-[var(--portal-color-text)] hover:bg-[var(--portal-color-surface-alt)] no-underline"
            >
              <span className="mr-2">👤</span>
              {t('profile')}
            </Link>

            {/* Admin panel link */}
            {session.user.role === 'admin' && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center px-3.5 py-1.5 text-xs text-[var(--portal-color-text)] hover:bg-[var(--portal-color-surface-alt)] no-underline"
              >
                <span className="mr-2">⚙️</span>
                {t('admin')}
              </Link>
            )}
          </div>

          <div className="border-t border-[var(--portal-color-border)]/60 py-1">
            {/* Logout button */}
            <button
              onClick={() => {
                setIsOpen(false);
                signOut();
              }}
              className="flex w-full items-center px-3.5 py-1.5 text-xs text-red-500 hover:bg-red-500/5 hover:text-red-600 font-medium text-left cursor-pointer"
            >
              <span className="mr-2">🚪</span>
              {t('signOut')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
