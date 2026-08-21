'use client';

import { Check, Pencil, Trash2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

interface Category {
  id: string;
  name: string;
  name_en?: string | null;
  slug: string;
  _count?: {
    posts: number;
  };
}

export default function AdminCategoriesPage() {
  const t = useTranslations('Admin.categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create state
  const [newName, setNewName] = useState('');
  const [newNameEn, setNewNameEn] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [creating, setCreating] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editNameEn, setEditNameEn] = useState('');
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
      setError(t('createFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

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
              name_en: newNameEn.trim() || null,
              slug: newSlug.trim(),
            },
          },
        }),
      });
      const data = await res.json();
      if (data[0]?.error) {
        setError(data[0].error.message ?? t('createFailed'));
      } else {
        setNewName('');
        setNewNameEn('');
        setNewSlug('');
        loadCategories();
      }
    } catch {
      setError(t('createFailed'));
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
              name_en: editNameEn.trim() || null,
              slug: editSlug.trim(),
            },
          },
        }),
      });
      const data = await res.json();
      if (data[0]?.error) {
        setError(data[0].error.message ?? t('updateFailed'));
      } else {
        setEditingId(null);
        loadCategories();
      }
    } catch {
      setError(t('updateFailed'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(t('deleteConfirm', { name }))) return;

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
        setError(data[0].error.message ?? t('deleteFailed'));
      } else {
        loadCategories();
      }
    } catch {
      setError(t('deleteFailed'));
    }
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditNameEn(cat.name_en ?? '');
    setEditSlug(cat.slug);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--portal-color-text)]">{t('title')}</h1>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        {/* Create Form */}
        <div className="rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-5 h-fit space-y-4">
          <h2 className="text-lg font-bold text-[var(--portal-color-text)]">{t('addNew')}</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="flex flex-row md:flex-col items-center md:items-start gap-3 md:gap-1">
              <label
                htmlFor="category-name-zh"
                className="w-20 md:w-full text-xs font-semibold text-[var(--portal-color-text-secondary)] uppercase shrink-0"
              >
                {t('nameZh')}
              </label>
              <input
                id="category-name-zh"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="flex-1 md:w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
                placeholder={t('nameZhPlaceholder')}
              />
            </div>
            <div className="flex flex-row md:flex-col items-center md:items-start gap-3 md:gap-1">
              <label
                htmlFor="category-name-en"
                className="w-20 md:w-full text-xs font-semibold text-[var(--portal-color-text-secondary)] uppercase shrink-0"
              >
                {t('nameEn')}
              </label>
              <input
                id="category-name-en"
                type="text"
                value={newNameEn}
                onChange={(e) => setNewNameEn(e.target.value)}
                className="flex-1 md:w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
                placeholder={t('nameEnPlaceholder')}
              />
            </div>
            <div className="flex flex-row md:flex-col items-center md:items-start gap-3 md:gap-1">
              <label
                htmlFor="category-slug"
                className="w-20 md:w-full text-xs font-semibold text-[var(--portal-color-text-secondary)] uppercase shrink-0"
              >
                {t('slug')}
              </label>
              <input
                id="category-slug"
                type="text"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                required
                className="flex-1 md:w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 font-mono text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
                placeholder={t('slugPlaceholder')}
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="w-full rounded-lg bg-[var(--portal-color-primary)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {creating ? t('creating') : t('createBtn')}
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
                    {t('nameZh')}
                  </th>
                  <th className="px-2 sm:px-4 py-3 text-left font-semibold uppercase tracking-wider text-xs">
                    {t('nameEn')}
                  </th>
                  <th className="px-2 sm:px-4 py-3 text-left font-semibold uppercase tracking-wider text-xs">
                    {t('slug')}
                  </th>
                  <th className="px-2 sm:px-4 py-3 text-left font-semibold uppercase tracking-wider text-xs whitespace-nowrap">
                    {t('colPostCount')}
                  </th>
                  <th className="px-2 sm:px-4 py-3 text-right font-semibold uppercase tracking-wider text-xs whitespace-nowrap">
                    {t('colActions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton elements do not have a natural id
                    <tr key={i} className="border-b border-[var(--portal-color-border)]">
                      <td colSpan={5} className="px-2 sm:px-4 py-4">
                        <div className="h-5 w-full animate-pulse rounded bg-[var(--portal-color-border)]" />
                      </td>
                    </tr>
                  ))
                ) : categories.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-[var(--portal-color-text-secondary)]"
                    >
                      {t('noCategories')}
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
                          <div className="max-w-[90px] sm:max-w-[150px] truncate" title={cat.name}>
                            {cat.name}
                          </div>
                        )}
                      </td>
                      <td className="px-2 sm:px-4 py-3 font-medium text-[var(--portal-color-text-secondary)]">
                        {editingId === cat.id ? (
                          <input
                            type="text"
                            value={editNameEn}
                            onChange={(e) => setEditNameEn(e.target.value)}
                            className="rounded border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-2 py-1 text-sm text-[var(--portal-color-text)] focus:outline-none focus:border-[var(--portal-color-primary)] w-full"
                          />
                        ) : (
                          <div
                            className="max-w-[90px] sm:max-w-[150px] truncate"
                            title={cat.name_en ?? '—'}
                          >
                            {cat.name_en ?? '—'}
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
                          <div className="max-w-[80px] sm:max-w-[120px] truncate" title={cat.slug}>
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
                              <span className="hidden sm:inline">{t('save')}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-compat text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-bg)] transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">{t('cancel')}</span>
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
                              <span className="hidden sm:inline">{t('edit')}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(cat.id, cat.name)}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">{t('delete')}</span>
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

