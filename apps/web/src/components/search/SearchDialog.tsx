'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface SearchHit {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  categoryName: string;
  publishedAt: string | null;
  type: 'post' | 'book' | 'portfolio';
  subtitle?: string;
  _highlight?: Record<string, string>;
}

export function SearchDialog({
  className,
  showLabel = false,
}: {
  className?: string;
  showLabel?: boolean;
} = {}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  // Debounced search
  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/trpc/search.query?batch=1&input=${encodeURIComponent(
          JSON.stringify({ '0': { json: { q, page: 1, limit: 8 } } }),
        )}`,
      );
      const data = await res.json();
      const searchResult = data[0]?.result?.data?.json;
      setResults(searchResult?.hits ?? []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, []);

  function handleInputChange(value: string) {
    setQuery(value);
    setSelectedIndex(0);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 250);
  }

  // Keyboard nav
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      const hit = results[selectedIndex];
      const href =
        hit.type === 'book'
          ? `/books/${hit.slug}`
          : hit.type === 'portfolio'
            ? `/portfolio/${hit.slug}`
            : `/blog/${hit.slug}`;
      window.location.href = href;
      setOpen(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={
          className ||
          "flex items-center gap-2 rounded-full border border-compat bg-[var(--portal-color-surface)] text-[var(--portal-color-text-secondary)] transition-colors hover-border-compat-primary hover:text-[var(--portal-color-text)] py-2 px-4 md:py-1.5 md:px-3.5 text-[0.78rem]"
        }
        aria-label="Search"
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <span className={showLabel ? "inline" : "hidden sm:inline"}>Search</span>
        {!className && (
          <kbd className="hidden rounded border border-compat bg-[var(--portal-color-surface-alt)] px-1.5 py-0.5 text-[rgba(75,85,99,0.7)] sm:inline text-[0.65rem]">
            ⌘K
          </kbd>
        )}
      </button>
    );
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
      {/* Backdrop - Blur the whole page */}
      <div
        className="absolute inset-0 bg-white/30 backdrop-blur-md transition-opacity duration-300 dark:bg-black/40"
        onClick={() => setOpen(false)}
      />

      {/* Floating Pill Container */}
      <div
        className="absolute top-[15vh] left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out"
        style={{ zIndex: 101 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Pill */}
        <div
          className="relative flex h-14 items-center gap-3 bg-[var(--portal-color-surface)] px-5 shadow-2xl rounded-full border border-[var(--portal-color-border)] ring-1 ring-black/5"
          style={{ padding: '0 1rem' }}
        >
          <svg
            className="h-5 w-5 shrink-0 text-[var(--portal-color-text-tertiary)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search..."
            className="flex-1 bg-transparent text-[1.05rem] text-[var(--portal-color-text)] placeholder-[var(--portal-color-text-tertiary)] outline-none"
          />

          {loading && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--portal-color-border)] border-t-[var(--portal-color-primary)]" />
          )}

          {/* Esc hint - visible on desktop */}
          <kbd className="hidden md:inline-flex items-center gap-1 rounded border border-[var(--portal-color-border)] bg-[var(--portal-color-surface-alt)] px-2 py-0.5 text-[0.65rem] font-medium text-[var(--portal-color-text-tertiary)]">
            ESC
          </kbd>
        </div>

        {/* Results Dropdown - Floating below */}
        {(results.length > 0 || (query.length >= 1 && !loading && results.length === 0)) && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] shadow-2xl ring-1 ring-black/5">
            {results.length > 0 ? (
              <ul className="max-h-[60vh] overflow-y-auto py-2">
                {results.map((hit, i) => {
                  const href =
                    hit.type === 'book'
                      ? `/books/${hit.slug}`
                      : hit.type === 'portfolio'
                        ? `/portfolio/${hit.slug}`
                        : `/blog/${hit.slug}`;

                  return (
                    <li key={hit.id} className="px-2">
                      <a
                        href={href}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                          i === selectedIndex
                            ? 'bg-[var(--portal-color-surface-alt)]'
                            : 'hover:bg-[var(--portal-color-surface-alt)]'
                        }`}
                        onClick={() => setOpen(false)}
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                            i === selectedIndex
                              ? 'border-[rgba(107,142,201,0.2)] bg-[var(--portal-color-surface)] text-[var(--portal-color-primary)]'
                              : 'border-compat bg-[var(--portal-color-surface)] text-[var(--portal-color-text-tertiary)]'
                          }`}
                        >
                          {hit.type === 'book' ? (
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                              />
                            </svg>
                          ) : hit.type === 'portfolio' ? (
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[0.95rem] font-medium truncate ${i === selectedIndex ? 'text-[var(--portal-color-primary)]' : 'text-[var(--portal-color-text)]'}`}
                            >
                              {hit.title}
                            </span>
                            {hit.type === 'book' ? (
                              <span className="shrink-0 rounded-full px-2 py-0.5 text-[0.62rem] font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                                Book
                              </span>
                            ) : hit.type === 'portfolio' ? (
                              <span className="shrink-0 rounded-full px-2 py-0.5 text-[0.62rem] font-semibold bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400">
                                Project
                              </span>
                            ) : (
                              <span className="shrink-0 rounded-full px-2 py-0.5 text-[0.62rem] font-semibold bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
                                Blog
                              </span>
                            )}
                          </div>
                          {hit.subtitle ? (
                            <span className="truncate text-xs text-[var(--portal-color-text-secondary)]">
                              {hit.subtitle}
                            </span>
                          ) : hit.excerpt ? (
                            <span className="truncate text-xs text-[var(--portal-color-text-secondary)]">
                              {hit.excerpt}
                            </span>
                          ) : null}
                        </div>
                        <svg
                          className={`h-4 w-4 ${i === selectedIndex ? 'text-[var(--portal-color-primary)]' : 'text-transparent group-hover:text-[var(--portal-color-text-tertiary)]'}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="py-12 text-center">
                <div className="mb-3 mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[var(--portal-color-surface-alt)]">
                  <svg
                    className="h-5 w-5 text-[var(--portal-color-text-tertiary)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-[var(--portal-color-text)]">
                  No results found for <span className="font-semibold">"{query}"</span>
                </p>
                <p className="text-xs text-[var(--portal-color-text-secondary)] mt-1">
                  Try searching for something else.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
