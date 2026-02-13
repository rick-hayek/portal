'use client';

import { useEffect, useState } from 'react';

interface ConfigEntry {
    id: string;
    key: string;
    value: unknown;
}

const DEFAULT_KEYS = [
    { key: 'site.title', label: 'Site Title', type: 'text' },
    { key: 'site.description', label: 'Site Description', type: 'text' },
    { key: 'site.url', label: 'Site URL', type: 'text' },
    { key: 'seo.ogImage', label: 'Default OG Image', type: 'text' },
    { key: 'seo.twitterHandle', label: 'Twitter Handle', type: 'text' },
];

export default function AdminSettingsPage() {
    const [configs, setConfigs] = useState<ConfigEntry[]>([]);
    const [values, setValues] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState<string | null>(null);
    const [saved, setSaved] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/trpc/admin.configList?batch=1&input=' + encodeURIComponent(JSON.stringify({ '0': { json: null } })))
            .then(r => r.json())
            .then(data => {
                const list: ConfigEntry[] = data[0]?.result?.data?.json ?? [];
                setConfigs(list);
                const v: Record<string, string> = {};
                for (const c of list) {
                    v[c.key] = typeof c.value === 'string' ? c.value : JSON.stringify(c.value);
                }
                setValues(v);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    async function handleSave(key: string) {
        setSaving(key);
        setSaved(null);
        try {
            let value: unknown = values[key] ?? '';
            // Try parse JSON
            try { value = JSON.parse(value as string); } catch { /* keep as string */ }

            await fetch('/api/trpc/admin.configSet?batch=1', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ '0': { json: { key, value } } }),
            });
            setSaved(key);
        } catch (e) {
            console.error(e);
        }
        setSaving(null);
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[var(--portal-color-text)]">Settings</h1>

            {loading ? (
                <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-16 animate-pulse rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)]" />
                    ))}
                </div>
            ) : (
                <>
                    {/* Preset keys */}
                    <div className="rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-5">
                        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--portal-color-text-secondary)]">
                            Site Configuration
                        </h2>
                        <div className="space-y-4">
                            {DEFAULT_KEYS.map(({ key, label }) => (
                                <div key={key} className="flex items-end gap-3">
                                    <div className="flex-1">
                                        <label className="mb-1 block text-xs font-medium text-[var(--portal-color-text-secondary)]">{label}</label>
                                        <input
                                            type="text"
                                            value={values[key] ?? ''}
                                            onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
                                            className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-background)] px-3 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleSave(key)}
                                        disabled={saving === key}
                                        className="shrink-0 rounded-lg bg-[var(--portal-color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                                    >
                                        {saving === key ? '…' : saved === key ? '✓' : 'Save'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* All config entries */}
                    {configs.length > 0 && (
                        <div className="rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-5">
                            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--portal-color-text-secondary)]">
                                All Config Entries
                            </h2>
                            <div className="space-y-2">
                                {configs.map(c => (
                                    <div key={c.id} className="flex items-center gap-3 text-sm">
                                        <span className="w-48 shrink-0 font-mono text-[var(--portal-color-text-secondary)]">{c.key}</span>
                                        <span className="flex-1 truncate text-[var(--portal-color-text)]">
                                            {typeof c.value === 'string' ? c.value : JSON.stringify(c.value)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
