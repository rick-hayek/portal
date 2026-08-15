'use client';

import { AlertCircle, ArrowUpRight, Check, RotateCw, Rss, Send, Sparkles, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { trpc } from '@/lib/api/client';

interface ApplyLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApplyLinkModal({ isOpen, onClose }: ApplyLinkModalProps) {
  const t = useTranslations('Links');
  const [mounted, setMounted] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [avatar, setAvatar] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('friend');
  const [rss, setRss] = useState('');
  const [screenshot, setScreenshot] = useState('');
  const [email, setEmail] = useState('');

  // Math Captcha state
  const [captcha, setCaptcha] = useState<{ a: number; b: number }>({ a: 3, b: 4 });
  const [captchaInput, setCaptchaInput] = useState('');

  const refreshCaptcha = useCallback(() => {
    setCaptcha({
      a: Math.floor(Math.random() * 9) + 1,
      b: Math.floor(Math.random() * 9) + 1,
    });
    setCaptchaInput('');
  }, []);

  // Honeypot for bots (must stay empty)
  const [honeypot, setHoneypot] = useState('');
  const timingTokenRef = useRef<number>(0);

  // Status & Feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ action: string } | null>(null);

  const applyMutation = trpc.link.applyLink.useMutation();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      timingTokenRef.current = Date.now();
      setErrorMessage(null);
      setSuccessInfo(null);
      refreshCaptcha();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, refreshCaptcha]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic client validation
    if (!name.trim()) {
      setErrorMessage(t('modal.errors.nameRequired'));
      return;
    }
    if (!url.trim()) {
      setErrorMessage(t('modal.errors.urlRequired'));
      return;
    }
    if (!/^https?:\/\//i.test(url.trim())) {
      setErrorMessage(t('modal.errors.invalidUrl'));
      return;
    }
    if (!description.trim()) {
      setErrorMessage(t('modal.errors.descRequired'));
      return;
    }

    // Math captcha check
    const answer = Number.parseInt(captchaInput.trim(), 10);
    const expected = captcha.a + captcha.b;
    if (Number.isNaN(answer) || answer !== expected) {
      setErrorMessage(t('modal.errors.invalidCaptcha'));
      refreshCaptcha();
      return;
    }

    try {
      const res = await applyMutation.mutateAsync({
        name: name.trim(),
        url: url.trim(),
        avatar: avatar.trim() || undefined,
        description: description.trim(),
        category,
        rss: rss.trim() || undefined,
        screenshot: screenshot.trim() || undefined,
        email: email.trim() || undefined,
        captchaAnswer: answer,
        captchaExpected: expected,
        honeypot,
        timingToken: timingTokenRef.current,
      });

      if (!res.success) {
        if (res.error === 'INVALID_CAPTCHA') {
          setErrorMessage(t('modal.errors.invalidCaptcha'));
          refreshCaptcha();
        } else if (res.error === 'BOT_DETECTED') {
          setErrorMessage(t('modal.errors.botDetected'));
        } else if (res.error === 'SUBMISSION_TOO_FAST') {
          setErrorMessage(t('modal.errors.submissionTooFast'));
        } else if (res.error === 'RATE_LIMIT_EXCEEDED') {
          setErrorMessage(t('modal.errors.rateLimitExceeded'));
        } else {
          setErrorMessage(t('modal.errors.default'));
        }
        return;
      }

      setSuccessInfo({ action: res.action });
    } catch {
      setErrorMessage(t('modal.errors.default'));
    }
  };

  const handleReset = () => {
    setName('');
    setUrl('');
    setAvatar('');
    setDescription('');
    setCategory('friend');
    setRss('');
    setScreenshot('');
    setEmail('');
    setHoneypot('');
    setErrorMessage(null);
    setSuccessInfo(null);
    onClose();
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl rounded-3xl border border-compat bg-[var(--portal-color-surface)] shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-compat p-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(107,142,201,0.1)] text-[var(--portal-color-primary)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--portal-color-text)]">
                {t('modal.title')}
              </h2>
              <p className="text-xs text-[var(--portal-color-text-secondary)]">
                {t('modal.subtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-[var(--portal-color-text-tertiary)] hover:bg-[var(--portal-color-bg)] hover:text-[var(--portal-color-text)] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success View */}
        {successInfo ? (
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <Check className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[var(--portal-color-text)]">
                {t('modal.successTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--portal-color-text-secondary)] max-w-md mx-auto leading-relaxed">
                {successInfo.action === 'updated'
                  ? t('modal.updateSuccessDesc')
                  : t('modal.successDesc')}
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center rounded-xl bg-[var(--portal-color-primary)] text-white px-6 py-2.5 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              >
                {t('modal.close')}
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form
            onSubmit={handleSubmit}
            className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto"
          >
            {/* Error banner */}
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="flex-1 leading-snug">{errorMessage}</span>
              </div>
            )}

            {/* Honeypot hidden input for anti-bot trap */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website_url_hp">Leave this empty</label>
              <input
                id="website_url_hp"
                type="text"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Site Name (Required) */}
              <label className="block space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="block text-xs font-semibold text-[var(--portal-color-text)]">
                    {t('modal.name')} <span className="text-red-500">*</span>
                  </span>
                  <span className="text-[10px] text-[var(--portal-color-text-tertiary)] font-mono">
                    {name.length}/50
                  </span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('modal.namePlaceholder')}
                  className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3.5 py-2 text-xs text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)] transition-all"
                />
              </label>

              {/* Site URL (Required) */}
              <label className="block space-y-1.5">
                <span className="block text-xs font-semibold text-[var(--portal-color-text)]">
                  {t('modal.url')} <span className="text-red-500">*</span>
                </span>
                <input
                  type="url"
                  required
                  maxLength={255}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={t('modal.urlPlaceholder')}
                  className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3.5 py-2 text-xs font-mono text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)] transition-all"
                />
              </label>
            </div>

            {/* Description (Required) - Placed above Logo/Avatar */}
            <label className="block space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="block text-xs font-semibold text-[var(--portal-color-text)]">
                  {t('modal.desc')} <span className="text-red-500">*</span>
                </span>
                <span className="text-[10px] text-[var(--portal-color-text-tertiary)] font-mono">
                  {description.length}/200
                </span>
              </div>
              <textarea
                rows={2}
                required
                maxLength={200}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('modal.descPlaceholder')}
                className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] p-3 text-xs text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)] transition-all resize-none"
              />
            </label>

            {/* Avatar URL & Screenshot URL (2 columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Avatar URL (Optional) */}
              <label className="block space-y-1.5">
                <span className="block text-xs font-semibold text-[var(--portal-color-text)]">
                  {t('modal.avatar')}
                </span>
                <input
                  type="url"
                  maxLength={255}
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://yourdomain.com/avatar.png"
                  className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3.5 py-2 text-xs font-mono text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)] transition-all"
                />
              </label>

              {/* Screenshot URL (Optional) */}
              <label className="block space-y-1.5">
                <span className="block text-xs font-semibold text-[var(--portal-color-text)]">
                  {t('modal.screenshot')}
                </span>
                <input
                  type="url"
                  maxLength={255}
                  value={screenshot}
                  onChange={(e) => setScreenshot(e.target.value)}
                  placeholder="https://yourdomain.com/screenshot.png"
                  className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3.5 py-2 text-xs font-mono text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)] transition-all"
                />
              </label>
            </div>

            {/* RSS & Email (2 columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* RSS Feed URL */}
              <label className="block space-y-1.5">
                <span className="block text-xs font-semibold text-[var(--portal-color-text)]">
                  {t('modal.rss')}
                </span>
                <input
                  type="url"
                  maxLength={255}
                  value={rss}
                  onChange={(e) => setRss(e.target.value)}
                  placeholder="https://yourdomain.com/feed.xml"
                  className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3.5 py-2 text-xs font-mono text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)] transition-all"
                />
              </label>

              {/* Submitter Email */}
              <label className="block space-y-1.5">
                <span className="block text-xs font-semibold text-[var(--portal-color-text)]">
                  {t('modal.email')}
                </span>
                <input
                  type="email"
                  maxLength={100}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3.5 py-2 text-xs text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)] transition-all"
                />
              </label>
            </div>

            {/* Live Preview & Math Captcha Section (Shown only after user starts typing) */}
            {(name.trim() || description.trim() || url.trim()) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {/* Left: Live Preview Card */}
                <div className="space-y-1.5">
                  <span className="block text-[11px] font-semibold text-[var(--portal-color-text-tertiary)] uppercase tracking-wider">
                    实时展示预览
                  </span>
                  <div className="flex items-center gap-3.5 rounded-2xl border border-compat bg-[var(--portal-color-bg)] p-3.5 shadow-2xs h-[72px]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--portal-color-primary-soft)] border border-compat text-[var(--portal-color-primary)] font-bold text-xs">
                      {avatar.trim() ? (
                        <img
                          src={avatar.trim()}
                          alt={name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>{name ? name.slice(0, 2).toUpperCase() : '?'}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-semibold text-xs sm:text-sm text-[var(--portal-color-text)] truncate">
                          {name || '站点名称'}
                        </h4>
                        {rss.trim() ? (
                          <div
                            title={`RSS: ${rss.trim()}`}
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-500"
                          >
                            <Rss className="h-3 w-3" />
                          </div>
                        ) : (
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--portal-color-surface)] text-[var(--portal-color-text-tertiary)]">
                            <ArrowUpRight className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--portal-color-text-secondary)] truncate mt-0.5">
                        {description || '站点一句话描述...'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Math Captcha Anti-bot Challenge */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="block text-[11px] font-semibold text-[var(--portal-color-text-tertiary)] uppercase tracking-wider">
                      {t('modal.captcha')} <span className="text-red-500">*</span>
                    </span>
                    <button
                      type="button"
                      onClick={refreshCaptcha}
                      className="inline-flex items-center gap-1 text-[10px] text-[var(--portal-color-text-tertiary)] hover:text-[var(--portal-color-primary)] transition-colors cursor-pointer"
                      title="刷新算术题"
                    >
                      <RotateCw className="h-2.5 w-2.5" />
                      <span>换一题</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-compat bg-[var(--portal-color-bg)] px-4 py-3.5 shadow-2xs h-[72px] focus-within:border-[var(--portal-color-primary)] transition-colors">
                    <span className="text-sm font-mono font-bold text-[var(--portal-color-primary)] select-none shrink-0 tracking-wider">
                      {captcha.a} + {captcha.b} =
                    </span>
                    <input
                      type="number"
                      required
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      placeholder={t('modal.captchaPlaceholder')}
                      className="w-full bg-transparent border-0 p-0 text-xs font-mono text-[var(--portal-color-text)] placeholder:text-[var(--portal-color-text-tertiary)] outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-compat">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-bg)] hover:text-[var(--portal-color-text)] transition-colors cursor-pointer"
              >
                {t('modal.cancel')}
              </button>
              <button
                type="submit"
                disabled={applyMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--portal-color-primary)] text-white px-5 py-2 text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
              >
                {applyMutation.isPending ? (
                  <span>{t('modal.submitting')}</span>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>{t('modal.submit')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
