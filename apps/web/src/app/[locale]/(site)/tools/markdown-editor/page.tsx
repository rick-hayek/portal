'use client';

import {
  Check,
  Code2,
  Copy,
  Eye,
  FileText,
  FolderOpen,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { marked } from 'marked';
import { useTranslations } from 'next-intl';
import type React from 'react';
import { useMemo, useRef, useState } from 'react';
import { MermaidRenderer } from '@/components/blog/MermaidRenderer';
import { ToolDropdown, ToolHeader } from '@/components/tools/ToolHeader';
import { highlightCode } from '@/lib/highlight';
import { sanitizeMdxContent } from '@/lib/mdx-sanitizer';

const SAMPLE_MARKDOWN = `# 🚀 Welcome to Markdown Editor

This is a real-time **Markdown Editor & Previewer** built with Next.js and Tailwind CSS.

## 🌟 Key Features
- **Split-screen live preview** for instant feedback.
- Full support for **GitHub Flavored Markdown (GFM)**.
- Support for **Mermaid Diagrams** rendering.
- Interactive GFM Callouts / Alerts support.
- **Import local files** (.md, .markdown, .txt) with drag & drop support.

> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more efficiently.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

### 📐 Mermaid Diagram Example
\`\`\`mermaid
sequenceDiagram
    participant U as User Browser
    participant SP as Service Provider
    participant IdP as Identity Provider

    U->>SP: 1. Access System
    SP-->>U: 2. Redirect to IdP
    U->>IdP: 3. Open Login Page
    IdP-->>U: 4. Display Form
    U->>IdP: 5. Submit Credentials
    IdP->>IdP: 6. Verify Credentials & Session
    IdP-->>U: 7. Redirect back with Token
    U->>SP: 8. Access with Token
    SP->>IdP: 9. Validate Token
    IdP-->>SP: 10. User Information
    SP-->>U: 11. Login Success
\`\`\`

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
| Mermaid Diagrams | ✅ Active | Fast |
| GFM Callouts | ✅ Active | Fast |

### 📝 Task List
- [x] Create Markdown Editor UI
- [x] Add side-by-side live preview
- [x] Support Mermaid diagrams
- [x] Support GFM callout alerts
- [x] Support local file import & drag-and-drop
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
          classes:
            'border-blue-500 bg-blue-50/50 text-blue-900 dark:bg-blue-950/20 dark:text-blue-200',
        },
        TIP: {
          label: 'Tip',
          icon: '💡',
          classes:
            'border-green-500 bg-green-50/50 text-green-900 dark:bg-green-950/20 dark:text-green-200',
        },
        IMPORTANT: {
          label: 'Important',
          icon: '📢',
          classes:
            'border-purple-500 bg-purple-50/50 text-purple-900 dark:bg-purple-950/20 dark:text-purple-200',
        },
        WARNING: {
          label: 'Warning',
          icon: '⚠️',
          classes:
            'border-yellow-500 bg-yellow-50/50 text-yellow-900 dark:bg-yellow-950/20 dark:text-yellow-200',
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

marked.use({
  renderer: {
    code(token: any) {
      const text = typeof token === 'object' && token !== null ? (token.text ?? '') : String(token || '');
      const lang = typeof token === 'object' && token !== null ? (token.lang ?? '') : '';
      const language = (lang || '').trim().split(/\s+/)[0].toLowerCase();

      if (language === 'mermaid') {
        return `<pre class="language-mermaid"><code class="language-mermaid">${text}</code></pre>\n`;
      }

      const highlighted = highlightCode(text, language);
      return `<pre class="hljs"><code class="hljs language-${language}">${highlighted}</code></pre>\n`;
    },
  },
});

export default function MarkdownEditorPage() {
  const t = useTranslations('ToolsMarkdown');
  const [input, setInput] = useState(SAMPLE_MARKDOWN);
  const [activeTab, setActiveTab] = useState<'split' | 'edit' | 'preview'>('split');

  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSanitizeMdx = () => {
    if (!input) return;
    const sanitized = sanitizeMdxContent(input);
    setInput(sanitized);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setInput(text);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setInput(text);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 pb-12">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".md,.markdown,.mdown,.mkd,.txt"
        className="hidden"
      />

      {/* Reusable Tool Header with Top-Right Dropdown Switcher */}
      <ToolHeader
        title={t('title')}
        description={t('description')}
        icon={<FileText className="h-6 w-6" />}
        iconBgColor="bg-[rgba(16,185,129,0.1)] text-emerald-500"
        actions={
          <ToolDropdown
            value={activeTab}
            onChange={setActiveTab}
            headerTitle="View Mode"
            options={[
              { id: 'split', label: 'Split View', icon: <FileText className="h-3.5 w-3.5" /> },
              { id: 'edit', label: 'Editor Only', icon: <Code2 className="h-3.5 w-3.5" /> },
              { id: 'preview', label: 'Preview Only', icon: <Eye className="h-3.5 w-3.5" /> },
            ]}
          />
        }
      />

      {/* Main Container */}
      <div
        className={`grid gap-6 ${
          activeTab === 'split'
            ? 'grid-cols-1 lg:grid-cols-2 min-h-[600px] sm:min-h-[700px]'
            : 'grid-cols-1 min-h-[calc(100vh-280px)]'
        }`}
      >
        {/* Left: Editor Panel */}
        {(activeTab === 'split' || activeTab === 'edit') && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex flex-col rounded-2xl border transition-colors shadow-xs overflow-hidden ${
              isDragging
                ? 'border-[var(--portal-color-primary)] bg-[var(--portal-color-primary-soft,#f0f9ff)]'
                : 'border-[var(--portal-color-border)] bg-[var(--portal-color-surface)]'
            }`}
          >
            {/* Editor Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--portal-color-border)] bg-[var(--portal-color-surface-alt)] px-3 sm:px-4 py-2 sm:py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--portal-color-text)] flex items-center gap-1.5">
                  <Code2 className="h-4 w-4 text-[var(--portal-color-primary)]" />
                  {t('editor')}
                </span>
                <span className="text-[11px] font-mono text-[var(--portal-color-text-tertiary)] bg-[var(--portal-color-bg)] px-2 py-0.5 rounded-full border border-[var(--portal-color-border-soft)]">
                  {wordCount}w · {charCount}c
                </span>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={handleImportClick}
                  className="flex items-center gap-1 text-xs font-medium text-[var(--portal-color-primary)] hover:opacity-80 transition-opacity cursor-pointer px-2 sm:px-2.5 py-1 rounded-md bg-[var(--portal-color-primary-soft,#f0f9ff)] hover:bg-[var(--portal-color-bg)] border border-[var(--portal-color-primary)]/20"
                  title="Import local .md or .txt file"
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  <span>{t('importFile')}</span>
                </button>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="flex items-center gap-1 text-xs font-medium text-[var(--portal-color-text-secondary)] hover:text-[var(--portal-color-text)] transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-[var(--portal-color-bg)]"
                  title="Load sample Markdown text"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t('loadSample')}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSanitizeMdx}
                  disabled={!input.trim()}
                  className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 disabled:opacity-40 transition-colors cursor-pointer px-2 py-1 rounded-md border border-amber-200 dark:border-amber-900/50"
                  title="Auto-escape unclosed angle brackets (e.g. <RP Name>) for MDX"
                >
                  <Code2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Fix MDX Tags</span>
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
                      <span className="hidden sm:inline">{t('copyMd')}</span>
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
                  <span className="hidden sm:inline">{t('clear')}</span>
                </button>
              </div>
            </div>

            {/* Drag & Drop Visual Overlay */}
            {isDragging && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[var(--portal-color-surface)]/90 backdrop-blur-xs text-[var(--portal-color-primary)]">
                <Upload className="h-10 w-10 animate-bounce mb-2" />
                <p className="text-sm font-semibold">Drop .md or .txt file here to import</p>
              </div>
            )}

            {/* Input Textarea */}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('placeholder')}
              className={`w-full flex-1 resize-y bg-transparent p-4 sm:p-5 text-sm font-mono text-[var(--portal-color-text)] outline-none placeholder:text-[var(--portal-color-text-tertiary)] leading-relaxed ${
                activeTab === 'edit'
                  ? 'min-h-[calc(100vh-340px)]'
                  : 'min-h-[480px] sm:min-h-[600px]'
              }`}
              spellCheck={false}
            />
          </div>
        )}

        {/* Right: Live Preview Panel */}
        {(activeTab === 'split' || activeTab === 'preview') && (
          <div className="flex flex-col rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] shadow-xs overflow-hidden">
            {/* Preview Toolbar */}
            <div className="flex items-center justify-between border-b border-[var(--portal-color-border)] bg-[var(--portal-color-surface-alt)] px-3 sm:px-4 py-2 sm:py-2.5">
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
            <div
              className={`flex-1 overflow-y-auto p-4 sm:p-6 ${
                activeTab === 'preview'
                  ? 'min-h-[calc(100vh-340px)]'
                  : 'min-h-[480px] sm:min-h-[600px]'
              }`}
            >
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
      <MermaidRenderer content={input} />
    </div>
  );
}
