'use client';

import { useParams, useRouter } from 'next/navigation';
import { startTransition, useEffect, useState } from 'react';
import { Dropdown } from '@/components/ui/Dropdown';
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
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  const [privacyPolicyEn, setPrivacyPolicyEn] = useState('');
  const [termsOfService, setTermsOfService] = useState('');
  const [termsOfServiceEn, setTermsOfServiceEn] = useState('');
  const [logo, setLogo] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descTab, setDescTab] = useState<'zh' | 'en'>('zh');
  const [privacyTab, setPrivacyTab] = useState<'zh' | 'en'>('zh');
  const [termsTab, setTermsTab] = useState<'zh' | 'en'>('zh');
  const [downloadLinks, setDownloadLinks] = useState<{ platform: string; url: string }[]>([]);
  const [newPlatform, setNewPlatform] = useState('appstore');
  const [newUrl, setNewUrl] = useState('');

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
          setPrivacyPolicy(project.privacyPolicy ?? '');
          setPrivacyPolicyEn(project.privacyPolicyEn ?? '');
          setTermsOfService(project.termsOfService ?? '');
          setTermsOfServiceEn(project.termsOfServiceEn ?? '');
          setLogo(project.logo ?? '');
          setDescriptionEn(project.descriptionEn ?? '');
          if (project.downloadLinks) {
            try {
              const links =
                typeof project.downloadLinks === 'string'
                  ? JSON.parse(project.downloadLinks)
                  : project.downloadLinks;
              if (Array.isArray(links)) {
                setDownloadLinks(links);
              }
            } catch (err) {
              console.error('Failed to parse downloadLinks', err);
            }
          }
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

  const handleAddLink = () => {
    if (!newUrl) return;
    setDownloadLinks([...downloadLinks, { platform: newPlatform, url: newUrl }]);
    setNewUrl('');
  };

  const handleDeleteLink = (index: number) => {
    setDownloadLinks(downloadLinks.filter((_, i) => i !== index));
  };

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
              privacyPolicy: privacyPolicy || null,
              privacyPolicyEn: privacyPolicyEn || null,
              termsOfService: termsOfService || null,
              termsOfServiceEn: termsOfServiceEn || null,
              logo: logo || null,
              descriptionEn: descriptionEn || null,
              downloadLinks: downloadLinks.length > 0 ? downloadLinks : null,
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
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-[var(--portal-color-text)]">
              Description (Markdown)
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDescTab('zh')}
                className={`px-2 py-0.5 text-xs rounded transition-colors ${
                  descTab === 'zh'
                    ? 'bg-[var(--portal-color-primary)] text-white font-medium'
                    : 'bg-[var(--portal-color-surface)] text-[var(--portal-color-text-secondary)] border border-compat'
                }`}
              >
                中文
              </button>
              <button
                type="button"
                onClick={() => setDescTab('en')}
                className={`px-2 py-0.5 text-xs rounded transition-colors ${
                  descTab === 'en'
                    ? 'bg-[var(--portal-color-primary)] text-white font-medium'
                    : 'bg-[var(--portal-color-surface)] text-[var(--portal-color-text-secondary)] border border-compat'
                }`}
              >
                English
              </button>
            </div>
          </div>
          {descTab === 'zh' ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              placeholder="中文描述..."
              className="w-full resize-y rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
            />
          ) : (
            <textarea
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              rows={5}
              placeholder="English description..."
              className="w-full resize-y rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
            />
          )}
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

        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--portal-color-text)]">
            Logo (SVG Code or Image URL, optional)
          </label>
          <textarea
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            rows={2}
            className="w-full resize-y rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
            placeholder="<svg... or https://... or /logo.png"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--portal-color-text)]">
            App Download Links
          </label>
          {downloadLinks.length > 0 && (
            <div className="mb-3 space-y-2">
              {downloadLinks.map((link, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-1.5 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[var(--portal-color-primary)] px-2 py-0.5 text-xs text-white uppercase font-semibold">
                      {link.platform}
                    </span>
                    <span className="text-[var(--portal-color-text)] truncate max-w-md font-mono text-xs">
                      {link.url}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteLink(idx)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 items-center">
            <div className="w-44 shrink-0">
              <Dropdown
                value={newPlatform}
                onChange={(val) => setNewPlatform(val)}
                options={[
                  { value: 'appstore', label: 'App Store' },
                  { value: 'playstore', label: 'Google Play' },
                  { value: 'windows', label: 'Windows' },
                  { value: 'macos', label: 'macOS' },
                  { value: 'linux', label: 'Linux' },
                  { value: 'apk', label: 'APK' },
                ]}
              />
            </div>
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Download URL (e.g. https://...)"
              className="flex-1 rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddLink}
              className="rounded-lg bg-[var(--portal-color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              + Add
            </button>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-[var(--portal-color-text)]">
              Privacy Policy (Markdown, optional)
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPrivacyTab('zh')}
                className={`px-2 py-0.5 text-xs rounded transition-colors ${
                  privacyTab === 'zh'
                    ? 'bg-[var(--portal-color-primary)] text-white font-medium'
                    : 'bg-[var(--portal-color-surface)] text-[var(--portal-color-text-secondary)] border border-compat'
                }`}
              >
                中文
              </button>
              <button
                type="button"
                onClick={() => setPrivacyTab('en')}
                className={`px-2 py-0.5 text-xs rounded transition-colors ${
                  privacyTab === 'en'
                    ? 'bg-[var(--portal-color-primary)] text-white font-medium'
                    : 'bg-[var(--portal-color-surface)] text-[var(--portal-color-text-secondary)] border border-compat'
                }`}
              >
                English
              </button>
            </div>
          </div>
          {privacyTab === 'zh' ? (
            <textarea
              value={privacyPolicy}
              onChange={(e) => setPrivacyPolicy(e.target.value)}
              rows={5}
              placeholder="中文隐私政策..."
              className="w-full resize-y rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
            />
          ) : (
            <textarea
              value={privacyPolicyEn}
              onChange={(e) => setPrivacyPolicyEn(e.target.value)}
              rows={5}
              placeholder="English Privacy Policy..."
              className="w-full resize-y rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
            />
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-[var(--portal-color-text)]">
              Terms of Service (Markdown, optional)
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTermsTab('zh')}
                className={`px-2 py-0.5 text-xs rounded transition-colors ${
                  termsTab === 'zh'
                    ? 'bg-[var(--portal-color-primary)] text-white font-medium'
                    : 'bg-[var(--portal-color-surface)] text-[var(--portal-color-text-secondary)] border border-compat'
                }`}
              >
                中文
              </button>
              <button
                type="button"
                onClick={() => setTermsTab('en')}
                className={`px-2 py-0.5 text-xs rounded transition-colors ${
                  termsTab === 'en'
                    ? 'bg-[var(--portal-color-primary)] text-white font-medium'
                    : 'bg-[var(--portal-color-surface)] text-[var(--portal-color-text-secondary)] border border-compat'
                }`}
              >
                English
              </button>
            </div>
          </div>
          {termsTab === 'zh' ? (
            <textarea
              value={termsOfService}
              onChange={(e) => setTermsOfService(e.target.value)}
              rows={5}
              placeholder="中文服务条款..."
              className="w-full resize-y rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
            />
          ) : (
            <textarea
              value={termsOfServiceEn}
              onChange={(e) => setTermsOfServiceEn(e.target.value)}
              rows={5}
              placeholder="English Terms of Service..."
              className="w-full resize-y rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
            />
          )}
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
