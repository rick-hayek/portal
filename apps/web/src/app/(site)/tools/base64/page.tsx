'use client';

import React, { useState } from 'react';
import { Hash, ArrowRightLeft, Copy, Check, ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';

type Mode = 'encode' | 'decode';

export default function Base64Page() {
    const [mode, setMode] = useState<Mode>('encode');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleProcess = (val: string, currentMode: Mode) => {
        setInput(val);
        setError(null);

        if (!val.trim()) {
            setOutput('');
            return;
        }

        try {
            if (currentMode === 'encode') {
                setOutput(btoa(unescape(encodeURIComponent(val))));
            } else {
                setOutput(decodeURIComponent(escape(atob(val))));
            }
        } catch (err) {
            setError(currentMode === 'encode' ? 'Failed to encode text' : 'Invalid Base64 string');
            setOutput('');
        }
    };

    const toggleMode = () => {
        const newMode = mode === 'encode' ? 'decode' : 'encode';
        setMode(newMode);
        // Swap input and output automatically when toggling
        handleProcess(output, newMode);
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                        <Hash className="h-6 w-6" />
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--portal-color-text)]">
                            Base64 Converter
                        </h1>
                        <p className="mt-2 text-[var(--portal-color-text-secondary)]">
                            Instantly encode or decode Base64 strings directly in your browser.
                        </p>
                    </div>
                    <div className="flex items-center rounded-lg bg-[var(--portal-color-surface)] p-1 ring-1 ring-[var(--portal-color-border)] shrink-0">
                        <button
                            onClick={() => mode !== 'encode' && toggleMode()}
                            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${mode === 'encode'
                                    ? 'bg-[var(--portal-color-primary)] text-white shadow'
                                    : 'text-[var(--portal-color-text-secondary)] hover:text-[var(--portal-color-text)] hover:bg-[var(--portal-color-bg)]'
                                }`}
                        >
                            Encode
                        </button>
                        <button
                            onClick={() => mode !== 'decode' && toggleMode()}
                            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${mode === 'decode'
                                    ? 'bg-[var(--portal-color-primary)] text-white shadow'
                                    : 'text-[var(--portal-color-text-secondary)] hover:text-[var(--portal-color-text)] hover:bg-[var(--portal-color-bg)]'
                                }`}
                        >
                            Decode
                        </button>
                    </div>
                </div>
            </header>

            <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] h-[400px]">
                {/* Input Section */}
                <div className="flex flex-col rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] shadow-sm">
                    <div className="flex items-center justify-between border-b border-[var(--portal-color-border)] px-4 py-3">
                        <h2 className="text-sm font-semibold text-[var(--portal-color-text)]">
                            {mode === 'encode' ? 'Plain Text Input' : 'Base64 Input'}
                        </h2>
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
                        onChange={(e) => handleProcess(e.target.value, mode)}
                        placeholder={`Paste your ${mode === 'encode' ? 'text' : 'Base64 string'} here...`}
                        className="w-full flex-1 resize-none bg-transparent p-4 text-sm font-mono text-[var(--portal-color-text)] outline-none placeholder:text-[var(--portal-color-text-tertiary)]"
                        spellCheck={false}
                    />
                    {error && (
                        <div className="border-t border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-600 dark:text-red-400">
                            {error}
                        </div>
                    )}
                </div>

                {/* Swap Button (Desktop) */}
                <div className="hidden lg:flex flex-col items-center justify-center">
                    <button
                        onClick={toggleMode}
                        className="rounded-full bg-[var(--portal-color-surface)] p-3 ring-1 ring-[var(--portal-color-border)] text-[var(--portal-color-text-tertiary)] transition-all hover:text-[var(--portal-color-primary)] hover:ring-[var(--portal-color-primary)] hover:shadow-md"
                        title="Swap and Convert"
                    >
                        <ArrowRightLeft className="h-6 w-6" />
                    </button>
                </div>

                {/* Output Section */}
                <div className="relative flex flex-col rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] shadow-sm">
                    <div className="flex items-center justify-between border-b border-[var(--portal-color-border)] px-4 py-3 bg-[var(--portal-color-bg)] rounded-t-2xl">
                        <h2 className="text-sm font-semibold text-[var(--portal-color-text)]">
                            {mode === 'encode' ? 'Base64 Output' : 'Plain Text Output'}
                        </h2>
                        <button
                            onClick={handleCopy}
                            disabled={!output}
                            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${copied
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-[var(--portal-color-surface)] text-[var(--portal-color-text)] ring-1 ring-[var(--portal-color-border)] hover:bg-[var(--portal-color-bg)] disabled:opacity-50'
                                }`}
                        >
                            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                    <div className="flex-1 p-4 bg-[var(--portal-color-bg)] rounded-b-2xl">
                        <textarea
                            readOnly
                            value={output}
                            placeholder="Output will appear here..."
                            className="h-full w-full resize-none bg-transparent text-sm font-mono text-[var(--portal-color-text)] outline-none placeholder:text-[var(--portal-color-text-tertiary)]"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
