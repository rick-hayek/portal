'use client';

import { useEffect, useState, startTransition } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { marked } from 'marked';

interface Category {
  id: string;
  name: string;
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [showNewCatForm, setShowNewCatForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [creatingCat, setCreatingCat] = useState(false);

  const [tab, setTab] = useState<'edit' | 'preview'>('edit');

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    setCreatingCat(true);
    try {
      const catSlug = newCatName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
        .replace(/^-|-$/g, '');

      const res = await fetch('/api/trpc/admin.categoryCreate?batch=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          '0': {
            json: { name: newCatName.trim(), slug: catSlug },
          },
        }),
      });
      const data = await res.json();
      const newCat = data[0]?.result?.data?.json;
      if (newCat) {
        setCategories((prev) => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)));
        setCategoryId(newCat.id);
        setNewCatName('');
        setShowNewCatForm(false);
      }
    } catch (err) {
      console.error('Failed to create category', err);
    } finally {
      setCreatingCat(false);
    }
  };

  // Load categories and post data
  useEffect(() => {
    async function loadData() {
      try {
        // Load categories
        const catRes = await fetch(
          '/api/trpc/category.list?batch=1&input=' +
            encodeURIComponent(JSON.stringify({ '0': { json: null } })),
        );
        const catData = await catRes.json();
        setCategories(catData[0]?.result?.data?.json ?? []);

        // Load post
        const postRes = await fetch(
          '/api/trpc/admin.postGet?batch=1&input=' +
            encodeURIComponent(JSON.stringify({ '0': { json: { id } } })),
        );
        const postData = await postRes.json();
        const post = postData[0]?.result?.data?.json;

        if (post) {
          setTitle(post.title);
          setSlug(post.slug);
          setExcerpt(post.excerpt ?? '');
          setContent(post.content);
          setCategoryId(post.categoryId ?? '');
          setStatus(post.status as 'draft' | 'published');
        } else {
          setError('Post not found');
        }
      } catch {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadData();
    }
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const res = await fetch('/api/trpc/admin.postUpdate?batch=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          '0': {
            json: {
              id,
              title,
              slug,
              content,
              excerpt: excerpt || undefined,
              status,
              categoryId: categoryId || null,
            },
          },
        }),
      });
      const data = await res.json();
      if (data[0]?.error) {
        setError(data[0].error.message ?? 'Failed to update post');
      } else {
        startTransition(() => {
          router.push('/admin/posts');
        });
      }
    } catch {
      setError('Network error');
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--portal-color-primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--portal-color-text)]">Edit Post</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </p>
        )}

        {/* Title */}
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
            placeholder="Post title"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">
            Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none font-mono"
          />
        </div>

        {/* Category + Status */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-[var(--portal-color-text)]">
                Category
              </label>
              <button
                type="button"
                onClick={() => setShowNewCatForm(!showNewCatForm)}
                className="text-xs text-[var(--portal-color-primary)] hover:underline focus:outline-none"
              >
                {showNewCatForm ? 'Select Category' : '+ Add New Category'}
              </button>
            </div>
            {showNewCatForm ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New category name"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={creatingCat || !newCatName.trim()}
                  className="rounded-lg bg-[var(--portal-color-primary)] px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {creatingCat ? 'Creating…' : 'Add'}
                </button>
              </div>
            ) : (
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:outline-none"
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
              className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)]"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">
            Excerpt
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
            placeholder="Brief summary (optional)"
          />
        </div>

        {/* Content (Markdown Editor with Preview Tab) */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-[var(--portal-color-text)]">
              Content (Markdown)
            </label>
            <div className="flex rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-background)] p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setTab('edit')}
                className={`rounded-md px-3 py-1.5 focus:outline-none transition-colors ${
                  tab === 'edit'
                    ? 'bg-[var(--portal-color-surface)] text-[var(--portal-color-text)] shadow-sm'
                    : 'text-[var(--portal-color-text-secondary)] hover:text-[var(--portal-color-text)]'
                }`}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setTab('preview')}
                className={`rounded-md px-3 py-1.5 focus:outline-none transition-colors ${
                  tab === 'preview'
                    ? 'bg-[var(--portal-color-surface)] text-[var(--portal-color-text)] shadow-sm'
                    : 'text-[var(--portal-color-text-secondary)] hover:text-[var(--portal-color-text)]'
                }`}
              >
                Preview
              </button>
            </div>
          </div>

          {tab === 'edit' ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={20}
              className="w-full resize-y rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-4 py-3 font-mono text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
              placeholder="Write your article in Markdown…"
            />
          ) : (
            <div className="w-full min-h-[440px] max-h-[600px] overflow-y-auto rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-6 py-5">
              <div
                className="prose prose-portal max-w-none"
                dangerouslySetInnerHTML={{ __html: marked.parse(content) }}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[var(--portal-color-primary)] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <Link
            href="/admin/posts"
            className="rounded-lg border border-[var(--portal-color-border)] px-5 py-2.5 text-sm text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-background)] flex items-center justify-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
