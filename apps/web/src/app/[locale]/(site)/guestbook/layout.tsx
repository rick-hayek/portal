import { getTranslations } from 'next-intl/server';
import type React from 'react';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const tNav = await getTranslations({ locale, namespace: 'Navigation' });
  return {
    title: tNav('guestbook'),
  };
}

export default function GuestbookLayout({ children }: { children: React.ReactNode }) {
  return children;
}
