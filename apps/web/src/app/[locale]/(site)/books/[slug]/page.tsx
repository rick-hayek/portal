'use client';

import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { MermaidRenderer } from '@/components/blog/MermaidRenderer';
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
  publishYear: string | null;
  ebookUrl: string | null;
  originalBook: {
    id: string;
    slug: string;
    title: string;
    author: string;
  } | null;
  description: string | null;
  review: string | null;
}

export default function BookDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const t = useTranslations('Books');

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { status } = useSession();
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [userReaction, setUserReaction] = useState<'LIKE' | 'DISLIKE' | null>(null);

  const [descriptionHtml, setDescriptionHtml] = useState('');
  const [reviewHtml, setReviewHtml] = useState('');

  useEffect(() => {
    if (book) {
      import('marked').then(({ marked }) => {
        if (book.description) {
          setDescriptionHtml(marked.parse(book.description) as string);
        }
        if (book.review) {
          setReviewHtml(marked.parse(book.review) as string);
        }
      });
    }
  }, [book]);

  const loadBook = useCallback(async () => {
    try {
      const res = await fetch(
        '/api/trpc/book.get?batch=1&input=' +
        encodeURIComponent(JSON.stringify({ '0': { json: { slug } } })),
      );
      const data = await res.json();
      const bookData = data[0]?.result?.data?.json;
      setBook(bookData ?? null);
      if (bookData) {
        setLikesCount(bookData.likesCount ?? 0);
        setDislikesCount(bookData.dislikesCount ?? 0);
        setUserReaction(bookData.userReaction ?? null);
      }
    } catch {
      setError('Failed to load book details');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) {
      loadBook();
    }
  }, [slug, loadBook]);

  async function handleReact(type: 'LIKE' | 'DISLIKE') {
    if (status !== 'authenticated') return;
    const newReaction = userReaction === type ? 'NONE' : type;

    // Optimistic UI updates
    let nextLikes = likesCount;
    let nextDislikes = dislikesCount;

    if (userReaction === 'LIKE') nextLikes--;
    if (userReaction === 'DISLIKE') nextDislikes--;

    if (newReaction === 'LIKE') nextLikes++;
    if (newReaction === 'DISLIKE') nextDislikes++;

    setLikesCount(nextLikes);
    setDislikesCount(nextDislikes);
    setUserReaction(newReaction === 'NONE' ? null : newReaction);

    try {
      const res = await fetch('/api/trpc/book.react?batch=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          '0': {
            json: {
              bookId: book?.id,
              type: newReaction,
            },
          },
        }),
      });
      const data = await res.json();
      if (data[0]?.error) {
        loadBook(); // Revert to server state on error
      }
    } catch {
      loadBook(); // Revert to server state on network error
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--portal-color-primary)] border-t-transparent" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="mx-auto max-w-xl px-8 py-16 text-center">
        <div className="rounded-xl bg-red-500/10 p-6 text-red-500 mb-6">
          {error || 'Book not found'}
        </div>
        <Link
          href="/books"
          className="inline-flex rounded-lg border border-compat px-4 py-2 text-sm font-medium text-[var(--portal-color-text)] hover:bg-[var(--portal-color-surface-alt)]"
        >
          ← Back to recommended books
        </Link>
      </div>
    );
  }

  const coverSrc = book.coverImage ?? book.coverImageURL ?? '';

  return (
    <div className="mx-auto max-w-[1000px] px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-12 items-start">
        {/* Left Side: Book Cover Art */}
        <div className="flex flex-col items-center md:items-start">
          <div className="relative aspect-[3/4] w-full max-w-[280px] overflow-hidden rounded-2xl bg-[var(--portal-color-surface-alt)] shadow-[0_16px_36px_rgba(0,0,0,0.18)] border border-[var(--portal-color-border)]/50">
            {coverSrc ? (
              <img src={coverSrc} alt={book.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
                <span className="text-6xl mb-4">📚</span>
                <span className="text-xs font-semibold text-[var(--portal-color-text-tertiary)] uppercase tracking-wider">
                  No Cover
                </span>
              </div>
            )}
            {/* Real book spine shadow effect */}
            <div className="absolute left-0 top-0 h-full w-4 bg-gradient-to-r from-black/25 to-transparent" />
            <div className="absolute left-4 top-0 h-full w-[1px] bg-white/5" />
          </div>
        </div>

        {/* Right Side: Metadata and Review Content */}
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--portal-color-text)] mb-2 leading-tight">
              {book.title}
            </h1>
            {book.originalBook && (
              <p className="text-sm font-[500] italic text-[var(--portal-color-text-secondary)] mb-4 tracking-wide">
                <Link
                  href={`/books/${book.originalBook.slug}`}
                  className="text-[var(--portal-color-primary)] hover:underline"
                >
                  {book.originalBook.title} by {book.originalBook.author}
                </Link>
              </p>
            )}

            {/* Meta details list */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs md:text-sm text-[var(--portal-color-text-secondary)]">
              <div>
                <span className="font-semibold text-[var(--portal-color-text)]">
                  {t('fields.author')}:
                </span>{' '}
                {book.author}
              </div>
              {book.originalBook && (
                <div>
                  <span className="font-semibold text-[var(--portal-color-text)]">
                    {t('fields.originalBook')}:
                  </span>{' '}
                  <Link
                    href={`/books/${book.originalBook.slug}`}
                    className="text-[var(--portal-color-primary)] hover:underline italic font-medium"
                  >
                    {book.originalBook.title}
                  </Link>
                </div>
              )}
              {book.publisher && (
                <div>
                  <span className="font-semibold text-[var(--portal-color-text)]">
                    {t('fields.publisher')}:
                  </span>{' '}
                  {book.publisher}
                </div>
              )}
              {book.publishYear && (
                <div>
                  <span className="font-semibold text-[var(--portal-color-text)]">
                    {t('fields.publishYear')}:
                  </span>{' '}
                  {book.publishYear}
                </div>
              )}
              {book.translator && (
                <div>
                  <span className="font-semibold text-[var(--portal-color-text)]">
                    {t('fields.translator')}:
                  </span>{' '}
                  {book.translator}
                </div>
              )}
              {book.isbn && (
                <div>
                  <span className="font-semibold text-[var(--portal-color-text)]">
                    {t('fields.isbn')}:
                  </span>{' '}
                  <span className="font-mono text-xs">{book.isbn}</span>
                </div>
              )}
            </div>

            {/* Reactions & Actions Bar */}
            <div className="mt-6 flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-3">
                {/* Like Button */}
                <button
                  type="button"
                  disabled={status !== 'authenticated'}
                  onClick={() => handleReact('LIKE')}
                  className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-300 ${userReaction === 'LIKE'
                    ? 'border-green-500 bg-green-500/10 text-green-500'
                    : 'border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] text-[var(--portal-color-text-secondary)] hover:text-green-500 hover:border-green-500/50'
                    } ${status !== 'authenticated'
                      ? 'cursor-not-allowed opacity-60'
                      : 'hover:-translate-y-0.5 active:translate-y-0'
                    }`}
                >
                  <svg
                    className="h-4 w-4"
                    fill={userReaction === 'LIKE' ? 'currentColor' : 'none'}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"
                    />
                  </svg>
                  <span>{likesCount}</span>
                </button>

                {/* Dislike Button */}
                <button
                  type="button"
                  disabled={status !== 'authenticated'}
                  onClick={() => handleReact('DISLIKE')}
                  className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-300 ${userReaction === 'DISLIKE'
                    ? 'border-red-500 bg-red-500/10 text-red-500'
                    : 'border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] text-[var(--portal-color-text-secondary)] hover:text-red-500 hover:border-red-500/50'
                    } ${status !== 'authenticated'
                      ? 'cursor-not-allowed opacity-60'
                      : 'hover:-translate-y-0.5 active:translate-y-0'
                    }`}
                >
                  <svg
                    className="h-4 w-4"
                    fill={userReaction === 'DISLIKE' ? 'currentColor' : 'none'}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3zm7-13h3a2 2 0 012 2v7a2 2 0 01-2 2h-3"
                    />
                  </svg>
                  <span>{dislikesCount}</span>
                </button>

                {/* E-Book Link Button */}
                {book.ebookUrl && (
                  <a
                    href={book.ebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-full border border-[var(--portal-color-primary)]/30 bg-[var(--portal-color-primary)]/10 px-4 py-1.5 text-xs font-semibold text-[var(--portal-color-primary)] transition-all duration-300 hover:bg-[var(--portal-color-primary)] hover:text-white hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                  >
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
                    <span>{t('fields.readOnline')}</span>
                    <svg
                      className="h-3.5 w-3.5 opacity-70"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                )}
              </div>

              {status !== 'authenticated' && (
                <span className="text-[11px] text-[var(--portal-color-text-tertiary)] italic">
                  * {t('reactions.loginRequired')}
                </span>
              )}
            </div>
          </div>

          {/* Description Section */}
          {book.description && (
            <div className="border-t border-[var(--portal-color-border)] pt-6">
              <h2 className="text-base font-bold uppercase tracking-wider text-[var(--portal-color-text-secondary)] mb-3">
                {t('fields.description')}
              </h2>
              <div
                className="prose prose-portal max-w-none text-sm text-[var(--portal-color-text)] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            </div>
          )}

          {/* Review / My Thoughts Section */}
          {book.review && (
            <div className="border-t border-[var(--portal-color-border)] pt-6">
              <h2 className="text-base font-bold uppercase tracking-wider text-[var(--portal-color-text-secondary)] mb-4">
                {t('fields.review')}
              </h2>
              <div className="relative rounded-2xl border border-[var(--portal-color-primary)]/15 bg-[var(--portal-color-primary-soft)]/20 p-6 md:p-8 overflow-hidden shadow-sm">
                {/* Big decorative quote mark */}
                <span className="absolute right-4 bottom-[-10px] text-8xl font-serif text-[var(--portal-color-primary)]/5 select-none leading-none">
                  ”
                </span>
                <div
                  className="prose prose-portal max-w-none text-[var(--portal-color-text)] leading-relaxed relative z-10 font-medium italic"
                  dangerouslySetInnerHTML={{ __html: reviewHtml }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <MermaidRenderer content={descriptionHtml + reviewHtml} />
    </div>
  );
}
