'use client';

import { useTranslations } from 'next-intl';
import { use, useCallback, useEffect, useState, useTransition } from 'react';
import { Dropdown } from '@/components/ui/Dropdown';
import { Link, useRouter } from '@/i18n/routing';

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default function AdminEditBookPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const t = useTranslations('Books');
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [author, setAuthor] = useState('');
  const [coverSource, setCoverSource] = useState<'url' | 'upload'>('url');
  const [coverImageURL, setCoverImageURL] = useState('');
  const [coverImage, setCoverImage] = useState(''); // Base64
  const [publisher, setPublisher] = useState('');
  const [translator, setTranslator] = useState('');
  const [isbn, setIsbn] = useState('');
  const [publishYear, setPublishYear] = useState('');
  const [ebookUrl, setEbookUrl] = useState('');
  const [originalBookId, setOriginalBookId] = useState('');
  const [allBooks, setAllBooks] = useState<{ id: string; title: string; author: string }[]>([]);
  const [description, setDescription] = useState('');
  const [review, setReview] = useState('');

  // Fetch all books for the original book dropdown selection
  useEffect(() => {
    async function loadBooksList() {
      try {
        const res = await fetch('/api/trpc/admin.bookList?batch=1');
        const data = await res.json();
        const list = data[0]?.result?.data?.json;
        if (Array.isArray(list)) {
          setAllBooks(list);
        }
      } catch (e) {
        console.error('Failed to load books list', e);
      }
    }
    loadBooksList();
  }, []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadBook = useCallback(async () => {
    try {
      const res = await fetch(
        '/api/trpc/admin.bookGet?batch=1&input=' +
          encodeURIComponent(JSON.stringify({ '0': { json: { id } } })),
      );
      const data = await res.json();
      const book = data[0]?.result?.data?.json;

      if (book) {
        setTitle(book.title);
        setSlug(book.slug ?? '');
        setAuthor(book.author);
        setPublisher(book.publisher ?? '');
        setTranslator(book.translator ?? '');
        setIsbn(book.isbn ?? '');
        setPublishYear(book.publishYear ?? '');
        setEbookUrl(book.ebookUrl ?? '');
        setOriginalBookId(book.originalBookId ?? '');
        setDescription(book.description ?? '');
        setReview(book.review ?? '');
        if (book.coverImage) {
          setCoverSource('upload');
          setCoverImage(book.coverImage);
        } else if (book.coverImageURL) {
          setCoverSource('url');
          setCoverImageURL(book.coverImageURL);
        }
      } else {
        setError('Book not found');
      }
    } catch {
      setError('Failed to load book details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadBook();
    }
  }, [id, loadBook]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      alert('File size exceeds 500KB limit.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImage(reader.result as string);
      setCoverImageURL(''); // Clear remote URL when uploading local file
    };
    reader.readAsDataURL(file);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !slug.trim()) {
      setError('Title, Author, and URL Slug are required.');
      return;
    }
    if (coverSource === 'url' && coverImageURL.trim() && !coverImageURL.startsWith('http')) {
      setError('Please provide a valid image URL starting with http/https.');
      return;
    }
    if (!coverImage && !coverImageURL) {
      setError('Please provide a book cover (either upload one or provide a URL).');
      return;
    }

    setError('');
    setSaving(true);
    try {
      const res = await fetch('/api/trpc/admin.bookUpdate?batch=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          '0': {
            json: {
              id,
              title: title.trim(),
              author: author.trim(),
              slug: slug.trim().toLowerCase(),
              coverImageURL: coverSource === 'url' && coverImageURL ? coverImageURL.trim() : null,
              coverImage: coverSource === 'upload' && coverImage ? coverImage : null,
              publisher: publisher.trim() || null,
              translator: translator.trim() || null,
              isbn: isbn.trim() || null,
              publishYear: publishYear.trim() || null,
              ebookUrl: ebookUrl.trim() || null,
              originalBookId: originalBookId || null,
              description: description.trim() || null,
              review: review.trim() || null,
            },
          },
        }),
      });
      const data = await res.json();
      if (data[0]?.error) {
        setError(data[0].error.message ?? 'Failed to update book');
      } else {
        startTransition(() => {
          router.push('/admin/books');
        });
      }
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--portal-color-primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between border-b border-[var(--portal-color-border)] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--portal-color-text)]">
            Edit Book Recommendation
          </h1>
          <p className="text-sm text-[var(--portal-color-text-secondary)]">
            Modify details and reviews for "{title || 'this book'}".
          </p>
        </div>
        <Link
          href="/admin/books"
          className="rounded-lg border border-compat px-4 py-2 text-sm font-medium text-[var(--portal-color-text)] hover:bg-[var(--portal-color-surface-alt)]"
        >
          Cancel
        </Link>
      </div>

      {error && <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-500">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">
              Book Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                // Auto-generate slug from title ONLY if it was empty
                if (!slug) {
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .trim()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/(^-|-$)/g, ''),
                  );
                }
              }}
              placeholder="e.g. Clean Code"
              className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">
              {t('fields.author')} *
            </label>
            <input
              type="text"
              required
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. Robert C. Martin"
              className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">
              URL Slug *
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
              placeholder="e.g. clean-code"
              className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
            />
          </div>
        </div>

        {/* Cover Image Block */}
        <div className="rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface-alt)]/30 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--portal-color-text)]">
              Book Cover *
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCoverSource('url')}
                className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                  coverSource === 'url'
                    ? 'bg-[var(--portal-color-primary)] text-white'
                    : 'bg-[var(--portal-color-surface)] border border-compat text-[var(--portal-color-text-secondary)]'
                }`}
              >
                URL Link
              </button>
              <button
                type="button"
                onClick={() => setCoverSource('upload')}
                className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                  coverSource === 'upload'
                    ? 'bg-[var(--portal-color-primary)] text-white'
                    : 'bg-[var(--portal-color-surface)] border border-compat text-[var(--portal-color-text-secondary)]'
                }`}
              >
                Upload File
              </button>
            </div>
          </div>

          {coverSource === 'url' ? (
            <div>
              <input
                type="text"
                value={coverImageURL}
                onChange={(e) => {
                  setCoverImageURL(e.target.value);
                  setCoverImage('');
                }}
                placeholder="https://your-site.com/cover.jpg"
                className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
              />
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-[var(--portal-color-text-secondary)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-compat file:bg-[var(--portal-color-surface)] file:text-[var(--portal-color-text)] file:text-sm file:font-semibold hover:file:bg-[var(--portal-color-surface-alt)]"
              />
              {(coverImage || coverImageURL) && (
                <img
                  src={coverImage || coverImageURL}
                  alt="Current cover"
                  className="h-20 w-14 object-cover rounded shadow border border-[var(--portal-color-border)]"
                />
              )}
            </div>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">
              {t('fields.publisher')} ({t('optional')})
            </label>
            <input
              type="text"
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
              placeholder="e.g. Prentice Hall"
              className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">
              {t('fields.translator')} ({t('optional')})
            </label>
            <input
              type="text"
              value={translator}
              onChange={(e) => setTranslator(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">
              {t('fields.isbn')} ({t('optional')})
            </label>
            <input
              type="text"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="e.g. 978-0132350884"
              className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">
              {t('fields.publishYear')} ({t('optional')})
            </label>
            <input
              type="text"
              value={publishYear}
              onChange={(e) => setPublishYear(e.target.value)}
              placeholder="e.g. 1943"
              className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">
              {t('fields.ebookUrl')} ({t('optional')})
            </label>
            <input
              type="url"
              value={ebookUrl}
              onChange={(e) => setEbookUrl(e.target.value)}
              placeholder="https://example.com/book.pdf"
              className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">
              {t('fields.originalBook')} ({t('optional')})
            </label>
            <Dropdown
              value={originalBookId}
              onChange={(val) => setOriginalBookId(val)}
              options={[
                { value: '', label: `— ${t('optional')} —` },
                ...allBooks
                  .filter((b) => b.id !== id)
                  .map((b) => ({
                    value: b.id,
                    label: b.author ? `${b.title} (${b.author})` : b.title,
                  })),
              ]}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">
            {t('fields.description')} (Markdown, {t('optional')})
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Introduce the book's background, core concepts, or main content..."
            className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">
            {t('fields.review')} (Markdown, {t('optional')})
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={5}
            placeholder="Share your personal thoughts, key takeaways, and why you recommend this book..."
            className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving || isPending}
          className="w-full rounded-lg bg-[var(--portal-color-primary)] py-2.5 text-sm font-medium text-white shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Update Book Recommendation'}
        </button>
      </form>
    </div>
  );
}
