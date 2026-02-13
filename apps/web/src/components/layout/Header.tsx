'use client';

import { useState } from 'react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { UserMenu } from '../auth/UserMenu';
import { SearchDialog } from '../search/SearchDialog';
import type { NavItem } from '@portal/shared';

interface HeaderProps {
    siteTitle: string;
    navItems: NavItem[];
}

export function Header({ siteTitle, navItems }: HeaderProps) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 border-b border-[var(--portal-color-border)] bg-[var(--portal-color-surface)]/95 backdrop-blur-[var(--portal-blur)]">
            <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
                {/* Logo / Title */}
                <a
                    href="/"
                    className="text-lg font-bold text-[var(--portal-color-text)] transition-colors hover:text-[var(--portal-color-primary)]"
                    style={{ fontFamily: 'var(--portal-font-heading)' }}
                >
                    {siteTitle}
                </a>

                {/* Desktop Nav */}
                <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
                    {navItems.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            className="rounded-md px-3 py-2 text-sm text-[var(--portal-color-text-secondary)] transition-colors hover:bg-[var(--portal-color-background)] hover:text-[var(--portal-color-text)]"
                        >
                            {item.icon && <span className="mr-1.5">{item.icon}</span>}
                            {item.label}
                        </a>
                    ))}
                    <div className="ml-2 border-l border-[var(--portal-color-border)] pl-2">
                        <SearchDialog />
                    </div>
                    <div className="ml-2 border-l border-[var(--portal-color-border)] pl-2">
                        <ThemeSwitcher />
                    </div>
                    <div className="ml-2 border-l border-[var(--portal-color-border)] pl-2">
                        <UserMenu />
                    </div>
                </nav>

                {/* Mobile Hamburger */}
                <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md p-2 text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-background)] hover:text-[var(--portal-color-text)] md:hidden"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-expanded={mobileOpen}
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="border-t border-[var(--portal-color-border)] md:hidden">
                    <nav className="space-y-1 px-4 py-3" aria-label="Mobile navigation">
                        {navItems.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className="block rounded-md px-3 py-2 text-sm text-[var(--portal-color-text-secondary)] transition-colors hover:bg-[var(--portal-color-background)] hover:text-[var(--portal-color-text)]"
                                onClick={() => setMobileOpen(false)}
                            >
                                {item.icon && <span className="mr-1.5">{item.icon}</span>}
                                {item.label}
                            </a>
                        ))}
                        <div className="flex items-center justify-between border-t border-[var(--portal-color-border)] pt-3">
                            <ThemeSwitcher />
                            <UserMenu />
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
