import dynamic from 'next/dynamic';
import type { LayoutProps } from './ClassicLayout';

export type { LayoutProps };

export const layoutMap: Record<string, React.ComponentType<LayoutProps>> = {
  classic: dynamic(() => import('./ClassicLayout').then((m) => m.ClassicLayout)),
  metro: dynamic(() => import('./MetroLayout').then((m) => m.MetroLayout)),
};
