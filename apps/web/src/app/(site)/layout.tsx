import { ThemeProvider } from '@portal/theme';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { PageViewTracker } from '../../components/analytics/PageViewTracker';
import siteConfig from '../../site.config';
import type { NavItem } from '@portal/shared';

// Static nav items — in Phase 2+ these come from the module registry
const navItems: NavItem[] = [
    { label: 'Home', href: '/', icon: '🏠', order: 0 },
    { label: 'Blog', href: '/blog', icon: '📝', order: 1 },
    { label: 'Portfolio', href: '/portfolio', icon: '🚀', order: 2 },
    { label: 'About', href: '/about', icon: '👤', order: 3 },
    { label: 'Guestbook', href: '/guestbook', icon: '💬', order: 4 },
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
            <div className="flex min-h-screen w-full flex-col">
                <Header siteTitle={siteConfig.site.title} navItems={navItems} />
                <main className="flex-1 w-full pt-14">
                    {children}
                </main>
                <Footer siteTitle={siteConfig.site.title} />
                <PageViewTracker />
            </div>
        </ThemeProvider>
    );
}
