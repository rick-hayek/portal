'use client';

import { useTranslations } from 'next-intl';
import { use, useCallback, useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';

interface Book {
  id: string;
  slug: string;
  title: string;
  coverImageURL: string | null;
  coverImage: string | null;
  author: string;
  publisher: string | null;
  translator: string | null;
  isbn: string | null;
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function PublicBooksPage({ params }: PageProps) {
  const { locale } = use(params);
  const t = useTranslations('Books');

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBooks = useCallback(async () => {
    try {
      const res = await fetch('/api/trpc/book.list?batch=1');
      const data = await res.json();
      setBooks(data[0]?.result?.data?.json ?? []);
    } catch {
      setError('Failed to load books');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  return (
    <div className="border-t border-b border-compat-soft bg-[var(--portal-color-surface)]">
      <div style={{ padding: '5rem 2rem', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        {/* Section header */}
        <div className="flex items-baseline" style={{ gap: '.8rem', marginBottom: '2.5rem' }}>
          <span
            style={{
              width: 28,
              height: 2,
              background: 'var(--portal-color-primary)',
              flexShrink: 0,
            }}
          />
          <span
            className="font-mono uppercase text-[var(--portal-color-primary)]"
            style={{ fontSize: '.7rem', fontWeight: 500, letterSpacing: '.1em' }}
          >
            {t('recommendedBooks')}
          </span>
          <h1
            className="text-[var(--portal-color-text)]"
            style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-.03em' }}
          >
            {t('title')}
          </h1>
        </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse space-y-4">
              <div className="aspect-[3/4] w-full rounded-xl bg-[var(--portal-color-surface-alt)]" />
              <div className="h-4 w-3/4 rounded bg-[var(--portal-color-surface-alt)]" />
              <div className="h-3 w-1/2 rounded bg-[var(--portal-color-surface-alt)]" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-500/10 p-6 text-center text-sm text-red-500">{error}</div>
      ) : books.length === 0 ? (
        <div className="rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-16 text-center">
          <p className="text-[var(--portal-color-text-secondary)] font-medium">{t('noBooks')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {books.map((book) => {
            const coverSrc = book.coverImage ?? book.coverImageURL ?? '';
            return (
              <Link
                key={book.id}
                href={`/books/${book.slug}`}
                className="group flex flex-col no-underline"
              >
                {/* Book Cover Container */}
                <div className="relative mb-4 aspect-[3/4] w-full overflow-hidden rounded-xl bg-[var(--portal-color-surface-alt)] shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-all duration-300 group-hover:-translate-y-2 group-hover:rotate-1 group-hover:shadow-[0_16px_30px_rgba(0,0,0,0.22)] border border-[var(--portal-color-border)]/50">
                  {coverSrc ? (
                    <img
                      src={coverSrc}
                      alt={book.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
                      <span className="text-4xl mb-2">📚</span>
                      <span className="text-xs font-semibold text-[var(--portal-color-text-tertiary)] uppercase tracking-wider">
                        No Cover
                      </span>
                    </div>
                  )}
                  {/* Subtle Spine effect */}
                  <div className="absolute left-0 top-0 h-full w-2.5 bg-gradient-to-r from-black/20 to-transparent" />
                </div>

                {/* Info */}
                <div className="space-y-1 pl-1">
                  <h3 className="line-clamp-2 text-sm font-bold tracking-tight text-[var(--portal-color-text)] transition-colors group-hover:text-[var(--portal-color-primary)]">
                    {book.title}
                  </h3>
                  <p className="truncate text-xs text-[var(--portal-color-text-secondary)]">
                    {book.author}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
