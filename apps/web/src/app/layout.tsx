import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Portal',
  description: 'A modular personal website platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
