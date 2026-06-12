'use client';

import { UserMenu } from '@/components/auth/UserMenu';
import { Link, usePathname } from '@/i18n/routing';

import { useSession } from 'next-auth/react';
import { notFound } from 'next/navigation';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/posts', label: 'Posts', icon: '📝' },
  { href: '/admin/categories', label: 'Categories', icon: '📁' },
  { href: '/admin/portfolio', label: 'Portfolio', icon: '🚀' },
  { href: '/admin/comments', label: 'Comments', icon: '💬' },
  { href: '/admin/guestbook', label: 'Guestbook', icon: '📒' },
  { href: '/admin/references', label: 'References', icon: '📎' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

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
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 flex h-full w-56 flex-col border-r border-[var(--portal-color-border)] bg-[var(--portal-color-surface)]">
        {/* Brand */}
        <div className="flex h-14 items-center border-b border-[var(--portal-color-border)] px-4">
          <Link
            href="/"
            className="text-sm text-[var(--portal-color-text-secondary)] hover:text-[var(--portal-color-primary)]"
          >
            ← Back to site
          </Link>
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
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
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
      <main className="ml-56 flex-1 p-6">{children}</main>
    </div>
  );
}
