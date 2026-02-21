'use client';

import { useEffect } from 'react';
import { usePathname } from '@/i18n/routing';

/** Fires a page view tracking request on each navigation */
export function PageViewTracker() {
    const pathname = usePathname();

    useEffect(() => {
        // Skip admin routes
        if (pathname.startsWith('/admin') || pathname.startsWith('/auth')) return;

        const controller = new AbortController();

        fetch('/api/trpc/analytics.track?batch=1', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                '0': {
                    json: {
                        path: pathname,
                        referrer: document.referrer || undefined,
                        userAgent: navigator.userAgent,
                    },
                },
            }),
            signal: controller.signal,
        }).catch(() => { }); // fire-and-forget

        return () => controller.abort();
    }, [pathname]);

    return null;
}
