'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { UserMenu } from '@/components/auth/UserMenu';
import { Link, usePathname } from '@/i18n/routing';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/posts', label: 'Posts', icon: '📝' },
  { href: '/admin/categories', label: 'Categories', icon: '📁' },
  { href: '/admin/portfolio', label: 'Portfolio', icon: '🚀' },
  { href: '/admin/books', label: 'Books', icon: '📚' },
  { href: '/admin/comments', label: 'Comments', icon: '💬' },
  { href: '/admin/guestbook', label: 'Guestbook', icon: '📒' },
  { href: '/admin/references', label: 'References', icon: '📎' },
  { href: '/admin/attachments', label: 'Attachments', icon: '🖼️' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--portal-color-background)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--portal-color-primary)] border-t-transparent" />
      </div>
    );
  }

  if (!session || session.user.role !== 'admin') {
    notFound();
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[var(--portal-color-background)]">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-30 flex h-14 items-center justify-between border-b border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-4 md:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-background)]"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <span className="font-bold text-[var(--portal-color-text)]">Admin Panel</span>
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-background)] hover:text-[var(--portal-color-primary)] transition-colors"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </Link>
      </div>

      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs transition-opacity md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-56 flex-col border-r border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Brand */}
        <div className="flex h-14 items-center justify-between border-b border-[var(--portal-color-border)] px-4">
          <Link
            href="/"
            className="text-sm text-[var(--portal-color-text-secondary)] hover:text-[var(--portal-color-primary)]"
          >
            ← Back to site
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-background)] md:hidden"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-3 py-2">
          <h2 className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-[var(--portal-color-text-secondary)]">
            Admin Panel
          </h2>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-0.5 px-3">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${isActive
                  ? 'bg-[var(--portal-color-primary)]/10 font-medium text-[var(--portal-color-primary)]'
                  : 'text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-background)] hover:text-[var(--portal-color-text)]'
                  }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-[var(--portal-color-border)] p-3">
          <UserMenu />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:ml-56 min-h-screen pt-20 md:pt-6 min-w-0 w-full overflow-x-hidden">{children}</main>
    </div>
  );
}
