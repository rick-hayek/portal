import { FileJson, FileText, Hash, Settings2, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';
import { Link } from '@/i18n/routing';

export default function ToolsPage() {
  const t = useTranslations('Tools');

  const tools = [
    {
      id: 'markdown-editor',
      name: t('markdownEditor.name'),
      description: t('markdownEditor.desc'),
      icon: <FileText className="h-6 w-6" />,
      href: '/tools/markdown-editor',
      color: 'text-emerald-500',
      bg: 'bg-[rgba(16,185,129,0.1)]',
    },
    {
      id: 'json-formatter',
      name: t('jsonFormatter.name'),
      description: t('jsonFormatter.desc'),
      icon: <FileJson className="h-6 w-6" />,
      href: '/tools/json-formatter',
      color: 'text-blue-500',
      bg: 'bg-[rgba(59,130,246,0.1)]',
    },
    {
      id: 'base64',
      name: t('base64.name'),
      description: t('base64.desc'),
      icon: <Hash className="h-6 w-6" />,
      href: '/tools/base64',
      color: 'text-purple-500',
      bg: 'bg-[rgba(168,85,247,0.1)]',
    },
    {
      id: 'jwt-decoder',
      name: t('jwt.name'),
      description: t('jwt.desc'),
      icon: <Shield className="h-6 w-6" />,
      href: '/tools/jwt-decoder',
      color: 'text-orange-500',
      bg: 'bg-[rgba(249,115,22,0.1)]',
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-16">
      <header className="space-y-4 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(107,142,201,0.1)] text-[var(--portal-color-primary)]">
          <Settings2 className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-[var(--portal-color-text)] md:text-5xl">
          {t('title')}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-[var(--portal-color-text-secondary)]">
          {t('description')}
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={tool.href}
            className="group relative flex flex-col gap-4 rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-6 transition-all hover:-translate-y-1 hover:border-[var(--portal-color-primary)] hover:shadow-lg hover:shadow-[0_8px_30px_rgba(107,142,201,0.05)]"
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tool.bg} ${tool.color} transition-transform group-hover:scale-110`}
            >
              {tool.icon}
            </div>
            <div className="space-y-1.5 mt-2">
              <h3 className="text-lg font-semibold leading-none tracking-tight text-[var(--portal-color-text)]">
                {tool.name}
              </h3>
              <p className="line-clamp-2 text-sm text-[var(--portal-color-text-secondary)]">
                {tool.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
