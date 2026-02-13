'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface SearchHit {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    categoryName: string;
    publishedAt: string | null;
    _highlight?: Record<string, string>;
}

export function SearchDialog() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchHit[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

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
            window.location.href = `/blog/${results[selectedIndex].slug}`;
            setOpen(false);
        }
    }

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-1.5 rounded-md border border-[var(--portal-color-border)]
                   bg-[var(--portal-color-surface)] px-3 py-1.5 text-sm text-[var(--portal-color-text-secondary)]
                   transition-colors hover:border-[var(--portal-color-primary)] hover:text-[var(--portal-color-text)]"
                aria-label="Search"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden sm:inline">Search</span>
                <kbd className="hidden rounded border border-[var(--portal-color-border)] bg-[var(--portal-color-background)] px-1.5 py-0.5 text-xs sm:inline">
                    ⌘K
                </kbd>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setOpen(false)}
            />

            {/* Dialog */}
            <div className="relative mx-auto mt-[15vh] max-w-xl px-4">
                <div className="overflow-hidden rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] shadow-2xl">
                    {/* Search input */}
                    <div className="flex items-center border-b border-[var(--portal-color-border)] px-4">
                        <svg className="h-5 w-5 shrink-0 text-[var(--portal-color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => handleInputChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search posts…"
                            className="w-full bg-transparent px-3 py-4 text-sm text-[var(--portal-color-text)] placeholder-[var(--portal-color-text-secondary)] outline-none"
                        />
                        {loading && (
                            <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[var(--portal-color-primary)] border-t-transparent" />
                        )}
                        <kbd
                            className="ml-2 shrink-0 cursor-pointer rounded border border-[var(--portal-color-border)] px-1.5 py-0.5 text-xs text-[var(--portal-color-text-secondary)]"
                            onClick={() => setOpen(false)}
                        >
                            ESC
                        </kbd>
                    </div>

                    {/* Results */}
                    {results.length > 0 && (
                        <ul className="max-h-80 overflow-y-auto px-2 py-2">
                            {results.map((hit, i) => (
                                <li key={hit.id}>
                                    <a
                                        href={`/blog/${hit.slug}`}
                                        className={`flex flex-col gap-0.5 rounded-lg px-3 py-2.5 transition-colors ${i === selectedIndex
                                                ? 'bg-[var(--portal-color-primary)]/10 text-[var(--portal-color-primary)]'
                                                : 'text-[var(--portal-color-text)] hover:bg-[var(--portal-color-background)]'
                                            }`}
                                        onClick={() => setOpen(false)}
                                    >
                                        <span className="text-sm font-medium">{hit.title}</span>
                                        {hit.excerpt && (
                                            <span className="line-clamp-1 text-xs text-[var(--portal-color-text-secondary)]">
                                                {hit.excerpt}
                                            </span>
                                        )}
                                        <div className="flex items-center gap-2 text-xs text-[var(--portal-color-text-secondary)]">
                                            {hit.categoryName && <span>{hit.categoryName}</span>}
                                            {hit.publishedAt && (
                                                <span>{new Date(hit.publishedAt).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Empty state */}
                    {query.length >= 2 && !loading && results.length === 0 && (
                        <div className="px-4 py-8 text-center text-sm text-[var(--portal-color-text-secondary)]">
                            No results found for &ldquo;{query}&rdquo;
                        </div>
                    )}

                    {/* Hint */}
                    {query.length < 2 && (
                        <div className="px-4 py-6 text-center text-sm text-[var(--portal-color-text-secondary)]">
                            Type at least 2 characters to search
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-[var(--portal-color-border)] px-4 py-2 text-xs text-[var(--portal-color-text-secondary)]">
                        <div className="flex gap-2">
                            <span><kbd className="rounded border border-[var(--portal-color-border)] px-1">↑↓</kbd> Navigate</span>
                            <span><kbd className="rounded border border-[var(--portal-color-border)] px-1">↵</kbd> Open</span>
                        </div>
                        <span>Powered by MeiliSearch</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
