'use client';

import { ArrowRightLeft, Check, Copy, Hash, Lock, Trash2, Unlock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { ToolDropdown, ToolHeader } from '@/components/tools/ToolHeader';

type Mode = 'encode' | 'decode';

export default function Base64Page() {
  const t = useTranslations('ToolsBase64');
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
      setError(currentMode === 'decode' ? 'Invalid Base64 string' : 'Encoding failed');
      setOutput('');
    }
  };

  const handleModeChange = (newMode: Mode) => {
    if (newMode !== mode) {
      setMode(newMode);
      handleProcess(output, newMode);
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
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
      <ToolHeader
        title={t('title')}
        description={t('description')}
        icon={<Hash className="h-6 w-6" />}
        iconBgColor="bg-[rgba(168,85,247,0.1)] text-purple-500"
        actions={
          <ToolDropdown
            value={mode}
            onChange={(m) => handleModeChange(m)}
            headerTitle="Mode"
            options={[
              { id: 'encode', label: t('encode'), icon: <Lock className="h-3.5 w-3.5" /> },
              { id: 'decode', label: t('decode'), icon: <Unlock className="h-3.5 w-3.5" /> },
            ]}
          />
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] h-[400px]">
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
            onChange={(e) => handleProcess(e.target.value, mode)}
            placeholder={t('inputPlaceholder')}
            className="w-full flex-1 resize-none bg-transparent p-4 text-sm font-mono text-[var(--portal-color-text)] outline-none placeholder:text-[var(--portal-color-text-tertiary)]"
            spellCheck={false}
          />
          {error && (
            <div className="border-t border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.05)] px-4 py-3 text-xs text-red-600 dark:text-red-400">
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
            <h2 className="text-sm font-semibold text-[var(--portal-color-text)]">{t('output')}</h2>
            <button
              onClick={handleCopy}
              disabled={!output}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                copied
                  ? 'bg-green-100 text-green-700 dark:bg-[rgba(20,83,45,0.3)] dark:text-green-400'
                  : 'bg-[var(--portal-color-surface)] text-[var(--portal-color-text)] ring-1 ring-[var(--portal-color-border)] hover:bg-[var(--portal-color-bg)] disabled:opacity-50'
              }`}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? t('copied') : t('copy')}
            </button>
          </div>
          <div className="flex-1 p-4 bg-[var(--portal-color-bg)] rounded-b-2xl">
            <textarea
              readOnly
              value={output}
              placeholder={t('outputEmpty')}
              className="h-full w-full resize-none bg-transparent text-sm font-mono text-[var(--portal-color-text)] outline-none placeholder:text-[var(--portal-color-text-tertiary)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
