'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * A lightweight Stale-While-Revalidate (SWR) hook that caches data in localStorage
 * for instant (0ms) loads, then validates against the server in the background.
 *
 * @param cacheKey The unique key used to partition localStorage cache
 * @param fetcher The async function that retrieves the fresh data
 */
export function useLocalSWR<T>(cacheKey: string, fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Keep track of the active cacheKey to prevent race conditions from slower, out-of-order fetches
  const currentKeyRef = useRef(cacheKey);
  useEffect(() => {
    currentKeyRef.current = cacheKey;
  }, [cacheKey]);

  // Keep the latest fetcher reference to avoid unnecessary re-creation of callbacks
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const revalidate = useCallback(async () => {
    try {
      const freshData = await fetcherRef.current();

      // If the cacheKey has changed since this fetch started, discard the result
      if (cacheKey !== currentKeyRef.current) {
        return;
      }

      setData((prevData) => {
        const freshStr = JSON.stringify(freshData);
        const prevStr = JSON.stringify(prevData);
        if (freshStr !== prevStr) {
          try {
            localStorage.setItem(`swr:${cacheKey}`, freshStr);
          } catch (e) {
            console.error('Failed to set localStorage cache:', e);
          }
          return freshData;
        }
        return prevData;
      });
      setError(null);
    } catch (err: any) {
      if (cacheKey !== currentKeyRef.current) {
        return;
      }
      console.error(`SWR fetch error for key "${cacheKey}":`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      if (cacheKey === currentKeyRef.current) {
        setLoading(false);
      }
    }
  }, [cacheKey]);

  useEffect(() => {
    // 1. Immediately retrieve the cache on mount / cacheKey change
    try {
      const cached = localStorage.getItem(`swr:${cacheKey}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setData(parsed);
          setLoading(false);
        } catch {
          localStorage.removeItem(`swr:${cacheKey}`);
          setData(null);
          setLoading(true);
        }
      } else {
        setData(null);
        setLoading(true);
      }
    } catch (e) {
      console.error('Failed to read localStorage cache:', e);
      setData(null);
      setLoading(true);
    }

    // 2. Perform silent background revalidation
    revalidate();
  }, [cacheKey, revalidate]);

  return { data, loading, error, mutate: revalidate };
}
