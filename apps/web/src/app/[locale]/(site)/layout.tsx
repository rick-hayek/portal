import { getNavItems, registerDefaultModules } from '@portal/config';
import type { NavItem } from '@portal/shared';
import { ThemeProvider } from '@portal/theme';
import { PageViewTracker } from '../../../components/analytics/PageViewTracker';
import { Footer } from '../../../components/layout/Footer';
import { Header } from '../../../components/layout/Header';
import siteConfig from '../../../site.config';

// Initialize the registry
registerDefaultModules();

// Get nav items dynamically based on enabled modules in siteConfig
const navItems: NavItem[] = [
  { label: 'Home', href: '/', order: 0 },
  ...getNavItems(siteConfig),
].filter(
  (item) =>
    // 暂时隐藏，之后需要恢复：Resume, Gallery, Guestbook
    !['Resume', 'Gallery', 'Guestbook'].includes(item.label),
);

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      defaultTheme={siteConfig.theme.default}
      availableThemes={siteConfig.theme.available}
    >
      <div className="flex min-h-screen w-full flex-col">
        <Header siteTitle={siteConfig.site.title} navItems={navItems} />
        <main className="flex-1 w-full pt-14">{children}</main>
        <Footer siteTitle={siteConfig.site.title} />
        <PageViewTracker />
      </div>
    </ThemeProvider>
  );
}
