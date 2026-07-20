'use client';

import { marked } from 'marked';
import {
  ArrowLeft,
  Check,
  Code2,
  Copy,
  Eye,
  FileText,
  RotateCcw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useMemo, useState } from 'react';
import { Link } from '@/i18n/routing';

const SAMPLE_MARKDOWN = `# 🚀 Welcome to Markdown Editor

This is a real-time **Markdown Editor & Previewer** built with Next.js and Tailwind CSS.

## 🌟 Key Features
- **Split-screen live preview** for instant feedback.
- Full support for **GitHub Flavored Markdown (GFM)**.
- Interactive GFM Callouts / Alerts support.

> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more efficiently.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

### 💻 Code Block Example
\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}! Welcome to Portal.\`;
}

console.log(greet("Developer"));
\`\`\`

### 📊 Table Example
| Feature | Status | Performance |
| :--- | :---: | ---: |
| Markdown Parser | ✅ Active | Instant |
| Live Preview | ✅ Active | 0ms |
| GFM Callouts | ✅ Active | Fast |

### 📝 Task List
- [x] Create Markdown Editor UI
- [x] Add side-by-side live preview
- [x] Support GFM callout alerts
`;

const parseGfmAlertsInHtml = (html: string) => {
  const blockquoteRegex = /<blockquote>([\s\S]*?)<\/blockquote>/gi;
  const alertRegex = /^\s*<p>\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(?:\r?\n|<br\s*\/?>)?/i;

  return html.replace(blockquoteRegex, (match, content) => {
    const alertMatch = content.match(alertRegex);
    if (alertMatch) {
      const type = alertMatch[1].toUpperCase();
      const configs: Record<string, { label: string; icon: string; classes: string }> = {
        NOTE: {
          label: 'Note',
          icon: 'ℹ️',
          classes: 'border-blue-500 bg-blue-50/50 text-blue-900 dark:bg-blue-950/20 dark:text-blue-200',
        },
        TIP: {
          label: 'Tip',
          icon: '💡',
          classes: 'border-green-500 bg-green-50/50 text-green-900 dark:bg-green-950/20 dark:text-green-200',
        },
        IMPORTANT: {
          label: 'Important',
          icon: '📢',
          classes: 'border-purple-500 bg-purple-50/50 text-purple-900 dark:bg-purple-950/20 dark:text-purple-200',
        },
        WARNING: {
          label: 'Warning',
          icon: '⚠️',
          classes: 'border-yellow-500 bg-yellow-50/50 text-yellow-900 dark:bg-yellow-950/20 dark:text-yellow-200',
        },
        CAUTION: {
          label: 'Caution',
          icon: '🚫',
          classes: 'border-red-500 bg-red-50/50 text-red-900 dark:bg-red-950/20 dark:text-red-200',
        },
      };

      const config = configs[type] || configs.NOTE;
      const cleanContent = content.replace(alertRegex, '<p>');

      return `
        <div className="my-4 border-l-4 p-4 rounded-r-lg ${config.classes}">
          <div className="flex items-center gap-2 font-bold mb-1">
            <span>${config.icon}</span>
            <span>${config.label}</span>
          </div>
          <div>${cleanContent}</div>
        </div>
      `;
    }
    return match;
  });
};

