'use client';

import { useEffect, useState, startTransition } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [techStack, setTechStack] = useState('');
  const [featured, setFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch project details
  useEffect(() => {
    async function loadProject() {
      try {
        const res = await fetch(
          '/api/trpc/admin.projectGet?batch=1&input=' +
            encodeURIComponent(JSON.stringify({ '0': { json: { id } } })),
        );
        const data = await res.json();
        const project = data[0]?.result?.data?.json;

        if (project) {
          setTitle(project.title);
          setSlug(project.slug);
          setDescription(project.description);
          setCoverImage(project.coverImage ?? '');
          setLiveUrl(project.liveUrl ?? '');
          setRepoUrl(project.repoUrl ?? '');
          setTechStack(project.techStack.join(', '));
          setFeatured(project.featured);
          setSortOrder(project.sortOrder ?? 0);
        } else {
          setError('Project not found');
        }
      } catch {
        setError('Failed to load project');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadProject();
    }
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch('/api/trpc/admin.projectUpdate?batch=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          '0': {
            json: {
              id,
              title,
              slug,
              description,
              coverImage: coverImage || null,
              liveUrl: liveUrl || null,
              repoUrl: repoUrl || null,
              techStack: techStack
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
              featured,
              sortOrder,
            },
          },
        }),
      });
      const data = await res.json();
      if (data[0]?.error) {
        setError(data[0].error.message ?? 'Failed to update project');
      } else {
        startTransition(() => {
          router.push('/admin/portfolio');
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
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-[var(--portal-color-text)]">Edit Project</h1>

      <form onSubmit={handleSave} className="space-y-5">
        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </p>
        )}

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
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">
            Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 font-mono text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
            className="w-full resize-y rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">
              Cover Image URL
            </label>
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">
              Tech Stack
            </label>
            <input
              type="text"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
              placeholder="React, TypeScript, Prisma"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">
              Live URL
            </label>
            <input
              type="text"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">
              Repo URL
            </label>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">
              Sort Order
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
              className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center gap-2 text-sm text-[var(--portal-color-text)] mt-5">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-[var(--portal-color-border)]"
              />
              Featured project
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[var(--portal-color-primary)] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <Link
            href="/admin/portfolio"
            className="rounded-lg border border-[var(--portal-color-border)] px-5 py-2.5 text-sm text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-background)] flex items-center justify-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
