'use client';

import type { NavItem } from '@portal/shared';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import { UserMenu } from '../auth/UserMenu';
import { SearchDialog } from '../search/SearchDialog';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';

interface HeaderProps {
  siteTitle: string;
  navItems: NavItem[];
}

export function Header({ siteTitle, navItems }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = useTranslations('Navigation');
  const { data: session } = useSession();
  const pathname = usePathname();

  const isAdmin = session?.user?.role === 'admin';
  const displayNavItems = isAdmin ? [...navItems, { href: '/admin', label: 'Admin' }] : navItems;

  const getDetailParent = (path: string): { href: string; labelKey: string } | null => {
    const cleanPath = path.split('?')[0];
    if (cleanPath.startsWith('/blog/') && cleanPath !== '/blog') {
      return { href: '/blog', labelKey: 'blog' };
    }
    if (cleanPath.startsWith('/portfolio/') && cleanPath !== '/portfolio') {
      return { href: '/portfolio', labelKey: 'portfolio' };
    }
    if (cleanPath.startsWith('/books/') && cleanPath !== '/books') {
      return { href: '/books', labelKey: 'books' };
    }
    if (cleanPath.startsWith('/tools/') && cleanPath !== '/tools') {
      return { href: '/tools', labelKey: 'tools' };
    }
    return null;
  };

  const detailParent = getDetailParent(pathname);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full h-14 border-b border-compat flex justify-center px-4 md:px-8 bg-[var(--portal-color-background-glass)] backdrop-blur-xl backdrop-saturate-150">
        <div className="flex h-full w-full items-center justify-between px-0">
          {/* Logo / Mobile Back Button */}
          <div className="flex items-center gap-2">
            {detailParent ? (
              <>
                {/* On Desktop: Always render site Logo */}
                <Link
                  href="/"
                  className="hidden md:flex items-center gap-2 font-bold text-[var(--portal-color-text)] no-underline text-[1.1rem] tracking-tight"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--portal-color-primary)] text-white text-[14px]">
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                      />
                    </svg>
                  </span>
                  {siteTitle}
                </Link>

                {/* On Mobile in detail pages: Render Back Button */}
                <Link
                  href={detailParent.href as any}
                  className="flex md:hidden items-center gap-2 font-bold text-[var(--portal-color-text)] hover:text-[var(--portal-color-primary)] transition-colors no-underline text-base"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] text-[var(--portal-color-text-secondary)] shadow-xs">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                  </span>
                  <span className="text-[0.95rem]">
                    {t.has(detailParent.labelKey as any)
                      ? t(detailParent.labelKey as any)
                      : detailParent.labelKey}
                  </span>
                </Link>
              </>
            ) : (
              /* On non-detail pages: Always render site Logo */
              <Link
                href="/"
                className="flex items-center gap-2 font-bold text-[var(--portal-color-text)] no-underline text-[1.1rem] tracking-tight"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--portal-color-primary)] text-white text-[14px]">
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                </span>
                {siteTitle}
              </Link>
            )}
          </div>

          {/* Desktop/Tablet Nav Links */}
          <nav className="hidden items-center gap-4 lg:gap-8 md:flex">
            {displayNavItems.map((item) => {
              const labelKey = item.label.toLowerCase() as any;
              const translatedLabel = t.has(labelKey) ? t(labelKey) : item.label;
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.href}
                  href={item.href as any}
                  className={`transition-colors text-[0.82rem] tracking-tight ${isActive
                      ? 'font-semibold text-[var(--portal-color-primary)]'
                      : 'font-medium text-[var(--portal-color-text-secondary)] hover:text-[var(--portal-color-primary)]'
                    }`}
                >
                  {translatedLabel}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden items-center gap-3 lg:flex">
              <SearchDialog />
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>
            <UserMenu />

            {/* Mobile/Tablet Menu Toggle */}
            <button
              className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-background)] lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
            >
              <span className="sr-only">Toggle menu</span>
              {mobileOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Nav Drawer */}
        {mobileOpen && (
          <div className="absolute top-14 left-0 right-0 z-40 border-b border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-6 py-4 shadow-lg lg:hidden">
            {/* Main Navigation Links (Visible only below md) */}
            <nav className="flex flex-col gap-1 md:hidden">
              {displayNavItems.map((item) => {
                const labelKey = item.label.toLowerCase() as any;
                const translatedLabel = t.has(labelKey) ? t(labelKey) : item.label;
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname === item.href || pathname.startsWith(item.href + '/');

                return (
                  <Link
                    key={item.href}
                    href={item.href as any}
                    className={`rounded-md px-3 py-2 text-sm transition-colors ${isActive
                        ? 'bg-[var(--portal-color-background)] text-[var(--portal-color-primary)] font-semibold'
                        : 'text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-background)] hover:text-[var(--portal-color-primary)] font-[500]'
                      }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {translatedLabel}
                  </Link>
                );
              })}
            </nav>

            {/* Top Divider (Visible only below md) */}
            <div className="mt-3 border-t border-[var(--portal-color-border)] md:hidden" />

            {/* Settings Actions: Search, Language, Theme (Visible below lg) */}
            <div className="pt-4 flex flex-row items-center justify-center gap-3 px-3 w-full">
              <SearchDialog
                className="flex w-36 items-center gap-2 rounded-full border border-compat bg-[var(--portal-color-surface)] text-[var(--portal-color-text-secondary)] transition-colors hover:border-[var(--portal-color-primary)] hover:text-[var(--portal-color-text)] py-2 px-3 text-[0.78rem]"
                showLabel={true}
              />
              <LanguageSwitcher />
              <ThemeSwitcher iconOnly={true} />
            </div>
          </div>
        )}
      </header>

      {/* Backdrop for closing menu on outside click - Rendered as sibling to bypass header backdrop-filter containing block constraint */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
