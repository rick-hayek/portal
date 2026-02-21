'use client';

import React, { useState } from 'react';
import { FileJson, Copy, Check, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function JsonFormatterPage() {
    const t = useTranslations('ToolsJson');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleFormat = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setInput(val);

        if (!val.trim()) {
            setOutput('');
            setError(null);
            return;
        }

        try {
            const parsed = JSON.parse(val);
            // Format with 2 spaces
            const formatted = JSON.stringify(parsed, null, 2);
            setOutput(formatted);
            setError(null);
        } catch (err: any) {
            setError(err.message || t('error'));
            setOutput('');
        }
    };

    const handleCopy = async () => {
        if (!output) return;
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text', err);
        }
    };

    const handleClear = () => {
        setInput('');
        setOutput('');
        setError(null);
    };

    return (
        <div className="mx-auto max-w-5xl space-y-8">
            <header className="space-y-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/tools"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] text-[var(--portal-color-text-secondary)] transition-colors hover:bg-[var(--portal-color-bg)] hover:text-[var(--portal-color-text)]"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                        <FileJson className="h-6 w-6" />
                    </div>
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-[var(--portal-color-text)]">
                        {t('title')}
                    </h1>
                    <p className="mt-2 text-[var(--portal-color-text-secondary)]">
                        {t('description')}
                    </p>
                </div>
            </header>

            <div className="grid gap-6 lg:grid-cols-2 h-[600px]">
                {/* Input Section */}
                <div className="flex flex-col rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] shadow-sm">
                    <div className="flex items-center justify-between border-b border-[var(--portal-color-border)] px-4 py-3">
                        <h2 className="text-sm font-semibold text-[var(--portal-color-text)]">{t('input')}</h2>
                        <button
                            onClick={handleClear}
                            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-[var(--portal-color-text-tertiary)] hover:bg-[var(--portal-color-bg)] hover:text-red-500 transition-colors"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Clear
                        </button>
                    </div>
                    <textarea
                        value={input}
                        onChange={handleFormat}
                        placeholder={t('inputPlaceholder')}
                        className="w-full flex-1 resize-none bg-transparent p-4 text-sm font-mono text-[var(--portal-color-text)] outline-none placeholder:text-[var(--portal-color-text-tertiary)]"
                        spellCheck={false}
                    />
                    {error && (
                        <div className="border-t border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-600 dark:text-red-400">
                            {error}
                        </div>
                    )}
                </div>

                {/* Output Section */}
                <div className="relative flex flex-col rounded-2xl border border-[var(--portal-color-border)] bg-[#1e1e1e] shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-[#1e1e1e]">
                        <h2 className="text-sm font-semibold text-gray-300">{t('output')}</h2>
                        <button
                            onClick={handleCopy}
                            disabled={!output}
                            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${copied
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:hover:bg-white/5 disabled:hover:text-gray-300'
                                }`}
                        >
                            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            {copied ? t('copied') : t('copy')}
                        </button>
                    </div>
                    <div className="flex-1 overflow-auto p-4">
                        <pre className="text-sm font-mono text-[#d4d4d4]">
                            <code>
                                {output || `// ${t('outputEmpty')}`}
                            </code>
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}
