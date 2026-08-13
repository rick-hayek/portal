'use client';

import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Link, usePathname, useRouter } from '@/i18n/routing';

interface UserMenuProps {
  showDetails?: boolean;
  responsive?: boolean;
  align?: 'left' | 'right' | 'center';
  onItemClick?: () => void;
}

export function UserMenu({
  showDetails = false,
  responsive = false,
  align = 'right',
  onItemClick,
}: UserMenuProps) {
  const { data: session, status } = useSession();
  const t = useTranslations('Navigation');
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const closeMenu = () => setIsOpen(false);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [isOpen]);

  if (responsive) {
    return (
      <>
        {/* Mobile: Circle Icon Only */}
        <div className="md:hidden">
          <UserMenu showDetails={false} align={align} onItemClick={onItemClick} />
        </div>
        {/* Desktop / Medium: Full Card Details */}
        <div className="hidden md:block">
          <UserMenu showDetails={true} align={align} onItemClick={onItemClick} />
        </div>
      </>
    );
  }

  const handleSignIn = () => {
    onItemClick?.();
    router.push(`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`);
  };

  if (status === 'loading') {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--portal-color-border)]" />;
  }

  if (!session) {
    if (showDetails) {
      return (
        <button
          type="button"
          onClick={handleSignIn}
          className={`flex items-center gap-3 py-1 focus:outline-none cursor-pointer group ${
            align === 'center' ? 'mx-auto justify-center' : 'w-full'
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--portal-color-surface-alt)] text-[var(--portal-color-text-secondary)] border border-compat shrink-0">
            👤
          </div>
          <span className="text-xs font-semibold text-[var(--portal-color-text)] group-hover:text-[var(--portal-color-primary)] transition-colors">
            {t('signIn')}
          </span>
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={handleSignIn}
        className="rounded-full bg-[var(--portal-color-text)] text-[0.78rem] font-semibold text-[var(--portal-color-background)] transition-all hover:bg-[var(--portal-color-primary)] hover:text-white cursor-pointer"
        style={{ padding: '.35rem 1rem' }}
      >
        {t('signIn')}
      </button>
    );
  }

  const userInitial = (session.user.name ?? session.user.email ?? 'U')[0].toUpperCase();

  return (
    <div className={`relative ${showDetails && align !== 'center' ? 'w-full' : ''}`}>
      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`flex items-center focus:outline-none focus:ring-0 cursor-pointer ${
          showDetails
            ? align === 'center'
              ? 'mx-auto justify-center gap-3 py-1.5 px-4 rounded-xl border border-compat bg-[var(--portal-color-surface-alt)]/50 hover:bg-[var(--portal-color-surface-alt)] transition-colors'
              : 'w-full justify-between gap-3 py-1'
            : 'gap-1.5'
        }`}
        aria-label="User menu"
      >
        <div className="flex items-center gap-3 min-w-0">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name ?? 'User'}
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded-full border border-compat object-cover hover:border-[var(--portal-color-primary)] transition-colors"
            />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--portal-color-primary)] text-sm font-bold text-white hover:opacity-90 transition-opacity">
              {userInitial}
            </div>
          )}

          {showDetails && (
            <div className="flex flex-col text-left min-w-0">
              <span className="text-xs font-bold text-[var(--portal-color-text)] truncate">
                {session.user.name ?? 'User'}
              </span>
              {session.user.email && (
                <span className="text-[10px] text-[var(--portal-color-text-secondary)] truncate">
                  {session.user.email}
                </span>
              )}
            </div>
          )}
        </div>

        <svg
          className={`h-3 w-3 text-[var(--portal-color-text-secondary)] shrink-0 transition-transform duration-200 ${
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
          className={`absolute top-full mt-2 z-50 w-44 rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] py-1 shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150 ${
            align === 'center'
              ? 'left-1/2 -translate-x-1/2 origin-top'
              : align === 'left'
                ? 'left-0 origin-top-left'
                : 'right-0 origin-top-right'
          }`}
        >
          {!showDetails && (
            <div className="px-3.5 py-2 border-b border-[var(--portal-color-border)]/60 text-left">
              <p className="text-xs font-semibold text-[var(--portal-color-text)] truncate">
                {session.user.name ?? 'User'}
              </p>
              <p className="text-[10px] text-[var(--portal-color-text-secondary)] truncate">
                {session.user.email}
              </p>
            </div>
          )}

          <div className="py-1">
            {/* Profile & Password link */}
            <Link
              href="/profile"
              onClick={() => {
                setIsOpen(false);
                onItemClick?.();
              }}
              className="flex w-full items-center px-3.5 py-1.5 text-xs text-[var(--portal-color-text)] hover:bg-[var(--portal-color-surface-alt)] no-underline"
            >
              <span className="mr-2">👤</span>
              {t('profile')}
            </Link>

            {/* Admin panel link */}
            {session.user.role === 'admin' && (
              <Link
                href="/admin"
                onClick={() => {
                  setIsOpen(false);
                  onItemClick?.();
                }}
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
              type="button"
              onClick={() => {
                setIsOpen(false);
                onItemClick?.();
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
