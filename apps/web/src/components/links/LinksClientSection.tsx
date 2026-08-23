'use client';

import { Check, Copy, Mail, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { ApplyLinkModal } from './ApplyLinkModal';

interface LinksClientSectionProps {
  targetEmail: string;
}

export function LinksApplyActions({ targetEmail }: LinksClientSectionProps) {
  const t = useTranslations('Links');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => setIsApplyModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--portal-color-primary)] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition-opacity hover:opacity-90 shadow-sm cursor-pointer"
        >
          <Sparkles className="h-4 w-4" />
          <span>{t('onlineApplyBtn')}</span>
        </button>

        <a
          href={`mailto:${targetEmail}?subject=${encodeURIComponent('友情链接申请')}&body=${encodeURIComponent(`站点名称：\n站点链接：\n站点描述：\n头像链接：\nRSS订阅：\n网页截图：`)}`}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--portal-color-surface-alt)] hover:bg-[var(--portal-color-border-soft)] px-5 py-2.5 text-xs sm:text-sm font-semibold text-[var(--portal-color-text)] border border-compat transition-all cursor-pointer no-underline"
        >
          <Mail className="h-4 w-4" />
          <span>{t('sendEmailBtn')}</span>
        </a>

        <button
          type="button"
          onClick={() =>
            handleCopy(
              `站点名称：\n站点链接：\n站点描述：\n头像链接：\nRSS订阅：\n网页截图：`,
              'template',
            )
          }
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--portal-color-surface-alt)] hover:bg-[var(--portal-color-border-soft)] px-5 py-2.5 text-xs sm:text-sm font-semibold text-[var(--portal-color-text)] border border-compat transition-all cursor-pointer"
        >
          {copiedType === 'template' ? (
            <>
              <Check className="h-4 w-4 text-emerald-500" />
              <span>{t('templateCopied')}</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>{t('copyTemplateBtn')}</span>
            </>
          )}
        </button>
      </div>

      <ApplyLinkModal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} />
    </>
  );
}

export function LinksCopyableFields({
  fields,
  yamlSnippet,
  jsonSnippet,
}: {
  fields: Array<{ label: string; value: string; key: string }>;
  yamlSnippet?: string;
  jsonSnippet?: string;
}) {
  const t = useTranslations('Links');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {fields.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between gap-4 rounded-2xl bg-[var(--portal-color-surface)] px-4 py-3 sm:px-5 sm:py-3.5 transition-colors border border-[var(--portal-color-border)]/30 hover:border-[var(--portal-color-border)]/70"
          >
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <span className="text-xs sm:text-sm font-medium text-[var(--portal-color-text-tertiary)] shrink-0 w-16 sm:w-20">
                {item.label}
              </span>
              <div className="text-sm font-medium text-[var(--portal-color-text)] truncate font-sans min-w-0 flex-1">
                {item.value}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(item.value, item.key)}
              className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg hover:bg-[var(--portal-color-bg)] text-[var(--portal-color-text-tertiary)] hover:text-[var(--portal-color-primary)] transition-colors cursor-pointer"
              title={`Copy ${item.label}`}
            >
              {copiedType === item.key ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        ))}
      </div>

      {(yamlSnippet || jsonSnippet) && (
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {yamlSnippet && (
            <button
              type="button"
              onClick={() => handleCopy(yamlSnippet, 'yaml')}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--portal-color-primary)] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition-opacity hover:opacity-90 shadow-sm cursor-pointer border border-transparent"
            >
              {copiedType === 'yaml' ? (
                <>
                  <Check className="h-4 w-4 text-emerald-300" />
                  <span>{t('copied')}</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>{t('copyYaml')}</span>
                </>
              )}
            </button>
          )}

          {jsonSnippet && (
            <button
              type="button"
              onClick={() => handleCopy(jsonSnippet, 'json')}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--portal-color-surface-alt)] hover:bg-[var(--portal-color-border-soft)] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[var(--portal-color-text)] border border-compat transition-all cursor-pointer"
            >
              {copiedType === 'json' ? (
                <>
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>{t('copied')}</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>{t('copyJson')}</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
