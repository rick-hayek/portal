'use client';

import { useCallback, useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';

interface Reference {
  id: string;
  slug: string;
  title: string;
  createdAt: string;
}

export default function ReferencesAdminPage() {
  const [references, setReferences] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [htmlCode, setHtmlCode] = useState('');
  const [fileName, setFileName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedId, setCopiedId] = useState('');

  // Auto-generate slug from title
  useEffect(() => {
    setSlug(
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
    );
  }, [title]);

  const loadReferences = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        '/api/trpc/reference.list?batch=1&input=' +
          encodeURIComponent(JSON.stringify({ '0': { json: null } })),
      );
      const data = await res.json();
      setReferences(data[0]?.result?.data?.json ?? []);
    } catch (e) {
      console.error('Failed to load references', e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadReferences();
  }, [loadReferences]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    // Auto populate title if empty
    if (!title) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setTitle(nameWithoutExt.replace(/[-_]+/g, ' '));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setHtmlCode(text);
    };
    reader.readAsText(file);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!title.trim() || !slug.trim() || !htmlCode.trim()) {
      setError('Please fill in all fields and upload an HTML file.');
      return;
    }
    setSaving(true);

    try {
      const res = await fetch('/api/trpc/reference.create?batch=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          '0': {
            json: { title: title.trim(), slug: slug.trim(), htmlCode: htmlCode.trim() },
          },
        }),
      });
      const json = await res.json();
      if (json[0]?.error) {
        setError(json[0].error.message ?? 'Failed to upload reference');
      } else {
        setSuccess('Reference successfully uploaded!');
        setTitle('');
        setSlug('');
        setHtmlCode('');
        setFileName('');
        // Reset file input if element exists
        const fileInput = document.getElementById('html-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        await loadReferences();
      }
    } catch {
      setError('Network error during upload');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this reference page?')) return;
    try {
      await fetch('/api/trpc/reference.delete?batch=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ '0': { json: { id } } }),
      });
      await loadReferences();
    } catch (e) {
      console.error('Delete failed', e);
    }
  };

  const copyEmbedCode = (refSlug: string, id: string) => {
    const embedCode = `<iframe src="/references/${refSlug}" width="100%" height="700" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode).then(() => {
      setCopiedId(`${id}-embed`);
      setTimeout(() => setCopiedId(''), 2000);
    });
  };

  const copyLinkCode = (refSlug: string, refTitle: string, id: string) => {
    const linkCode = `**<a href="/references/${refSlug}" target="_blank" rel="noopener noreferrer">👉 点击此处在新页面中打开${refTitle}</a>**`;
    navigator.clipboard.writeText(linkCode).then(() => {
      setCopiedId(`${id}-link`);
      setTimeout(() => setCopiedId(''), 2000);
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--portal-color-text)]">References Management</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols - List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="overflow-x-auto rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--portal-color-surface)]">
                <tr className="border-b border-[var(--portal-color-border)]">
                  <th className="px-4 py-3 text-left font-medium text-[var(--portal-color-text-secondary)]">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--portal-color-text-secondary)]">
                    Slug / Path
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--portal-color-text-secondary)]">
                    Created
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-[var(--portal-color-text-secondary)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-[var(--portal-color-border)]">
                      <td colSpan={4} className="px-4 py-3">
                        <div className="h-4 w-full animate-pulse rounded bg-[var(--portal-color-border)]" />
                      </td>
                    </tr>
                  ))
                ) : references.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-[var(--portal-color-text-secondary)]"
                    >
                      No references uploaded yet.
                    </td>
                  </tr>
                ) : (
                  references.map((ref) => (
                    <tr
                      key={ref.id}
                      className="border-b border-[var(--portal-color-border)] hover:bg-[var(--portal-color-background)]/30"
                    >
                      <td className="px-4 py-3 font-medium text-[var(--portal-color-text)]">
                        {ref.title}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--portal-color-text-secondary)]">
                        /references/{ref.slug}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--portal-color-text-secondary)]">
                        {new Date(ref.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-3 text-xs">
                          <button
                            onClick={() => copyEmbedCode(ref.slug, ref.id)}
                            className="text-[var(--portal-color-primary)] hover:underline font-semibold"
                          >
                            {copiedId === `${ref.id}-embed` ? 'Copied! ✅' : 'Copy Embed'}
                          </button>
                          <button
                            onClick={() => copyLinkCode(ref.slug, ref.title, ref.id)}
                            className="text-[var(--portal-color-primary)] hover:underline font-semibold"
                          >
                            {copiedId === `${ref.id}-link` ? 'Copied! ✅' : 'Copy Link'}
                          </button>
                          <a
                            href={`/references/${ref.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--portal-color-text-secondary)] hover:underline"
                          >
                            Open Link
                          </a>
                          <button
                            onClick={() => handleDelete(ref.id)}
                            className="text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col - Upload Form */}
        <div className="space-y-4">
          <form
            onSubmit={handleCreate}
            className="rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-5 space-y-4"
          >
            <h2 className="text-md font-bold text-[var(--portal-color-text)]">
              Upload Reference Page
            </h2>

            {error && (
              <p className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-lg bg-green-50 p-2.5 text-xs text-green-600 dark:bg-green-900/20 dark:text-green-400">
                {success}
              </p>
            )}

            {/* Title */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--portal-color-text)]">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-background)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
                placeholder="Reference Page Title"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--portal-color-text)]">
                Slug / Path URL
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-background)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none font-mono"
                placeholder="reference-page-slug"
              />
            </div>

            {/* HTML Upload */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--portal-color-text)]">
                HTML File (.html)
              </label>
              <div className="relative flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--portal-color-border)] bg-[var(--portal-color-background)] p-4 text-center">
                <input
                  type="file"
                  id="html-file-input"
                  accept=".html"
                  onChange={handleFileUpload}
                  required
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
                <span className="text-xl">📄</span>
                <span className="mt-1 text-xs text-[var(--portal-color-text-secondary)]">
                  {fileName ? fileName : 'Click or drag file to upload'}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || !htmlCode}
              className="w-full rounded-lg bg-[var(--portal-color-primary)] py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Uploading…' : 'Publish Reference'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
