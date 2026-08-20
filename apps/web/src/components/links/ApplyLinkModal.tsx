'use client';

import { AlertCircle, ArrowUpRight, Check, FileText, RotateCw, Rss, Send, Sparkles, X, Zap } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
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
  const locale = useLocale();
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

  // Raw paste mode state
  const [isRawMode, setIsRawMode] = useState(false);
  const [rawText, setRawText] = useState('');

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

  const parseRawLinkText = (text: string) => {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    let parsedName = '';
    let parsedUrl = '';
    let parsedDesc = '';
    let parsedAvatar = '';
    let parsedScreenshot = '';
    let parsedRss = '';

    for (const line of lines) {
      const match = line.match(
        /^(name|title|url|link|website|desc|description|bio|avatar|logo|icon|screenshot|screen|image|rss|feed)\s*[:：=]\s*(.+)$/i,
      );
      if (match) {
        const key = match[1].toLowerCase();
        const val = match[2].trim();
        if (['name', 'title'].includes(key)) parsedName = val;
        else if (['url', 'link', 'website'].includes(key)) parsedUrl = val;
        else if (['desc', 'description', 'bio'].includes(key)) parsedDesc = val;
        else if (['avatar', 'logo', 'icon'].includes(key)) parsedAvatar = val;
        else if (['screenshot', 'screen', 'image'].includes(key)) parsedScreenshot = val;
        else if (['rss', 'feed'].includes(key)) parsedRss = val;
      }
    }

    if (!parsedName || !parsedUrl) {
      const urlLines = lines.filter((l) => /^https?:\/\//i.test(l));
      const nonUrlLines = lines.filter((l) => !/^https?:\/\//i.test(l));

      if (!parsedName && nonUrlLines.length > 0) {
        parsedName = nonUrlLines[0];
      }
      if (!parsedUrl && urlLines.length > 0) {
        parsedUrl = urlLines[0];
      }
      if (!parsedDesc && nonUrlLines.length > 1) {
        parsedDesc = nonUrlLines.slice(1).join(' ');
      }
    }

    const isValidUrl = /^https?:\/\//i.test(parsedUrl);
    const isValidName = parsedName.trim().length > 0;
    const isValidDesc = parsedDesc.trim().length > 0;

    if (!isValidName || !isValidUrl || !isValidDesc) {
      return {
        name: isValidName ? parsedName.trim() : `申请站点-${Math.random().toString(36).slice(2, 7)}`,
        url: isValidUrl ? parsedUrl.trim() : 'https://pending-parse.local',
        description: text.trim(),
        avatar: parsedAvatar || undefined,
        screenshot: parsedScreenshot || undefined,
        rss: parsedRss || undefined,
      };
    }

    return {
      name: parsedName.trim(),
      url: parsedUrl.trim(),
      description: parsedDesc.trim(),
      avatar: parsedAvatar || undefined,
      screenshot: parsedScreenshot || undefined,
      rss: parsedRss || undefined,
    };
  };

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

    let submitName = name.trim();
    let submitUrl = url.trim();
    let submitDesc = description.trim();
    let submitAvatar = avatar.trim() || undefined;
    let submitScreenshot = screenshot.trim() || undefined;
    let submitRss = rss.trim() || undefined;

    if (isRawMode) {
      if (!rawText.trim()) {
        setErrorMessage(t('applyModal.errors.descRequired'));
        return;
      }
      const parsed = parseRawLinkText(rawText);
      submitName = parsed.name;
      submitUrl = parsed.url;
      submitDesc = parsed.description;
      submitAvatar = parsed.avatar;
      submitScreenshot = parsed.screenshot;
      submitRss = parsed.rss;
    } else {
      if (!submitName) {
        setErrorMessage(t('applyModal.errors.nameRequired'));
        return;
      }
      if (!submitUrl) {
        setErrorMessage(t('applyModal.errors.urlRequired'));
        return;
      }
      if (!/^https?:\/\//i.test(submitUrl)) {
        setErrorMessage(t('applyModal.errors.invalidUrl'));
        return;
      }
      if (!submitDesc) {
        setErrorMessage(t('applyModal.errors.descRequired'));
        return;
      }
    }

    // Math captcha check
    const answer = Number.parseInt(captchaInput.trim(), 10);
    const expected = captcha.a + captcha.b;
    if (Number.isNaN(answer) || answer !== expected) {
      setErrorMessage(t('applyModal.errors.invalidCaptcha'));
      refreshCaptcha();
      return;
    }

    try {
      const res = await applyMutation.mutateAsync({
        name: submitName,
        url: submitUrl,
        avatar: submitAvatar,
        description: submitDesc,
        category,
        rss: submitRss,
        screenshot: submitScreenshot,
        email: email.trim() || undefined,
        locale,
        captchaAnswer: answer,
        captchaExpected: expected,
        honeypot,
        timingToken: timingTokenRef.current,
      });

      if (!res.success) {
        if (res.error === 'INVALID_CAPTCHA') {
          setErrorMessage(t('applyModal.errors.invalidCaptcha'));
          refreshCaptcha();
        } else if (res.error === 'BOT_DETECTED') {
          setErrorMessage(t('applyModal.errors.botDetected'));
        } else if (res.error === 'SUBMISSION_TOO_FAST') {
          setErrorMessage(t('applyModal.errors.submissionTooFast'));
        } else if (res.error === 'RATE_LIMIT_EXCEEDED') {
          setErrorMessage(t('applyModal.errors.rateLimitExceeded'));
        } else {
          setErrorMessage(t('applyModal.errors.default'));
        }
        return;
      }

      setSuccessInfo({ action: res.action });
    } catch {
      setErrorMessage(t('applyModal.errors.default'));
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
    setRawText('');
    setIsRawMode(false);
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
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[var(--portal-color-text)]">
                  {t('applyModal.title')}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsRawMode(!isRawMode)}
                  className="inline-flex items-center gap-1 rounded-lg border border-[var(--portal-color-primary)]/30 bg-[var(--portal-color-primary-soft)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--portal-color-primary)] hover:bg-[var(--portal-color-primary)] hover:text-white transition-all cursor-pointer select-none"
                >
                  {isRawMode ? <FileText className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
                  <span>{isRawMode ? t('applyModal.standardFormMode') : t('applyModal.rawModeToggle')}</span>
                </button>
              </div>
              <p className="text-xs text-[var(--portal-color-text-secondary)]">
                {t('applyModal.subtitle')}
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
                {t('applyModal.successTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--portal-color-text-secondary)] max-w-md mx-auto leading-relaxed">
                {successInfo.action === 'updated'
                  ? t('applyModal.updateSuccessDesc')
                  : t('applyModal.successDesc')}
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center rounded-xl bg-[var(--portal-color-primary)] text-white px-6 py-2.5 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              >
                {t('applyModal.close')}
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

            {isRawMode ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <textarea
                    rows={8}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder={t('applyModal.rawPastePlaceholder')}
                    className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] p-3 text-xs font-mono text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)] transition-all resize-y leading-relaxed"
                  />
                </div>

                {/* Submitter Email & Math Captcha (2 columns on desktop) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Submitter Email */}
                  <label className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--portal-color-text)] shrink-0 whitespace-nowrap">
                      {t('applyModal.email')}
                    </span>
                    <input
                      type="email"
                      maxLength={100}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('applyModal.emailPlaceholder')}
                      className="flex-1 min-w-0 rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-2 text-xs text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)] transition-all"
                    />
                  </label>

                  {/* Math Captcha Anti-bot Challenge */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--portal-color-text)] shrink-0 whitespace-nowrap">
                      {t('applyModal.captcha')} <span className="text-red-500">*</span>
                    </span>
                    <div className="flex flex-1 items-center gap-2 rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-2 text-xs font-mono text-[var(--portal-color-text)] outline-none focus-within:border-[var(--portal-color-primary)] transition-all">
                      <span className="text-xs font-mono font-bold text-[var(--portal-color-primary)] select-none shrink-0 tracking-wider">
                        {captcha.a} + {captcha.b} =
                      </span>
                      <input
                        type="number"
                        required
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value)}
                        placeholder={t('applyModal.captchaPlaceholder')}
                        className="min-w-0 flex-1 bg-transparent border-0 p-0 text-xs font-mono text-[var(--portal-color-text)] placeholder:text-[var(--portal-color-text-tertiary)] outline-none"
                      />
                      <button
                        type="button"
                        onClick={refreshCaptcha}
                        className="inline-flex items-center gap-1 text-[10px] text-[var(--portal-color-text-tertiary)] hover:text-[var(--portal-color-primary)] transition-colors cursor-pointer shrink-0 ml-auto"
                        title={t('applyModal.refreshCaptchaTitle')}
                      >
                        <RotateCw className="h-3 w-3" />
                        <span>{t('applyModal.refreshCaptcha')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Site Name (Required) */}
                  <label className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--portal-color-text)] shrink-0 w-14 sm:w-16">
                      {t('selfFields.name')} <span className="text-red-500">*</span>
                    </span>
                    <div className="relative flex-1 min-w-0">
                      <input
                        type="text"
                        required
                        maxLength={50}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('applyModal.namePlaceholder')}
                        className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-2 pr-11 text-xs text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)] transition-all"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[var(--portal-color-text-tertiary)] font-mono pointer-events-none">
                        {name.length}/50
                      </span>
                    </div>
                  </label>

                  {/* Site URL (Required) */}
                  <label className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--portal-color-text)] shrink-0 w-14 sm:w-16">
                      {t('selfFields.url')} <span className="text-red-500">*</span>
                    </span>
                    <input
                      type="url"
                      required
                      maxLength={255}
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://yourdomain.com"
                      className="flex-1 min-w-0 rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-2 text-xs font-mono text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)] transition-all"
                    />
                  </label>
                </div>

                {/* Description (Required) - Placed above Logo/Avatar */}
                <label className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--portal-color-text)] shrink-0 w-14 sm:w-16">
                    {t('selfFields.desc')} <span className="text-red-500">*</span>
                  </span>
                  <div className="relative flex-1 min-w-0">
                    <input
                      type="text"
                      required
                      maxLength={200}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t('applyModal.descPlaceholder')}
                      className="w-full rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-2 pr-14 text-xs text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)] transition-all"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[var(--portal-color-text-tertiary)] font-mono pointer-events-none">
                      {description.length}/200
                    </span>
                  </div>
                </label>

                {/* Avatar URL & Screenshot URL (2 columns, inline label) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Avatar URL (Optional) */}
                  <label className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--portal-color-text)] shrink-0 w-14 sm:w-16">
                      {t('selfFields.avatar')}
                    </span>
                    <input
                      type="url"
                      maxLength={255}
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="https://yourdomain.com/avatar.png"
                      className="flex-1 min-w-0 rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-2 text-xs font-mono text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)] transition-all"
                    />
                  </label>

                  {/* Screenshot URL (Optional) */}
                  <label className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--portal-color-text)] shrink-0 w-14 sm:w-16">
                      {t('selfFields.screenshot')}
                    </span>
                    <input
                      type="url"
                      maxLength={255}
                      value={screenshot}
                      onChange={(e) => setScreenshot(e.target.value)}
                      placeholder="https://yourdomain.com/screenshot.png"
                      className="flex-1 min-w-0 rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-2 text-xs font-mono text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)] transition-all"
                    />
                  </label>
                </div>

                {/* RSS & Email (2 columns, inline label) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* RSS Feed URL */}
                  <label className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--portal-color-text)] shrink-0 w-14 sm:w-16">
                      {t('selfFields.rss')}
                    </span>
                    <input
                      type="url"
                      maxLength={255}
                      value={rss}
                      onChange={(e) => setRss(e.target.value)}
                      placeholder="https://yourdomain.com/feed.xml"
                      className="flex-1 min-w-0 rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-2 text-xs font-mono text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)] transition-all"
                    />
                  </label>

                  {/* Submitter Email */}
                  <label className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--portal-color-text)] shrink-0 w-14 sm:w-16">
                      {t('applyModal.email')}
                    </span>
                    <input
                      type="email"
                      maxLength={100}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your-email@example.com"
                      className="flex-1 min-w-0 rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] px-3 py-2 text-xs text-[var(--portal-color-text)] outline-none focus:border-[var(--portal-color-primary)] transition-all"
                    />
                  </label>
                </div>

                {/* Live Preview & Math Captcha Section */}
                {(name.trim() || description.trim() || url.trim()) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                    {/* Left: Live Preview Card */}
                    <div className="space-y-1.5">
                      <span className="block text-[11px] font-semibold text-[var(--portal-color-text-tertiary)] uppercase tracking-wider">
                        {t('applyModal.previewTitle')}
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
                              {name || t('applyModal.previewDefaultName')}
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
                            {description || t('applyModal.previewDefaultDesc')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right: Math Captcha Anti-bot Challenge */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="block text-[11px] font-semibold text-[var(--portal-color-text-tertiary)] uppercase tracking-wider">
                          {t('applyModal.captcha')} <span className="text-red-500">*</span>
                        </span>
                        <button
                          type="button"
                          onClick={refreshCaptcha}
                          className="inline-flex items-center gap-1 text-[10px] text-[var(--portal-color-text-tertiary)] hover:text-[var(--portal-color-primary)] transition-colors cursor-pointer"
                          title={t('applyModal.refreshCaptchaTitle')}
                        >
                          <RotateCw className="h-2.5 w-2.5" />
                          <span>{t('applyModal.refreshCaptcha')}</span>
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
                          placeholder={t('applyModal.captchaPlaceholder')}
                          className="w-full bg-transparent border-0 p-0 text-xs font-mono text-[var(--portal-color-text)] placeholder:text-[var(--portal-color-text-tertiary)] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-compat">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-bg)] hover:text-[var(--portal-color-text)] transition-colors cursor-pointer"
              >
                {t('applyModal.cancel')}
              </button>
              <button
                type="submit"
                disabled={
                  applyMutation.isPending ||
                  (isRawMode
                    ? !rawText.trim()
                    : !name.trim() || !url.trim() || !description.trim())
                }
                className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--portal-color-primary)] text-white px-5 py-2 text-xs font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
              >
                {applyMutation.isPending ? (
                  <span>{t('applyModal.submitting')}</span>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>{t('applyModal.submit')}</span>
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
