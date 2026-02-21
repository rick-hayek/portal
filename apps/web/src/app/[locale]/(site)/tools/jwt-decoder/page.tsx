'use client';

import React, { useState } from 'react';
import { Shield, ArrowLeft, Trash2, Check, Copy } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

interface JwtPayload {
    header: any;
    payload: any;
    signature: string;
}

export default function JwtDecoderPage() {
    const t = useTranslations('ToolsJwt');
    const [input, setInput] = useState('');
    const [decoded, setDecoded] = useState<JwtPayload | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copiedSection, setCopiedSection] = useState<string | null>(null);

    const handleProcess = (val: string) => {
        setInput(val);

        if (!val.trim()) {
            setDecoded(null);
            setError(null);
            return;
        }

        try {
            const parts = val.split('.');
            if (parts.length !== 3) {
                throw new Error('JWT must have exactly 3 parts (header.payload.signature)');
            }

            const header = JSON.parse(decodeURIComponent(escape(atob(parts[0]))));
            const payload = JSON.parse(decodeURIComponent(escape(atob(parts[1]))));
            const signature = parts[2];

            setDecoded({ header, payload, signature });
            setError(null);
        } catch (err: any) {
            setError(err.message || t('error'));
            setDecoded(null);
        }
    };

    const handleCopy = async (text: string, section: string) => {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            setCopiedSection(section);
            setTimeout(() => setCopiedSection(null), 2000);
        } catch (err) {
            console.error('Failed to copy text', err);
        }
    };

    const handleClear = () => {
        setInput('');
        setDecoded(null);
        setError(null);
    };

    const getPartStyle = (index: number) => {
        switch (index) {
            case 0: return 'text-red-500';
            case 1: return 'text-purple-500';
            case 2: return 'text-blue-500';
            default: return 'text-[var(--portal-color-text)]';
        }
    };

    const renderInputHighlight = () => {
        if (!input || input.split('.').length !== 3) return input;
        const [h, p, s] = input.split('.');
        return (
            <div className="font-mono text-sm break-all whitespace-pre-wrap">
                <span className="text-red-500">{h}</span>
                <span className="text-[var(--portal-color-text)]">.</span>
                <span className="text-purple-500">{p}</span>
                <span className="text-[var(--portal-color-text)]">.</span>
                <span className="text-blue-500">{s}</span>
            </div>
        );
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                        <Shield className="h-6 w-6" />
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

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Input Section */}
                <div className="flex flex-col rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] shadow-sm h-[600px]">
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
                    <div className="relative flex-1 p-4">
                        <textarea
                            value={input}
                            onChange={(e) => handleProcess(e.target.value)}
                            placeholder={t('inputPlaceholder')}
                            className={`absolute inset-4 z-10 w-[calc(100%-2rem)] h-[calc(100%-2rem)] resize-none bg-transparent text-sm font-mono outline-none ${input && !error ? 'text-transparent caret-[var(--portal-color-text)]' : 'text-[var(--portal-color-text)]'} placeholder:text-[var(--portal-color-text-tertiary)]`}
                            spellCheck={false}
                        />
                        {/* Overlay with colored text */}
                        {input && !error && (
                            <div className="absolute inset-4 z-0 pointer-events-none w-[calc(100%-2rem)] h-[calc(100%-2rem)]">
                                {renderInputHighlight()}
                            </div>
                        )}
                    </div>
                    {error && (
                        <div className="border-t border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-600 dark:text-red-400">
                            {error}
                        </div>
                    )}
                </div>

                {/* Decoded Sections */}
                <div className="flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex flex-col rounded-2xl border border-[var(--portal-color-border)] bg-[#1e1e1e] shadow-sm overflow-hidden h-fit">
                        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-[#1e1e1e]">
                            <h2 className="text-sm font-semibold text-gray-300">
                                {t('header')}
                            </h2>
                            <button
                                onClick={() => handleCopy(JSON.stringify(decoded?.header, null, 2) || '', 'header')}
                                disabled={!decoded}
                                className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${copiedSection === 'header'
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-50'
                                    }`}
                            >
                                {copiedSection === 'header' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                        </div>
                        <div className="p-4 overflow-auto max-h-[200px]">
                            <pre className="text-sm font-mono text-[#d4d4d4]">
                                <code className="text-red-300">
                                    {decoded ? JSON.stringify(decoded.header, null, 2) : '{}'}
                                </code>
                            </pre>
                        </div>
                    </div>

                    {/* Payload */}
                    <div className="flex flex-col rounded-2xl border border-[var(--portal-color-border)] bg-[#1e1e1e] shadow-sm overflow-hidden flex-1">
                        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-[#1e1e1e]">
                            <h2 className="text-sm font-semibold text-gray-300">
                                {t('payload')}
                            </h2>
                            <button
                                onClick={() => handleCopy(JSON.stringify(decoded?.payload, null, 2) || '', 'payload')}
                                disabled={!decoded}
                                className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${copiedSection === 'payload'
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-50'
                                    }`}
                            >
                                {copiedSection === 'payload' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                        </div>
                        <div className="p-4 overflow-auto h-[250px]">
                            <pre className="text-sm font-mono text-[#d4d4d4]">
                                <code className="text-purple-300">
                                    {decoded ? JSON.stringify(decoded.payload, null, 2) : '{}'}
                                </code>
                            </pre>
                        </div>
                    </div>

                    {/* Signature */}
                    <div className="flex flex-col rounded-2xl border border-[var(--portal-color-border)] bg-[#1e1e1e] shadow-sm overflow-hidden h-fit">
                        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-[#1e1e1e]">
                            <h2 className="text-sm font-semibold text-gray-300">
                                {t('signature')}
                            </h2>
                            <button
                                onClick={() => handleCopy(decoded?.signature || '', 'signature')}
                                disabled={!decoded}
                                className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${copiedSection === 'signature'
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-50'
                                    }`}
                            >
                                {copiedSection === 'signature' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                        </div>
                        <div className="p-4 overflow-auto break-all">
                            <pre className="text-sm font-mono text-blue-300">
                                <code>
                                    {decoded?.signature || 'signature string'}
                                </code>
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
