'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * A lightweight Stale-While-Revalidate (SWR) hook that caches data in localStorage
 * for instant (0ms) loads, then validates against the server in the background.
 *
 * @param cacheKey The unique key used to partition localStorage cache
 * @param fetcher The async function that retrieves the fresh data
 */
export function useLocalSWR<T>(
  cacheKey: string,
  fetcher: () => Promise<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Keep the latest fetcher reference to avoid unnecessary re-creation of callbacks
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const revalidate = useCallback(async () => {
    try {
      const freshData = await fetcherRef.current();
      
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
      console.error(`SWR fetch error for key "${cacheKey}":`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [cacheKey]);

  useEffect(() => {
    // 1. Immediately retrieve the cache on mount / cacheKey change
    try {
      const cached = localStorage.getItem(`swr:${cacheKey}`);
      if (cached) {
        setData(JSON.parse(cached));
        setLoading(false);
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
