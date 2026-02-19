'use client';

import { useState } from 'react';
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
        <header className="fixed top-0 left-0 right-0 z-50 w-full h-14 border-b border-[var(--portal-color-border)] flex justify-center"
            style={{ padding: '0 32px', background: 'rgba(248,249,251,.72)', backdropFilter: 'blur(20px) saturate(1.4)', WebkitBackdropFilter: 'blur(20px) saturate(1.4)' }}
        >
            <div className="mx-auto flex h-full w-full items-center justify-between px-8">
                {/* Logo */}
                <a href="/" className="flex items-center gap-2 font-bold text-[var(--portal-color-text)] no-underline"
                    style={{ fontSize: '1.1rem', letterSpacing: '-.03em' }}
                >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--portal-color-primary)] text-white"
                        style={{ fontSize: 14 }}
                    >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                    </span>
                    Portal<span className="text-[var(--portal-color-primary)]">.</span>
                </a>

                {/* Desktop Nav Links */}
                <nav className="hidden items-center gap-8 md:flex">
                    {navItems.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            className="font-[500] text-[var(--portal-color-text-secondary)] transition-colors hover:text-[var(--portal-color-primary)]"
                            style={{ fontSize: '.82rem', letterSpacing: '-.01em' }}
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>

                {/* Right side */}
                <div className="hidden items-center gap-3 md:flex">
                    <SearchDialog />
                    <UserMenu />
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-background)] md:hidden"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    <span className="sr-only">Toggle menu</span>
                    {mobileOpen ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    )}
                </button>
            </div>

            {/* Mobile Nav - drops below header */}
            {mobileOpen && (
                <div className="border-b border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-6 py-4 shadow-lg md:hidden">
                    <nav className="flex flex-col gap-1">
                        {navItems.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className="rounded-md px-3 py-2 text-sm font-[500] text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-background)] hover:text-[var(--portal-color-primary)]"
                                onClick={() => setMobileOpen(false)}
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>
                    <div className="mt-3 border-t border-[var(--portal-color-border)] pt-3 flex items-center gap-3 px-3">
                        <SearchDialog />
                        <UserMenu />
                    </div>
                </div>
            )}
        </header>
    );
}
