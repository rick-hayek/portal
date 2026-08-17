'use client';

import type { NavItem } from '@portal/shared';
import {
  Book,
  Briefcase,
  FileText,
  Flame,
  Globe,
  Home,
  Link2,
  Settings,
  User,
  Wrench,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import { UserMenu } from '../../auth/UserMenu';
import { SearchDialog } from '../../search/SearchDialog';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { ThemeSwitcher } from '../ThemeSwitcher';

const getNavIcon = (href: string) => {
  switch (href) {
    case '/':
      return <Home className="h-4 w-4 shrink-0" />;
    case '/blog':
      return <FileText className="h-4 w-4 shrink-0" />;
    case '/trending':
      return <Flame className="h-4 w-4 shrink-0" />;
    case '/portfolio':
      return <Briefcase className="h-4 w-4 shrink-0" />;
    case '/books':
      return <Book className="h-4 w-4 shrink-0" />;
    case '/links':
      return <Link2 className="h-4 w-4 shrink-0" />;
    case '/tools':
      return <Wrench className="h-4 w-4 shrink-0" />;
    case '/about':
      return <User className="h-4 w-4 shrink-0" />;
    case '/admin':
      return <Settings className="h-4 w-4 shrink-0" />;
    default:
      return <Globe className="h-4 w-4 shrink-0" />;
  }
};

export interface HeaderProps {
  siteTitle: string;
  navItems: NavItem[];
}

export function ClassicHeader({ siteTitle, navItems }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const t = useTranslations('Navigation');
  const { data: session } = useSession();
  const pathname = usePathname();

  const headerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);

  // Close mobile drawer menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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

  // Scroll-direction auto-hide on mobile (< 768px)
  useEffect(() => {
    const THRESHOLD = 10;

    const onScroll = () => {
      if (window.innerWidth >= 768) {
        if (isHidden) setIsHidden(false);
        return;
      }

      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      if (currentY < 56) {
        setIsHidden(false);
      } else if (delta > THRESHOLD) {
        if (!mobileOpen) setIsHidden(true);
      } else if (delta < -THRESHOLD) {
        setIsHidden(false);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [mobileOpen, isHidden]);

  const headerBgClass =
    'border-b border-compat bg-[var(--portal-color-background-glass)] backdrop-blur-xl backdrop-saturate-150';
  const logoTextClass =
    'gap-2 font-bold text-[var(--portal-color-text)] text-[1.1rem] tracking-tight';
  const logoIconBoxClass =
    'h-7 w-7 rounded-lg bg-[var(--portal-color-primary)] text-white text-[14px]';
  const navLinkTextClass = 'text-[0.82rem] tracking-tight';
  const navLinkActiveClass = 'font-bold text-[var(--portal-color-primary)]';
  const navLinkInactiveClass =
    'font-medium text-[var(--portal-color-text-tertiary)] hover:text-[var(--portal-color-text)]';
  const hamburgerButtonClass =
    'text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-background)] rounded-md';
  const drawerBgClass =
    'border-b border-[var(--portal-color-border)] bg-[var(--portal-color-surface)]';
  const drawerNavLinkClass = 'rounded-md';
  const drawerNavLinkActiveClass =
    'bg-[var(--portal-color-surface-alt)] text-[var(--portal-color-primary)] font-bold';
  const drawerNavLinkInactiveClass =
    'text-[var(--portal-color-text-tertiary)] hover:bg-[var(--portal-color-surface-alt)] hover:text-[var(--portal-color-text)] font-medium';
  const searchDialogClass =
    'flex w-48 items-center gap-2 rounded-full border border-compat bg-[var(--portal-color-surface)] text-[var(--portal-color-text-secondary)] transition-colors hover:border-[var(--portal-color-primary)] hover:text-[var(--portal-color-text)] py-2 px-3 text-[0.78rem]';

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 w-full h-14 flex justify-center transition-transform duration-300 ease-in-out md:translate-y-0 ${headerBgClass} ${
          isHidden ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="flex h-full items-center justify-between px-4 md:px-8 w-full">
          {/* Logo / Mobile Back Button */}
          <div ref={logoRef} className="flex items-center gap-2 shrink-0">
            {detailParent ? (
              <>
                <Link
                  href="/"
                  className={`hidden md:flex items-center transition-colors no-underline ${logoTextClass}`}
                >
                  <span className={`flex items-center justify-center ${logoIconBoxClass}`}>
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
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
                <Link
                  href={detailParent.href as any}
                  className="flex md:hidden items-center gap-2 font-bold transition-colors no-underline text-base text-[var(--portal-color-text)] hover:text-[var(--portal-color-primary)]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full text-xs border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] text-[var(--portal-color-text-secondary)] shadow-xs">
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
              <Link
                href="/"
                className={`flex items-center transition-colors no-underline ${logoTextClass}`}
              >
                <span className={`flex items-center justify-center ${logoIconBoxClass}`}>
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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

          {/* Desktop Nav Links */}
          <nav ref={navRef} className="hidden items-center gap-4 lg:gap-8 md:flex shrink-0">
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
                  className={`transition-colors whitespace-nowrap ${navLinkTextClass} ${
                    isActive ? navLinkActiveClass : navLinkInactiveClass
                  }`}
                >
                  {translatedLabel}
                </Link>
              );
            })}
          </nav>

          {/* Right Side (Search Icon + ≡ Hamburger Button) */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-colors md:hidden bg-[var(--portal-color-primary-soft)] border border-[var(--portal-color-primary)]/30 text-[var(--portal-color-primary)] hover:bg-[var(--portal-color-primary)] hover:text-white"
              >
                <Settings className="h-3.5 w-3.5" />
                <span>{t('admin')}</span>
              </Link>
            )}

            <SearchDialog
              className="flex h-9 w-9 items-center justify-center text-[var(--portal-color-text-secondary)] hover:text-[var(--portal-color-text)] transition-colors cursor-pointer"
              showLabel={false}
            />

            <button
              className={`flex h-9 w-9 items-center justify-center transition-colors cursor-pointer ${hamburgerButtonClass}`}
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

        {/* Drawer Menu */}
        {mobileOpen && (
          <div
            className={`absolute top-14 left-0 right-0 z-40 px-6 py-3 shadow-lg ${drawerBgClass}`}
          >
            <nav className="flex flex-col gap-1 md:hidden">
              {displayNavItems
                .filter((item) => !(isAdmin && item.href === '/admin'))
                .map((item) => {
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
                      className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors ${drawerNavLinkClass} ${
                        isActive ? drawerNavLinkActiveClass : drawerNavLinkInactiveClass
                      }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {getNavIcon(item.href)}
                      <span>{translatedLabel}</span>
                    </Link>
                  );
                })}
            </nav>

            <div className="my-2.5 border-t md:hidden border-[var(--portal-color-border)]" />

            <div className="py-0 flex flex-row items-center justify-start md:justify-center gap-2.5 sm:gap-3 px-2 md:px-3 w-full">
              <LanguageSwitcher onItemClick={() => setMobileOpen(false)} />
              <ThemeSwitcher onItemClick={() => setMobileOpen(false)} />
              <div className="hidden md:block">
                <UserMenu
                  showDetails={true}
                  align="right"
                  onItemClick={() => setMobileOpen(false)}
                />
              </div>
            </div>

            {/* Mobile UserMenu on separate last row */}
            <div className="md:hidden border-t mt-2.5 pt-3 pb-0 px-2 border-[var(--portal-color-border)]/60">
              <UserMenu showDetails={true} align="left" onItemClick={() => setMobileOpen(false)} />
            </div>
          </div>
        )}
      </header>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-xs transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
