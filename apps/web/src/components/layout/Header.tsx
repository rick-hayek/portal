'use client';

import type { NavItem } from '@portal/shared';
import dynamic from 'next/dynamic';
import siteConfig from '@/site.config';

export interface HeaderProps {
  siteTitle: string;
  navItems: NavItem[];
}

const headerMap = {
  classic: dynamic(() => import('./headers/ClassicHeader').then((m) => m.ClassicHeader)),
  metro: dynamic(() => import('./headers/MetroHeader').then((m) => m.MetroHeader)),
};

export function Header(props: HeaderProps) {
  const activeLayout = siteConfig.homeLayout || 'classic';
  const ActiveHeader = headerMap[activeLayout as keyof typeof headerMap] || headerMap.classic;

  return <ActiveHeader {...props} />;
}
