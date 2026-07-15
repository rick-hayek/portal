'use client';

import { Check, Pencil, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: {
    posts: number;
  };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create state
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [creating, setCreating] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [saving, setSaving] = useState(false);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        '/api/trpc/category.list?batch=1&input=' +
          encodeURIComponent(JSON.stringify({ '0': { json: null } })),
      );
      const data = await res.json();
      setCategories(data[0]?.result?.data?.json ?? []);
    } catch {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Auto generate slug for new category
  useEffect(() => {
    setNewSlug(
      newName
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
        .replace(/^-|-$/g, ''),
    );
  }, [newName]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newSlug.trim()) return;

    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/trpc/admin.categoryCreate?batch=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          '0': {
            json: {
              name: newName.trim(),
              slug: newSlug.trim(),
            },
          },
        }),
      });
      const data = await res.json();
      if (data[0]?.error) {
        setError(data[0].error.message ?? 'Failed to create category');
      } else {
        setNewName('');
        setNewSlug('');
        loadCategories();
      }
    } catch {
      setError('Network error');
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdate(id: string) {
    if (!editName.trim() || !editSlug.trim()) return;

    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/trpc/admin.categoryUpdate?batch=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          '0': {
            json: {
              id,
              name: editName.trim(),
              slug: editSlug.trim(),
            },
          },
        }),
      });
      const data = await res.json();
      if (data[0]?.error) {
        setError(data[0].error.message ?? 'Failed to update category');
      } else {
        setEditingId(null);
        loadCategories();
      }
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete the category "${name}"?`)) return;

    setError('');
    try {
      const res = await fetch('/api/trpc/admin.categoryDelete?batch=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          '0': {
            json: { id },
          },
        }),
      });
      const data = await res.json();
      if (data[0]?.error) {
        setError(data[0].error.message ?? 'Failed to delete category');
      } else {
        loadCategories();
      }
    } catch {
      setError('Network error');
    }
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditSlug(cat.slug);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--portal-color-text)]">Categories</h1>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        {/* Create Form */}
        <div className="rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-5 h-fit space-y-4">
          <h2 className="text-lg font-bold text-[var(--portal-color-text)]">New Category</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="flex flex-row md:flex-col items-center md:items-start gap-3 md:gap-1">
              <label
                htmlFor="category-name"
                className="w-12 md:w-full text-xs font-semibold text-[var(--portal-color-text-secondary)] uppercase shrink-0"
              >
                Name
              </label>
              <input
                id="category-name"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="flex-1 md:w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
                placeholder="e.g. Technology"
              />
            </div>
            <div className="flex flex-row md:flex-col items-center md:items-start gap-3 md:gap-1">
              <label
                htmlFor="category-slug"
                className="w-12 md:w-full text-xs font-semibold text-[var(--portal-color-text-secondary)] uppercase shrink-0"
              >
                Slug
              </label>
              <input
                id="category-slug"
                type="text"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                required
                className="flex-1 md:w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 font-mono text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
                placeholder="e.g. technology"
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="w-full rounded-lg bg-[var(--portal-color-primary)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {creating ? 'Creating…' : 'Create Category'}
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="min-w-0 overflow-hidden rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-[var(--portal-color-text)]">
              <thead>
                <tr className="border-b border-[var(--portal-color-border)] bg-[var(--portal-color-surface-alt)] font-medium text-[var(--portal-color-text-secondary)]">
                  <th className="px-2 sm:px-4 py-3 text-left font-semibold uppercase tracking-wider text-xs">
                    Name
                  </th>
                  <th className="px-2 sm:px-4 py-3 text-left font-semibold uppercase tracking-wider text-xs">
                    Slug
                  </th>
                  <th className="px-2 sm:px-4 py-3 text-left font-semibold uppercase tracking-wider text-xs whitespace-nowrap">
                    <span className="hidden sm:inline">Posts Count</span>
                    <span className="sm:hidden">Posts</span>
                  </th>
                  <th className="px-2 sm:px-4 py-3 text-right font-semibold uppercase tracking-wider text-xs whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton elements do not have a natural id
                    <tr key={i} className="border-b border-[var(--portal-color-border)]">
                      <td colSpan={4} className="px-2 sm:px-4 py-4">
                        <div className="h-5 w-full animate-pulse rounded bg-[var(--portal-color-border)]" />
                      </td>
                    </tr>
                  ))
                ) : categories.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-[var(--portal-color-text-secondary)]"
                    >
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr
                      key={cat.id}
                      className="border-b border-[var(--portal-color-border)] hover:bg-[var(--portal-color-surface-alt)]/50 transition-colors"
                    >
                      <td className="px-2 sm:px-4 py-3 font-medium text-[var(--portal-color-text)]">
                        {editingId === cat.id ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="rounded border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-2 py-1 text-sm text-[var(--portal-color-text)] focus:outline-none focus:border-[var(--portal-color-primary)] w-full"
                          />
                        ) : (
                          <div className="max-w-[90px] sm:max-w-[200px] truncate" title={cat.name}>
                            {cat.name}
                          </div>
                        )}
                      </td>
                      <td className="px-2 sm:px-4 py-3 font-mono text-[var(--portal-color-text-secondary)] text-xs">
                        {editingId === cat.id ? (
                          <input
                            type="text"
                            value={editSlug}
                            onChange={(e) => setEditSlug(e.target.value)}
                            className="rounded border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-2 py-1 font-mono text-xs text-[var(--portal-color-text)] focus:outline-none focus:border-[var(--portal-color-primary)] w-full"
                          />
                        ) : (
                          <div className="max-w-[80px] sm:max-w-[150px] truncate" title={cat.slug}>
                            {cat.slug}
                          </div>
                        )}
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-[var(--portal-color-text-secondary)]">
                        {cat._count?.posts ?? 0}
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-right whitespace-nowrap">
                        {editingId === cat.id ? (
                          <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdate(cat.id)}
                              disabled={saving}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-[var(--portal-color-primary)]/20 text-[var(--portal-color-primary)] hover:bg-[var(--portal-color-primary)]/10 transition-colors disabled:opacity-50"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Save</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-compat text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-bg)] transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Cancel</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(cat)}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-compat text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-bg)] transition-colors"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(cat.id, cat.name)}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
