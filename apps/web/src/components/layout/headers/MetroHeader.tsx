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

export function MetroHeader({ siteTitle, navItems }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const t = useTranslations('Navigation');
  const { data: session } = useSession();
  const pathname = usePathname();

  const headerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);

  // Lock dark theme when in Metro layout
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

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

  const headerBgClass = 'border-b-2 border-[#333535] bg-[#121414]/90 backdrop-blur-md';
  const logoTextClass =
    'gap-2.5 font-mono font-black text-base sm:text-lg uppercase tracking-[0.25em] text-[#fbbc00] hover:text-[#ffd65c]';
  const logoIconBoxClass = 'h-7.5 w-7.5 rounded-md bg-[#fbbc00] text-[#121414] shadow-xs';
  const logoSvgClass = 'h-4.5 w-4.5 stroke-[2.5]';
  const navLinkTextClass = 'font-mono text-[0.78rem] uppercase tracking-wider';
  const navLinkActiveClass = 'font-extrabold text-[#00e3fd]';
  const navLinkInactiveClass = 'font-medium text-[#9c8f78] hover:text-[#00e3fd]';
  const hamburgerButtonClass = 'text-[#e2e2e2] hover:bg-[#1e2020] rounded-none';
  const drawerBgClass = 'border-b border-[#333535] bg-[#121414] text-[#e2e2e2]';
  const drawerNavLinkClass = 'rounded-none font-mono uppercase tracking-wider';
  const drawerNavLinkActiveClass = 'bg-[#1e2020] text-[#00e3fd] font-bold';
  const drawerNavLinkInactiveClass =
    'text-[#9c8f78] hover:bg-[#1a1c1c] hover:text-[#00e3fd] font-medium';
  const searchDialogClass =
    'flex w-48 items-center gap-2 rounded-none border border-[#333535] bg-[#1a1c1c] text-[#9c8f78] hover:text-[#00e3fd] hover:border-[#00e3fd] transition-colors py-2 px-3 text-[0.78rem] font-mono';

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 w-full h-14 flex justify-center transition-transform duration-300 ease-in-out md:translate-y-0 ${headerBgClass} ${
          isHidden ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="flex h-full items-center justify-between max-w-[1400px] mx-auto px-4 sm:px-8 w-full">
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
                      className={logoSvgClass}
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
                  className="flex md:hidden items-center gap-2 font-bold transition-colors no-underline text-base text-[#e2e2e2] hover:text-[#fbbc00]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full text-xs border border-[#333535] bg-[#1a1c1c] text-[#9c8f78]">
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
                  <span className="font-mono text-xs uppercase">
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
                    className={logoSvgClass}
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
          <nav
            ref={navRef}
            className="hidden items-center gap-4 lg:gap-8 md:flex shrink-0 ml-auto mr-4 sm:mr-6"
          >
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
                className="flex items-center gap-1.5 rounded-none px-3 py-1 text-xs font-bold transition-colors md:hidden bg-[#1e2020] border border-[#333535] text-[#00e3fd]"
              >
                <Settings className="h-3.5 w-3.5" />
                <span>{t('admin')}</span>
              </Link>
            )}

            <SearchDialog
              className="flex h-9 w-9 items-center justify-center text-[#9c8f78] hover:text-[#00e3fd] transition-colors cursor-pointer"
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

            <div className="my-2.5 border-t md:hidden border-[#333535]" />

            <div className="py-0 flex flex-row items-center justify-start md:justify-center gap-2.5 sm:gap-3 px-2 md:px-3 w-full">
              <LanguageSwitcher onItemClick={() => setMobileOpen(false)} />
              <div className="hidden md:block">
                <UserMenu
                  showDetails={true}
                  align="right"
                  onItemClick={() => setMobileOpen(false)}
                />
              </div>
            </div>

            {/* Mobile UserMenu on separate last row */}
            <div className="md:hidden border-t mt-2 pt-1.5 pb-0 px-2 border-[#333535]">
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
