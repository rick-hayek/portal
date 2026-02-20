import { ThemeProvider } from '@portal/theme';
import { registerDefaultModules, getNavItems } from '@portal/config';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { PageViewTracker } from '../../components/analytics/PageViewTracker';
import siteConfig from '../../site.config';
import type { NavItem } from '@portal/shared';

// Initialize the registry
registerDefaultModules();

// Get nav items dynamically based on enabled modules in siteConfig
const navItems: NavItem[] = [
    { label: 'Home', href: '/', icon: '🏠', order: 0 },
    ...getNavItems(siteConfig),
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
