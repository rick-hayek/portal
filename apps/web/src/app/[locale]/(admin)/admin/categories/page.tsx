'use client';

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
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--portal-color-text-secondary)] uppercase">
                Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
                placeholder="e.g. Technology"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--portal-color-text-secondary)] uppercase">
                Slug
              </label>
              <input
                type="text"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                required
                className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 font-mono text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
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
        <div className="rounded-xl border border-[var(--portal-color-border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--portal-color-surface)]">
              <tr className="border-b border-[var(--portal-color-border)]">
                <th className="px-4 py-3 text-left font-semibold text-[var(--portal-color-text-secondary)] uppercase tracking-wider text-xs">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--portal-color-text-secondary)] uppercase tracking-wider text-xs">
                  Slug
                </th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--portal-color-text-secondary)] uppercase tracking-wider text-xs">
                  Posts Count
                </th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--portal-color-text-secondary)] uppercase tracking-wider text-xs">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-[var(--portal-color-surface)]">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-[var(--portal-color-border)]">
                    <td colSpan={4} className="px-4 py-4">
                      <div className="h-5 w-full animate-pulse rounded bg-[var(--portal-color-border)]" />
                    </td>
                  </tr>
                ))
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[var(--portal-color-text-secondary)]">
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="border-b border-[var(--portal-color-border)] hover:bg-[var(--portal-color-background)] transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-[var(--portal-color-text)]">
                      {editingId === cat.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="rounded border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-2 py-1 text-sm text-[var(--portal-color-text)] focus:outline-none focus:border-[var(--portal-color-primary)] w-full"
                        />
                      ) : (
                        cat.name
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-[var(--portal-color-text-secondary)] text-xs">
                      {editingId === cat.id ? (
                        <input
                          type="text"
                          value={editSlug}
                          onChange={(e) => setEditSlug(e.target.value)}
                          className="rounded border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-2 py-1 font-mono text-xs text-[var(--portal-color-text)] focus:outline-none focus:border-[var(--portal-color-primary)] w-full"
                        />
                      ) : (
                        cat.slug
                      )}
                    </td>
                    <td className="px-4 py-3 text-[var(--portal-color-text-secondary)]">
                      {cat._count?.posts ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === cat.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdate(cat.id)}
                            disabled={saving}
                            className="text-xs text-[var(--portal-color-primary)] font-semibold hover:underline"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-xs text-[var(--portal-color-text-secondary)] hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(cat)}
                            className="text-xs text-[var(--portal-color-primary)] hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id, cat.name)}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Delete
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
  );
}
