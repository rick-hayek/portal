'use client';

import { useEffect } from 'react';
import { usePathname } from '@/i18n/routing';

interface TrackEvent {
  path: string;
  referrer?: string;
  userAgent: string;
  createdAt: string;
}

// Module-level persistent queue and timer to survive component remounts
let eventQueue: TrackEvent[] = [];
let flushTimeout: NodeJS.Timeout | null = null;

function flushQueue() {
  if (eventQueue.length === 0) return;

  const batch = [...eventQueue];
  eventQueue = []; // clear the queue immediately to avoid race conditions

  if (flushTimeout) {
    clearTimeout(flushTimeout);
    flushTimeout = null;
  }

  fetch('/api/trpc/analytics.track?batch=1', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      '0': {
        json: batch,
      },
    }),
    keepalive: true, // ensures request finishes even if page closes
  }).catch(() => {});
}

/** Buffers page views in a queue and sends them in batches for performance */
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Skip admin and auth routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/auth')) return;

    // Queue the current page view
    eventQueue.push({
      path: pathname,
      referrer: document.referrer || undefined,
      userAgent: navigator.userAgent,
      createdAt: new Date().toISOString(),
    });

    // Send immediately if batch size matches 5
    if (eventQueue.length >= 5) {
      flushQueue();
    } else {
      // Otherwise, start/reset a 5-second timer to flush whatever is in the queue
      if (!flushTimeout) {
        flushTimeout = setTimeout(() => {
          flushQueue();
        }, 5000);
      }
    }
  }, [pathname]);

  // Flush when tab is hidden or closed (visibilitychange)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushQueue();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
}
