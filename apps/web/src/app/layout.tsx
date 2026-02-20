import type { Metadata } from 'next';
import { Sora, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { TRPCReactProvider } from '../lib/api/client';
import { ThemeProvider } from '@portal/theme';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

import siteConfig from '../site.config';

export const metadata: Metadata = {
  title: {
    default: siteConfig.site.title,
    template: `%s | ${siteConfig.site.title}`,
  },
  description: siteConfig.site.description,
  metadataBase: new URL(siteConfig.site.url),
  openGraph: {
    title: siteConfig.site.title,
    description: siteConfig.site.description,
    url: siteConfig.site.url,
    siteName: siteConfig.site.title,
    locale: siteConfig.site.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.site.title,
    description: siteConfig.site.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sora.variable} ${plexMono.variable} font-sans antialiased`}
      >
        <TRPCReactProvider>
          <ThemeProvider defaultTheme="minimal-light">
            {children}
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
