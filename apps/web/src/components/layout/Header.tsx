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
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import siteConfig from '@/site.config';
import { UserMenu } from '../auth/UserMenu';
import { SearchDialog } from '../search/SearchDialog';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';

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

interface HeaderProps {
  siteTitle: string;
  navItems: NavItem[];
}

export function Header({ siteTitle, navItems }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  /** true when the right-side controls (Search/Language/Theme) need to collapse */
  const [isCompact, setIsCompact] = useState(false);
  /** true when the header should slide out of view (scroll-down) */
  const [isHidden, setIsHidden] = useState(false);
  const t = useTranslations('Navigation');
  const { data: session } = useSession();
  const pathname = usePathname();

  const isMetro = siteConfig.homeLayout === 'metro';

  const headerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  // Lock dark theme when in Metro layout
  useEffect(() => {
    if (isMetro) {
      document.documentElement.classList.add('dark');
    }
  }, [isMetro]);

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

  // ---------------------------------------------------------------------------
  // Overflow detection — loop-free.
  //
  // We measure each section's *intrinsic* width independently, so the result
  // never depends on the current isCompact state:
  //   logo        → logoRef.getBoundingClientRect().width
  //   nav         → navRef.scrollWidth  (content width, unaffected by flex)
  //   controls    → measured via position:absolute so it's always intrinsic
  //   userMenu    → userMenuRef.getBoundingClientRect().width
  //
  // Summing them + gaps gives the "expanded needed width". We compare this
  // against header.clientWidth. Because the sum is constant for any given
  // viewport width (independent of isCompact), there is no feedback loop.
  // ---------------------------------------------------------------------------
  const measure = useCallback(() => {
    const header = headerRef.current;
    const logo = logoRef.current;
    const nav = navRef.current;
    const controls = controlsRef.current;
    const userMenu = userMenuRef.current;
    if (!header || !logo || !nav) return;

    const logoW = logo.getBoundingClientRect().width;
    const navW = nav.scrollWidth;

    // Measure controls off-screen: position:absolute takes it out of flow so
    // its presence/absence doesn't affect sibling widths or trigger reflows
    // that change the values we just measured above.
    let controlsW = 0;
    if (controls) {
      const savedCss = controls.style.cssText;
      controls.style.cssText =
        'display:flex!important;position:absolute;visibility:hidden;pointer-events:none;';
      controlsW = controls.getBoundingClientRect().width;
      controls.style.cssText = savedCss;
    }

    const userMenuW = userMenu ? userMenu.getBoundingClientRect().width : 48;

    // Gaps & padding budget:
    //   header px-8 → 32px × 2 = 64px total padding (md+)
    //   between logo ↔ nav: justify-between distributes space, need ~16px min
    //   between nav ↔ controls: ~16px min
    //   gap-3 between controls ↔ userMenu = 12px
    const PADDING = 64;
    const GAPS = 16 + 16 + 12;

    const needed = logoW + navW + controlsW + userMenuW + GAPS + PADDING;
    setIsCompact(needed > header.clientWidth);
  }, []);

  // Set up ResizeObserver — only fires when the header element resizes
  // (i.e. viewport width changes). Toggling isCompact doesn't change the
  // header's own box size (it's position:fixed, left:0, right:0).
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    // Initial measurement after first paint
    const raf = requestAnimationFrame(measure);

    const ro = new ResizeObserver(measure);
    ro.observe(header);

    // Fonts can shift text widths — re-measure when ready
    document.fonts?.ready?.then(measure);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [measure]);

  // Re-measure when content changes (locale switch, admin login, route)
  useEffect(() => {
    const raf = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(raf);
  }, [measure, displayNavItems.length, pathname]);

  // ---------------------------------------------------------------------------
  // Scroll-direction auto-hide: header slides up on scroll-down, back on
  // scroll-up. Mobile only (< 768px). A 10px dead-zone prevents jitter.
  // Always visible at the top of the page or when the mobile drawer is open.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const THRESHOLD = 10; // px of scroll required to trigger hide/show

    const onScroll = () => {
      // Only enable auto-hide on mobile devices (< 768px)
      if (window.innerWidth >= 768) {
        if (isHidden) setIsHidden(false);
        return;
      }

      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      // Always show header near the top of the page
      if (currentY < 56) {
        setIsHidden(false);
      } else if (delta > THRESHOLD) {
        // Scrolling down — hide (unless drawer is open)
        if (!mobileOpen) setIsHidden(true);
      } else if (delta < -THRESHOLD) {
        // Scrolling up — show
        setIsHidden(false);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [mobileOpen, isHidden]);

  if (isMetro) {
    return (
      <>
        <header
          ref={headerRef}
          className={`fixed top-0 left-0 right-0 z-50 w-full h-14 flex justify-center border-b-2 border-[#333535] bg-[#121414]/90 backdrop-blur-md transition-transform duration-300 ease-in-out md:translate-y-0 ${
            isHidden ? '-translate-y-full' : 'translate-y-0'
          }`}
        >
          <div className="flex h-full w-full items-center justify-between max-w-[1400px] mx-auto px-4 sm:px-8">
            {/* Logo / Mobile Back Button */}
            <div ref={logoRef} className="flex items-center gap-2 shrink-0">
              {detailParent ? (
                <>
                  <Link
                    href="/"
                    className="hidden md:flex items-center gap-2.5 font-mono font-black text-base sm:text-lg uppercase tracking-[0.25em] text-[#fbbc00] hover:text-[#ffd65c] transition-colors no-underline"
                  >
                    <span className="flex h-7.5 w-7.5 items-center justify-center rounded-md bg-[#fbbc00] text-[#121414] shadow-xs">
                      <svg
                        className="h-4.5 w-4.5 stroke-[2.5]"
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
                    className="flex md:hidden items-center gap-2 font-bold text-[#e2e2e2] hover:text-[#fbbc00] transition-colors no-underline text-base"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#333535] bg-[#1a1c1c] text-[#9c8f78] text-xs">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                    </span>
                    <span className="font-mono text-xs uppercase">
                      {t.has(detailParent.labelKey as any) ? t(detailParent.labelKey as any) : detailParent.labelKey}
                    </span>
                  </Link>
                </>
              ) : (
                <Link
                  href="/"
                  className="flex items-center gap-2.5 font-mono font-black text-base sm:text-lg uppercase tracking-[0.25em] text-[#fbbc00] hover:text-[#ffd65c] transition-colors no-underline"
                >
                  <span className="flex h-7.5 w-7.5 items-center justify-center rounded-md bg-[#fbbc00] text-[#121414] shadow-xs">
                    <svg
                      className="h-4.5 w-4.5 stroke-[2.5]"
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

            {/* Desktop Nav Links (Pushed towards the right side) */}
            <nav ref={navRef} className="hidden items-center gap-4 lg:gap-8 md:flex shrink-0 ml-auto mr-4 sm:mr-6">
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
                    className={`transition-colors whitespace-nowrap font-mono text-[0.78rem] uppercase tracking-wider ${
                      isActive
                        ? 'font-extrabold text-[#00e3fd]'
                        : 'font-medium text-[#9c8f78] hover:text-[#00e3fd]'
                    }`}
                  >
                    {translatedLabel}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Controls (Only ≡ Hamburger Button on Header Bar) */}
            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 rounded-full bg-[#1e2020] border border-[#333535] text-[#00e3fd] px-3 py-1 text-xs font-bold transition-colors md:hidden"
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span>{t('admin')}</span>
                </Link>
              )}

              <button
                className="flex h-9 w-9 items-center justify-center text-[#e2e2e2] hover:bg-[#1e2020] rounded-none transition-colors cursor-pointer"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-expanded={mobileOpen}
              >
                <span className="sr-only">Toggle menu</span>
                {mobileOpen ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Metro Drawer Menu */}
          {mobileOpen && (
            <div className="absolute top-14 left-0 right-0 z-40 border-b border-[#333535] bg-[#121414] text-[#e2e2e2] px-6 py-4 shadow-lg">
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
                        className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors rounded-none font-mono uppercase tracking-wider ${
                          isActive
                            ? 'bg-[#1e2020] text-[#00e3fd] font-bold'
                            : 'text-[#9c8f78] hover:bg-[#1a1c1c] hover:text-[#00e3fd] font-medium'
                        }`}
                        onClick={() => setMobileOpen(false)}
                      >
                        {getNavIcon(item.href)}
                        <span>{translatedLabel}</span>
                      </Link>
                    );
                  })}
              </nav>

              <div className="mt-3 border-t border-[#333535] md:hidden" />

              <div className="pt-3 pb-1 flex flex-row items-center justify-center gap-3 px-3 w-full">
                <SearchDialog
                  className="flex w-36 items-center gap-2 rounded-none border border-[#333535] bg-[#1a1c1c] text-[#9c8f78] hover:text-[#00e3fd] hover:border-[#00e3fd] transition-colors py-2 px-3 text-[0.78rem] font-mono"
                  showLabel={true}
                />
                <LanguageSwitcher onItemClick={() => setMobileOpen(false)} />
              </div>

              <div className="my-2.5 border-t border-[#333535]" />

              <div className="pt-1 pb-1 px-1">
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

  // Classic Header (Default return when !isMetro)
  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 w-full h-14 border-b border-compat flex justify-center px-4 md:px-8 bg-[var(--portal-color-background-glass)] backdrop-blur-xl backdrop-saturate-150 transition-transform duration-300 ease-in-out md:translate-y-0 ${
          isHidden ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="flex h-full w-full items-center justify-between px-0">
          {/* Logo / Mobile Back Button */}
          <div ref={logoRef} className="flex items-center gap-2 shrink-0">
            {detailParent ? (
              <>
                <Link
                  href="/"
                  className="hidden md:flex items-center gap-2 font-bold text-[var(--portal-color-text)] no-underline text-[1.1rem] tracking-tight"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--portal-color-primary)] text-white text-[14px]">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </span>
                  {siteTitle}
                </Link>
                <Link
                  href={detailParent.href as any}
                  className="flex md:hidden items-center gap-2 font-bold text-[var(--portal-color-text)] hover:text-[var(--portal-color-primary)] transition-colors no-underline text-base"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] text-[var(--portal-color-text-secondary)] shadow-xs">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </span>
                  <span className="text-[0.95rem]">
                    {t.has(detailParent.labelKey as any) ? t(detailParent.labelKey as any) : detailParent.labelKey}
                  </span>
                </Link>
              </>
            ) : (
              <Link
                href="/"
                className="flex items-center gap-2 font-bold text-[var(--portal-color-text)] no-underline text-[1.1rem] tracking-tight"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--portal-color-primary)] text-white text-[14px]">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </span>
                {siteTitle}
              </Link>
            )}
          </div>

          {/* Desktop/Tablet Nav Links */}
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
                  className={`transition-colors text-[0.82rem] tracking-tight whitespace-nowrap ${
                    isActive
                      ? 'font-bold text-[var(--portal-color-primary)]'
                      : 'font-medium text-[var(--portal-color-text-tertiary)] hover:text-[var(--portal-color-text)]'
                  }`}
                >
                  {translatedLabel}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <div
              ref={controlsRef}
              className="hidden items-center gap-3 md:flex"
              style={isCompact ? { display: 'none' } : undefined}
            >
              <SearchDialog />
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>

            <div ref={userMenuRef} className="hidden md:block shrink-0">
              <UserMenu />
            </div>

            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 rounded-full bg-[var(--portal-color-primary-soft)] border border-[var(--portal-color-primary)]/30 px-3 py-1 text-xs font-bold text-[var(--portal-color-primary)] transition-colors hover:bg-[var(--portal-color-primary)] hover:text-white md:hidden"
              >
                <Settings className="h-3.5 w-3.5" />
                <span>{t('admin')}</span>
              </Link>
            )}

            <button
              className={`h-9 w-9 items-center justify-center rounded-md text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-background)] ${
                isCompact ? 'flex' : 'flex md:hidden'
              }`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
            >
              <span className="sr-only">Toggle menu</span>
              {mobileOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Nav Drawer */}
        {mobileOpen && (
          <div
            className={`absolute top-14 left-0 right-0 z-40 border-b border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-6 py-4 shadow-lg ${
              isCompact ? '' : 'lg:hidden'
            }`}
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
                      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? 'bg-[var(--portal-color-surface-alt)] text-[var(--portal-color-primary)] font-bold'
                          : 'text-[var(--portal-color-text-tertiary)] hover:bg-[var(--portal-color-surface-alt)] hover:text-[var(--portal-color-text)] font-medium'
                      }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {getNavIcon(item.href)}
                      <span>{translatedLabel}</span>
                    </Link>
                  );
                })}
            </nav>

            <div className="mt-3 border-t border-[var(--portal-color-border)] md:hidden" />

            <div className="pt-3 pb-1 flex flex-row items-center justify-center gap-3 px-3 w-full">
              <SearchDialog
                className="flex w-36 items-center gap-2 rounded-full border border-compat bg-[var(--portal-color-surface)] text-[var(--portal-color-text-secondary)] transition-colors hover:border-[var(--portal-color-primary)] hover:text-[var(--portal-color-text)] py-2 px-3 text-[0.78rem]"
                showLabel={true}
              />
              <LanguageSwitcher onItemClick={() => setMobileOpen(false)} />
              <ThemeSwitcher iconOnly={true} onItemClick={() => setMobileOpen(false)} />
            </div>

            <div className="my-2.5 border-t border-[var(--portal-color-border)]/60 md:hidden" />

            <div className="pt-1 pb-1 px-1 md:hidden">
              <UserMenu showDetails={true} align="left" onItemClick={() => setMobileOpen(false)} />
            </div>
          </div>
        )}
      </header>

      {mobileOpen && (
        <div
          className={`fixed inset-0 z-30 bg-black/30 backdrop-blur-xs transition-opacity ${
            isCompact ? '' : 'lg:hidden'
          }`}
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
