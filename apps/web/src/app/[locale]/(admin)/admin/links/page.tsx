'use client';

import { Dropdown, DropdownOption } from '@/components/ui/Dropdown';
import { ChevronDown, ChevronUp, Link as LinkIcon, Pencil, Plus, Trash2, X } from 'lucide-react';
import { type FormEvent, useCallback, useEffect, useState } from 'react';

const linkCategoryOptions: DropdownOption[] = [
  { value: 'friend', label: 'Friend' },
  { value: 'tool', label: 'Tool' },
  { value: 'inspiration', label: 'Inspiration' },
  { value: 'other', label: 'Other' },
];

const linkStatusOptions: DropdownOption[] = [
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
];

interface LinkEntry {
  id: string;
  name: string;
  url: string;
  rss?: string | null;
  avatar: string | null;
  screenshot?: string | null;
  description: string | null;
  category: string;
  status?: string;
  isAlive: boolean;
  sortOrder: number;
}

export default function LinksAdminPage() {
  const [links, setLinks] = useState<LinkEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form state for normal links
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    rss: '',
    avatar: '',
    screenshot: '',
    description: '',
    category: 'friend',
    status: 'approved',
    sortOrder: 0,
    isAlive: true,
  });

  // Self Link state
  const [selfData, setSelfData] = useState({
    name: '',
    url: '',
    rss: '',
    avatar: '',
    screenshot: '',
    description: '',
  });
  const [isSelfExpanded, setIsSelfExpanded] = useState(false);
  const [savingSelf, setSavingSelf] = useState(false);
  const [selfFeedback, setSelfFeedback] = useState<string | null>(null);

  const loadLinks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/trpc/admin.linkList?batch=1&input=${encodeURIComponent(JSON.stringify({ '0': { json: null } }))}`,
      );
      const data = await res.json();
      setLinks(data[0]?.result?.data?.json ?? []);
    } catch (e) {
      console.error('Failed to load links', e);
    }
    setLoading(false);
  }, []);

  const loadSelfLink = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/trpc/admin.linkGetSelf?batch=1&input=${encodeURIComponent(JSON.stringify({ '0': { json: null } }))}`,
      );
      const data = await res.json();
      const self = data[0]?.result?.data?.json;
      if (self && (self.name || self.url)) {
        setSelfData({
          name: self.name || '',
          url: self.url || '',
          rss: self.rss || '',
          avatar: self.avatar || '',
          screenshot: self.screenshot || '',
          description: self.description || '',
        });
        setIsSelfExpanded(false);
      } else {
        setIsSelfExpanded(true);
      }
    } catch (e) {
      console.error('Failed to load self link', e);
    }
  }, []);

  useEffect(() => {
    loadLinks();
    loadSelfLink();
  }, [loadLinks, loadSelfLink]);

  async function handleSaveSelf(e: FormEvent) {
    e.preventDefault();
    setSavingSelf(true);
    setSelfFeedback(null);
    try {
      await fetch('/api/trpc/admin.linkSaveSelf?batch=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ '0': { json: selfData } }),
      });
      setSelfFeedback('Site link info saved successfully!');
      setIsSelfExpanded(false);
      setTimeout(() => setSelfFeedback(null), 3000);
    } catch (e) {
      console.error('Failed to save self link', e);
      alert('Failed to save site link info');
    }
    setSavingSelf(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this link?')) return;
    try {
      await fetch('/api/trpc/admin.linkDelete?batch=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ '0': { json: { id } } }),
      });
      loadLinks();
    } catch (e) {
      console.error('Delete failed', e);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const endpoint = isEditing ? 'admin.linkUpdate' : 'admin.linkCreate';
      const payload = isEditing ? { ...formData, id: isEditing } : formData;

      await fetch(`/api/trpc/${endpoint}?batch=1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ '0': { json: payload } }),
      });

      setIsEditing(null);
      setIsCreating(false);
      setFormData({
        name: '',
        url: '',
        rss: '',
        avatar: '',
        screenshot: '',
        description: '',
        category: 'friend',
        status: 'approved',
        sortOrder: 0,
        isAlive: true,
      });
      loadLinks();
    } catch (err) {
      console.error('Submission failed', err);
      alert('Failed to save link. Check console for details.');
    }
  }

  function editLink(link: LinkEntry) {
    setFormData({
      name: link.name,
      url: link.url,
      rss: link.rss || '',
      avatar: link.avatar || '',
      screenshot: link.screenshot || '',
      description: link.description || '',
      category: link.category,
      status: link.status || 'approved',
      sortOrder: link.sortOrder,
      isAlive: link.isAlive,
    });
    setIsEditing(link.id);
    setIsCreating(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--portal-color-text)] flex items-center gap-2">
          <LinkIcon className="h-6 w-6 text-[var(--portal-color-primary)]" />
          Links Management
        </h1>
        <button
          onClick={() => {
            setIsCreating(true);
            setIsEditing(null);
            setFormData({
              name: '',
              url: '',
              rss: '',
              avatar: '',
              screenshot: '',
              description: '',
              category: 'friend',
              status: 'approved',
              sortOrder: 0,
              isAlive: true,
            });
          }}
          className="flex items-center gap-2 rounded-lg bg-[var(--portal-color-primary)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Link
        </button>
      </div>

      {/* My Site Link Info Configuration Card */}
      <div className="rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-5 shadow-sm transition-all">
        <div
          onClick={() => setIsSelfExpanded(!isSelfExpanded)}
          className="flex cursor-pointer items-center justify-between gap-4 select-none"
        >
          <div>
            <h2 className="text-lg font-semibold text-[var(--portal-color-text)] flex items-center gap-2">
              <span>🏠</span> My Site Link Info (本站友链信息配置)
            </h2>
            <p className="text-xs text-[var(--portal-color-text-secondary)] mt-0.5">
              This information will be displayed at the bottom of the /links page for other bloggers to copy.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {selfFeedback && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/30">
                {selfFeedback}
              </span>
            )}
            <button
              type="button"
              className="p-1.5 rounded-lg text-[var(--portal-color-text-tertiary)] hover:bg-[var(--portal-color-bg)] hover:text-[var(--portal-color-text)] transition-colors"
            >
              {isSelfExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {isSelfExpanded && (
          <form onSubmit={handleSaveSelf} className="grid gap-4 sm:grid-cols-2 pt-5 border-t border-[var(--portal-color-border)]/50 mt-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--portal-color-text-secondary)]">Site Name (Title)</label>
              <input
                required
                value={selfData.name}
                placeholder="e.g. Rick's Space"
                onChange={(e) => setSelfData((p) => ({ ...p, name: e.target.value }))}
                className="w-full rounded-md border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-1.5 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--portal-color-text-secondary)]">Site URL</label>
              <input
                required
                type="url"
                value={selfData.url}
                placeholder="https://example.com"
                onChange={(e) => setSelfData((p) => ({ ...p, url: e.target.value }))}
                className="w-full rounded-md border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-1.5 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--portal-color-text-secondary)]">Avatar URL</label>
              <input
                type="url"
                value={selfData.avatar}
                placeholder="https://example.com/avatar.png"
                onChange={(e) => setSelfData((p) => ({ ...p, avatar: e.target.value }))}
                className="w-full rounded-md border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-1.5 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--portal-color-text-secondary)]">Screenshot URL</label>
              <input
                type="url"
                value={selfData.screenshot}
                placeholder="https://example.com/screenshot.png"
                onChange={(e) => setSelfData((p) => ({ ...p, screenshot: e.target.value }))}
                className="w-full rounded-md border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-1.5 text-sm"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-medium text-[var(--portal-color-text-secondary)]">RSS Feed URL</label>
              <input
                type="url"
                value={selfData.rss}
                placeholder="https://example.com/feed.xml"
                onChange={(e) => setSelfData((p) => ({ ...p, rss: e.target.value }))}
                className="w-full rounded-md border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-1.5 text-sm"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-medium text-[var(--portal-color-text-secondary)]">Site Description</label>
              <input
                value={selfData.description}
                placeholder="A personal space dedicated to tech and life reflections..."
                onChange={(e) => setSelfData((p) => ({ ...p, description: e.target.value }))}
                className="w-full rounded-md border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-1.5 text-sm"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={savingSelf}
                className="rounded-lg bg-[var(--portal-color-primary)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {savingSelf ? 'Saving...' : 'Save Site Link Info'}
              </button>
            </div>
          </form>
        )}
      </div>

      {(isCreating || isEditing) && (
        <div className="rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--portal-color-text)]">
              {isEditing ? 'Edit Link' : 'Add New Link'}
            </h2>
            <button
              onClick={() => {
                setIsCreating(false);
                setIsEditing(null);
              }}
              className="text-[var(--portal-color-text-tertiary)] hover:text-[var(--portal-color-text)]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2 md:col-span-1">
              <label className="text-sm font-medium text-[var(--portal-color-text-secondary)]">
                Name
              </label>
              <input
                required
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                className="w-full rounded-md border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1 sm:col-span-2 md:col-span-1">
              <label className="text-sm font-medium text-[var(--portal-color-text-secondary)]">
                URL
              </label>
              <input
                required
                type="url"
                value={formData.url}
                onChange={(e) => setFormData((p) => ({ ...p, url: e.target.value }))}
                className="w-full rounded-md border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm font-medium text-[var(--portal-color-text-secondary)]">
                RSS Feed URL (Optional)
              </label>
              <input
                type="url"
                value={formData.rss}
                placeholder="https://example.com/feed.xml"
                onChange={(e) => setFormData((p) => ({ ...p, rss: e.target.value }))}
                className="w-full rounded-md border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm font-medium text-[var(--portal-color-text-secondary)]">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                className="w-full rounded-md border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-2 text-sm"
                rows={2}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[var(--portal-color-text-secondary)]">
                Avatar URL (Optional)
              </label>
              <input
                type="url"
                value={formData.avatar}
                onChange={(e) => setFormData((p) => ({ ...p, avatar: e.target.value }))}
                className="w-full rounded-md border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[var(--portal-color-text-secondary)]">
                Screenshot URL (Optional)
              </label>
              <input
                type="url"
                value={formData.screenshot}
                onChange={(e) => setFormData((p) => ({ ...p, screenshot: e.target.value }))}
                className="w-full rounded-md border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[var(--portal-color-text-secondary)]">
                Category
              </label>
              <Dropdown
                value={formData.category}
                onChange={(val) => setFormData((p) => ({ ...p, category: val }))}
                options={linkCategoryOptions}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[var(--portal-color-text-secondary)]">
                Status
              </label>
              <Dropdown
                value={formData.status}
                onChange={(val) => setFormData((p) => ({ ...p, status: val }))}
                options={linkStatusOptions}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[var(--portal-color-text-secondary)]">
                Sort Order
              </label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))
                }
                className="w-full rounded-md border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="isAlive"
                checked={formData.isAlive}
                onChange={(e) => setFormData((p) => ({ ...p, isAlive: e.target.checked }))}
                className="h-4 w-4 rounded border-[var(--portal-color-border)]"
              />
              <label
                htmlFor="isAlive"
                className="text-sm font-medium text-[var(--portal-color-text-secondary)]"
              >
                Site is active
              </label>
            </div>
            <div className="sm:col-span-2 mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setIsEditing(null);
                }}
                className="rounded-md px-4 py-2 text-sm text-[var(--portal-color-text-secondary)] border border-[var(--portal-color-border)] hover:bg-[var(--portal-color-bg)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-[var(--portal-color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                {isEditing ? 'Update Link' : 'Save Link'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] text-[var(--portal-color-text-secondary)]">
              <tr>
                <th className="px-4 py-3 font-medium">Link</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--portal-color-border)]">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-4 text-center text-sm text-[var(--portal-color-text-tertiary)]"
                  >
                    Loading...
                  </td>
                </tr>
              ) : links.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-sm text-[var(--portal-color-text-tertiary)]"
                  >
                    No links found
                  </td>
                </tr>
              ) : (
                links.map((link) => (
                  <tr
                    key={link.id}
                    className="hover:bg-[var(--portal-color-bg)]/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 font-medium text-[var(--portal-color-text)] hover:underline">
                        <a href={link.url} target="_blank" rel="noreferrer">
                          {link.name}
                        </a>
                        {link.rss && (
                          <span
                            title={`RSS: ${link.rss}`}
                            className="inline-flex items-center rounded-md bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-orange-600 dark:text-orange-400"
                          >
                            RSS
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[var(--portal-color-text-tertiary)] line-clamp-1 min-w-[200px]">
                        {link.description || link.url}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-[var(--portal-color-primary)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--portal-color-primary)] capitalize">
                        {link.category}
                      </span>
                      {link.status && link.status !== 'approved' && (
                        <span className={`ml-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                          link.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                        }`}>
                          {link.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${link.isAlive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${link.isAlive ? 'bg-green-500' : 'bg-red-500'}`}
                        ></span>
                        {link.isAlive ? 'Active' : 'Broken'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--portal-color-text-secondary)]">
                      {link.sortOrder}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => editLink(link)}
                          className="p-1.5 text-[var(--portal-color-text-tertiary)] hover:text-[var(--portal-color-primary)] transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(link.id)}
                          className="p-1.5 text-[var(--portal-color-text-tertiary)] hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
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
    </div>
  );
}
