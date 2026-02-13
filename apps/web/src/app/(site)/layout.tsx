import { ThemeProvider } from '@portal/theme';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import siteConfig from '../../site.config';
import type { NavItem } from '@portal/shared';

// Static nav items — in Phase 2+ these come from the module registry
const navItems: NavItem[] = [
    { label: 'Home', href: '/', icon: '🏠', order: 0 },
    { label: 'Blog', href: '/blog', icon: '📝', order: 1 },
    { label: 'About', href: '/about', icon: '👤', order: 2 },
    { label: 'Guestbook', href: '/guestbook', icon: '💬', order: 3 },
];

export default function SiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ThemeProvider
            defaultTheme={siteConfig.theme.default}
            availableThemes={siteConfig.theme.available}
        >
            <div className="flex min-h-screen flex-col">
                <Header siteTitle={siteConfig.site.title} navItems={navItems} />
                <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
                    {children}
                </main>
                <Footer siteTitle={siteConfig.site.title} />
            </div>
        </ThemeProvider>
    );
}