export default function MarkdownEditorPage() {
  const t = useTranslations('ToolsMarkdown');
  const [input, setInput] = useState(SAMPLE_MARKDOWN);
  const [activeTab, setActiveTab] = useState<'split' | 'edit' | 'preview'>('split');

  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  // Parse HTML live
  const parsedHtml = useMemo(() => {
    if (!input.trim()) return '';
    try {
      const rawHtml = marked.parse(input) as string;
      return parseGfmAlertsInHtml(rawHtml);
    } catch (err) {
      console.error('Markdown parse error:', err);
      return `<p className="text-red-500">Failed to render Markdown preview.</p>`;
    }
  }, [input]);

  // Statistics
  const wordCount = useMemo(() => {
    const trimmed = input.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [input]);

  const charCount = input.length;

  const handleCopyMd = async () => {
    if (!input) return;
    try {
      await navigator.clipboard.writeText(input);
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 2000);
    } catch (err) {
      console.error('Failed to copy MD', err);
    }
  };

  const handleCopyHtml = async () => {
    if (!parsedHtml) return;
    try {
      await navigator.clipboard.writeText(parsedHtml);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    } catch (err) {
      console.error('Failed to copy HTML', err);
    }
  };

  const handleClear = () => {
    setInput('');
  };

  const handleLoadSample = () => {
    setInput(SAMPLE_MARKDOWN);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/tools"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] text-[var(--portal-color-text-secondary)] transition-colors hover:bg-[var(--portal-color-bg)] hover:text-[var(--portal-color-text)]"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(16,185,129,0.1)] text-emerald-500">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--portal-color-text)]">
                {t('title')}
              </h1>
              <p className="text-xs sm:text-sm text-[var(--portal-color-text-secondary)]">
                {t('description')}
              </p>
            </div>
          </div>

          {/* View Mode Toggle for small screens */}
          <div className="hidden md:flex items-center gap-1 rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-1 text-xs font-medium text-[var(--portal-color-text-secondary)]">
            <button
              onClick={() => setActiveTab('split')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition-colors cursor-pointer ${
                activeTab === 'split'
                  ? 'bg-[var(--portal-color-primary)] text-white'
                  : 'hover:bg-[var(--portal-color-bg)] text-[var(--portal-color-text-secondary)]'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              Split View
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition-colors cursor-pointer ${
                activeTab === 'edit'
                  ? 'bg-[var(--portal-color-primary)] text-white'
                  : 'hover:bg-[var(--portal-color-bg)] text-[var(--portal-color-text-secondary)]'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              Editor Only
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition-colors cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-[var(--portal-color-primary)] text-white'
                  : 'hover:bg-[var(--portal-color-bg)] text-[var(--portal-color-text-secondary)]'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              Preview Only
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div
        className={`grid gap-6 ${
          activeTab === 'split'
            ? 'grid-cols-1 lg:grid-cols-2'
            : activeTab === 'edit'
            ? 'grid-cols-1'
            : 'grid-cols-1'
        } min-h-[650px]`}
      >
        {/* Left: Editor Panel */}
        {(activeTab === 'split' || activeTab === 'edit') && (
          <div className="flex flex-col rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] shadow-xs overflow-hidden">
            {/* Editor Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--portal-color-border)] bg-[var(--portal-color-surface-alt)] px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--portal-color-text)] flex items-center gap-1.5">
                  <Code2 className="h-4 w-4 text-[var(--portal-color-primary)]" />
                  {t('editor')}
                </span>
                <span className="text-[11px] font-mono text-[var(--portal-color-text-tertiary)] bg-[var(--portal-color-bg)] px-2 py-0.5 rounded-full border border-[var(--portal-color-border-soft)]">
                  {wordCount} {t('words')} · {charCount} {t('chars')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="flex items-center gap-1 text-xs font-medium text-[var(--portal-color-primary)] hover:opacity-80 transition-opacity cursor-pointer px-2 py-1 rounded-md hover:bg-[var(--portal-color-bg)]"
                  title="Load sample Markdown text"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {t('loadSample')}
                </button>
                <button
                  type="button"
                  onClick={handleCopyMd}
                  disabled={!input.trim()}
                  className="flex items-center gap-1 text-xs font-medium text-[var(--portal-color-text-secondary)] hover:text-[var(--portal-color-text)] disabled:opacity-40 transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-[var(--portal-color-bg)]"
                  title="Copy Markdown code"
                >
                  {copiedMd ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-emerald-500 font-semibold">{t('copied')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      {t('copyMd')}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={!input}
                  className="flex items-center gap-1 text-xs font-medium text-[var(--portal-color-text-tertiary)] hover:text-rose-500 disabled:opacity-40 transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-[var(--portal-color-bg)]"
                  title="Clear input"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t('clear')}
                </button>
              </div>
            </div>

            {/* Input Textarea */}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('placeholder')}
              className="w-full flex-1 resize-none bg-transparent p-5 text-sm font-mono text-[var(--portal-color-text)] outline-none placeholder:text-[var(--portal-color-text-tertiary)] leading-relaxed"
              spellCheck={false}
            />
          </div>
        )}

        {/* Right: Live Preview Panel */}
        {(activeTab === 'split' || activeTab === 'preview') && (
          <div className="flex flex-col rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] shadow-xs overflow-hidden">
            {/* Preview Toolbar */}
            <div className="flex items-center justify-between border-b border-[var(--portal-color-border)] bg-[var(--portal-color-surface-alt)] px-4 py-2.5">
              <span className="text-xs font-bold text-[var(--portal-color-text)] flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-emerald-500" />
                {t('preview')}
              </span>

              <button
                type="button"
                onClick={handleCopyHtml}
                disabled={!parsedHtml}
                className="flex items-center gap-1 text-xs font-medium text-[var(--portal-color-text-secondary)] hover:text-[var(--portal-color-text)] disabled:opacity-40 transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-[var(--portal-color-bg)]"
                title="Copy rendered HTML code"
              >
                {copiedHtml ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-semibold">{t('copied')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    {t('copyHtml')}
                  </>
                )}
              </button>
            </div>

            {/* Preview Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {parsedHtml ? (
                <div
                  className="prose prose-portal max-w-none text-[var(--portal-color-text)]"
                  dangerouslySetInnerHTML={{ __html: parsedHtml }}
                />
              ) : (
                <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center text-xs text-[var(--portal-color-text-tertiary)] italic">
                  Nothing to preview yet. Start typing on the left editor!
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
