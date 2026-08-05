import { getTranslations } from 'next-intl/server';
import type React from 'react';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const tNav = await getTranslations({ locale, namespace: 'Navigation' });
  return {
    title: tNav('profile'),
  };
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
