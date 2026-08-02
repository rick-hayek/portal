'use client';

import type { NavItem } from '@portal/shared';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  /** true when the right-side controls (Search/Language/Theme) need to collapse */
  const [isCompact, setIsCompact] = useState(false);
  /** true when the header should slide out of view (scroll-down) */
  const [isHidden, setIsHidden] = useState(false);
  const t = useTranslations('Navigation');
  const { data: session } = useSession();
  const pathname = usePathname();

  const headerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

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
                  className={`transition-colors text-[0.82rem] tracking-tight whitespace-nowrap ${isActive
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
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {/* Inline controls — hidden by CSS below md, hidden by JS when compact */}
            <div
              ref={controlsRef}
              className="hidden items-center gap-3 md:flex"
              style={isCompact ? { display: 'none' } : undefined}
            >
              <SearchDialog />
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>
            <div ref={userMenuRef} className="shrink-0">
              <UserMenu />
            </div>

            {/* Hamburger — shown below md (mobile) OR when compact (desktop overflow) */}
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
          <div
            className={`absolute top-14 left-0 right-0 z-40 border-b border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-6 py-4 shadow-lg ${
              isCompact ? '' : 'lg:hidden'
            }`}
          >
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

            {/* Settings Actions: Search, Language, Theme */}
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

      {/* Backdrop for closing menu on outside click */}
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
