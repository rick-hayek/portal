'use client';

import {
  Check,
  ExternalLink,
  Globe,
  LogIn,
  Mail,
  MessageSquare,
  Send,
  User as UserIcon,
} from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { formatCommentDate, getCommentAnchor } from '@portal/shared';
import siteConfig from '@/site.config';

interface Comment {
  id: string;
  authorName: string;
  authorUrl?: string | null;
  avatar?: string | null;
  content: string;
  createdAt: Date | string;
  replies?: Comment[];
}

interface GuestInfo {
  authorName: string;
  authorEmail: string;
  authorUrl: string;
}

const STORAGE_KEY = 'portal_guest_commenter';

function CommentAvatar({
  authorName,
  avatar,
  authorUrl,
}: {
  authorName: string;
  avatar?: string | null;
  authorUrl?: string | null;
}) {
  const [imgError, setImgError] = useState(false);

  const avatarElement = (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-compat bg-[var(--portal-color-primary-soft)] text-xs font-bold text-[var(--portal-color-primary)] select-none">
      {avatar && !imgError ? (
        <img
          src={avatar}
          alt={authorName}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <span>{(authorName || '?').trim().slice(0, 1).toUpperCase()}</span>
      )}
    </div>
  );

  if (authorUrl) {
    return (
      <a
        href={authorUrl}
        target="_blank"
        rel="noopener noreferrer nofollow"
        title={authorUrl}
        className="shrink-0 transition-transform hover:scale-105 active:scale-95"
      >
        {avatarElement}
      </a>
    );
  }

  return avatarElement;
}

function CommentItem({
  comment,
  postId,
  session,
  locale,
  depth = 0,
  guestInfo,
  onGuestInfoChange,
}: {
  comment: Comment;
  postId: string;
  session: any;
  locale: string;
  depth?: number;
  guestInfo: GuestInfo;
  onGuestInfoChange: (info: GuestInfo) => void;
}) {
  const router = useRouter();
  const t = useTranslations('Comments');
  const requireModeration = siteConfig.comments?.requireModeration ?? true;
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyName, setReplyName] = useState(guestInfo.authorName);
  const [replyEmail, setReplyEmail] = useState(guestInfo.authorEmail);
  const [replyUrl, setReplyUrl] = useState(guestInfo.authorUrl);
  const [replyError, setReplyError] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replySubmitted, setReplySubmitted] = useState(false);
  const [replyHp, setReplyHp] = useState('');

  useEffect(() => {
    if (!session) {
      setReplyName(guestInfo.authorName);
      setReplyEmail(guestInfo.authorEmail);
      setReplyUrl(guestInfo.authorUrl);
    }
  }, [guestInfo, session]);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReplyError('');

    if (!replyContent.trim()) return;

    if (replyHp.trim().length > 0) {
      setReplySubmitted(true);
      setReplyContent('');
      setTimeout(() => {
        setShowReplyForm(false);
        setReplySubmitted(false);
      }, 2000);
      return;
    }

    let finalName = replyName.trim();
    let finalEmail = replyEmail.trim();
    let finalUrl = replyUrl.trim();

    if (session?.user) {
      finalName = session.user.name || session.user.email || 'Anonymous';
      finalEmail = session.user.email || '';
    } else {
      if (!finalName) {
        setReplyError(t('nameRequired'));
        return;
      }
      if (!finalEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(finalEmail)) {
        setReplyError(t('emailRequired'));
        return;
      }
      if (finalUrl && !/^https:\/\//i.test(finalUrl)) {
        setReplyError(t('urlHttpsRequired'));
        return;
      }
      onGuestInfoChange({ authorName: finalName, authorEmail: finalEmail, authorUrl: finalUrl });
    }

    setReplySubmitting(true);
    try {
      const res = await fetch('/api/trpc/comment.create?batch=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          '0': {
            json: {
              postId,
              content: replyContent.trim(),
              parentId: comment.id,
              authorName: finalName || undefined,
              authorEmail: finalEmail || undefined,
              authorUrl: finalUrl || undefined,
              locale,
              website_hp: replyHp || undefined,
            },
          },
        }),
      });

      const data = await res.json();
      if (data[0]?.result?.data?.json || res.ok) {
        setReplySubmitted(true);
        setReplyContent('');
        if (session || !requireModeration) {
          router.refresh();
        }
        setTimeout(() => {
          setShowReplyForm(false);
          setReplySubmitted(false);
        }, 2500);
      } else {
        setReplyError(data[0]?.error?.json?.message || t('replyFailed'));
      }
    } catch {
      setReplyError(t('replyFailed'));
    } finally {
      setReplySubmitting(false);
    }
  };

  return (
    <div
      id={getCommentAnchor(comment.id)}
      className={`${depth > 0 ? 'ml-4 sm:ml-8 border-l-2 border-[var(--portal-color-border)]/50 pl-3 sm:pl-5' : ''}`}
    >
      <div className="mb-3 scroll-mt-24 rounded-2xl bg-[var(--portal-color-surface)] p-4 sm:p-5 shadow-2xs border border-[var(--portal-color-border)]/40 hover:border-[var(--portal-color-border)]/80 transition-colors target:border-[var(--portal-color-primary)] target:ring-2 target:ring-[var(--portal-color-primary)]/20">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <CommentAvatar
              authorName={comment.authorName}
              avatar={comment.avatar}
              authorUrl={comment.authorUrl}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                {comment.authorUrl ? (
                  <a
                    href={comment.authorUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-xs sm:text-sm font-semibold text-[var(--portal-color-text)] hover:text-[var(--portal-color-primary)] hover:underline flex items-center gap-1 truncate"
                  >
                    <span>{comment.authorName}</span>
                    <ExternalLink className="h-3 w-3 opacity-60 shrink-0" />
                  </a>
                ) : (
                  <span className="text-xs sm:text-sm font-semibold text-[var(--portal-color-text)] truncate">
                    {comment.authorName}
                  </span>
                )}
              </div>
              <time className="text-[11px] text-[var(--portal-color-text-tertiary)] font-mono block">
                {formatCommentDate(comment.createdAt, locale)}
              </time>
            </div>
          </div>

          {/* Reply trigger button */}
          <button
            type="button"
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-bg)] hover:text-[var(--portal-color-primary)] transition-colors cursor-pointer"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{t('reply')}</span>
          </button>
        </div>

        <p className="text-xs sm:text-sm leading-relaxed text-[var(--portal-color-text)] whitespace-pre-wrap pl-1 sm:pl-11">
          {comment.content}
        </p>
      </div>

      {/* Reply input form */}
      {showReplyForm && (
        <div className="ml-2 sm:ml-8 mb-4 rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-bg)] p-4 sm:p-5 shadow-sm animate-in fade-in zoom-in-98 duration-200">
          {replySubmitted ? (
            <div className="flex items-center justify-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium py-3">
              <Check className="h-4 w-4" />
              <span>{session || !requireModeration ? t('replyPublished') : t('replySubmitted')}</span>
            </div>
          ) : (
            <form onSubmit={handleReplySubmit} className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[var(--portal-color-text-secondary)]">
                <span className="font-semibold text-[var(--portal-color-text)]">
                  {t('replyingTo', { name: comment.authorName })}
                </span>
              </div>

              {replyError && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-2.5 text-xs text-red-600 dark:text-red-400">
                  {replyError}
                </div>
              )}

              {/* Guest metadata fields if unauthenticated */}
              {!session && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="relative">
                      <UserIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--portal-color-text-tertiary)]" />
                      <input
                        type="text"
                        required
                        value={replyName}
                        onChange={(e) => setReplyName(e.target.value)}
                        placeholder={t('namePlaceholder')}
                        className="w-full rounded-xl border border-transparent bg-transparent pl-8 pr-3 py-1.5 text-xs text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="relative">
                      <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--portal-color-text-tertiary)]" />
                      <input
                        type="email"
                        required
                        value={replyEmail}
                        onChange={(e) => setReplyEmail(e.target.value)}
                        placeholder={t('emailPlaceholder')}
                        className="w-full rounded-xl border border-transparent bg-transparent pl-8 pr-3 py-1.5 text-xs text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="relative">
                      <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--portal-color-text-tertiary)]" />
                      <input
                        type="url"
                        value={replyUrl}
                        onChange={(e) => setReplyUrl(e.target.value)}
                        placeholder={t('websitePlaceholder')}
                        className="w-full rounded-xl border border-transparent bg-transparent pl-8 pr-3 py-1.5 text-xs text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div className="border-b border-[var(--portal-color-border)] my-1" />
                </>
              )}

              {/* Honeypot field for bot protection */}
              <div className="hidden" aria-hidden="true" style={{ display: 'none', position: 'absolute', left: '-9999px' }}>
                <input
                  type="text"
                  name="website_hp"
                  tabIndex={-1}
                  autoComplete="off"
                  value={replyHp}
                  onChange={(e) => setReplyHp(e.target.value)}
                />
              </div>

              <textarea
                placeholder={t('replyPlaceholder')}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                required
                rows={2}
                className="w-full resize-none rounded-xl border border-transparent bg-transparent px-3 py-2 text-xs text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none transition-colors block"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[var(--portal-color-text-tertiary)]">
                  {session || !requireModeration ? '' : t('moderationNotice')}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReplyForm(false)}
                    className="rounded-xl px-3 py-1.5 text-xs text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-surface)] transition-colors cursor-pointer"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={replySubmitting}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--portal-color-primary)] px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    <Send className="h-3 w-3" />
                    <span>{replySubmitting ? t('submitting') : t('reply')}</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          postId={postId}
          session={session}
          locale={locale}
          depth={depth + 1}
          guestInfo={guestInfo}
          onGuestInfoChange={onGuestInfoChange}
        />
      ))}
    </div>
  );
}

export function CommentSection({ postId, comments = [] }: { postId: string; comments: Comment[] }) {
  const router = useRouter();
  const { data: session } = useSession();
  const locale = useLocale();
  const t = useTranslations('Comments');
  const requireModeration = siteConfig.comments?.requireModeration ?? true;

  // Form states
  const [content, setContent] = useState('');
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    authorName: '',
    authorEmail: '',
    authorUrl: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  // Load saved guest credentials from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setGuestInfo({
          authorName: parsed.authorName || '',
          authorEmail: parsed.authorEmail || '',
          authorUrl: parsed.authorUrl || '',
        });
      }
    } catch {
      // Ignore local storage parse error
    }
  }, []);

  const handleGuestInfoUpdate = (info: GuestInfo) => {
    setGuestInfo(info);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
    } catch {
      // Ignore storage error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!content.trim()) return;

    if (honeypot.trim().length > 0) {
      setSubmitted(true);
      setContent('');
      return;
    }

    let finalName = guestInfo.authorName.trim();
    let finalEmail = guestInfo.authorEmail.trim();
    let finalUrl = guestInfo.authorUrl.trim();

    if (session?.user) {
      finalName = session.user.name || session.user.email || 'Anonymous';
      finalEmail = session.user.email || '';
    } else {
      if (!finalName) {
        setFormError(t('nameRequired'));
        return;
      }
      if (!finalEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(finalEmail)) {
        setFormError(t('emailRequired'));
        return;
      }
      if (finalUrl && !/^https:\/\//i.test(finalUrl)) {
        setFormError(t('urlHttpsRequired'));
        return;
      }
      handleGuestInfoUpdate({
        authorName: finalName,
        authorEmail: finalEmail,
        authorUrl: finalUrl,
      });
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/trpc/comment.create?batch=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          '0': {
            json: {
              postId,
              content: content.trim(),
              authorName: finalName || undefined,
              authorEmail: finalEmail || undefined,
              authorUrl: finalUrl || undefined,
              locale,
              website_hp: honeypot || undefined,
            },
          },
        }),
      });

      const data = await res.json();
      if (data[0]?.result?.data?.json || res.ok) {
        setSubmitted(true);
        setContent('');
        if (session || !requireModeration) {
          router.refresh();
        }
      } else {
        setFormError(data[0]?.error?.json?.message || t('commentFailed'));
      }
    } catch {
      setFormError(t('commentFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-14 space-y-6">
      <div className="flex items-center justify-between border-b border-compat pb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--portal-color-text)] flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[var(--portal-color-primary)]" />
          <span>{t('count', { count: comments.length })}</span>
        </h2>
      </div>

      {/* Comment List */}
      {comments.length > 0 ? (
        <div className="space-y-3 mb-8">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              session={session}
              locale={locale}
              guestInfo={guestInfo}
              onGuestInfoChange={handleGuestInfoUpdate}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-compat p-8 text-center text-sm text-[var(--portal-color-text-secondary)] mb-8">
          {t('noComments')}
        </div>
      )}

      {/* Main Comment Form */}
      <div className="rounded-3xl border border-compat bg-[var(--portal-color-surface)] p-5 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base sm:text-lg font-bold text-[var(--portal-color-text)] flex items-center gap-2">
            <span>{t('leaveComment')}</span>
          </h3>
          {session?.user ? (
            <span className="text-xs text-[var(--portal-color-text-secondary)] font-medium">
              {t('postingAs', { name: session.user.name || session.user.email || '' })}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => signIn()}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--portal-color-primary)] hover:underline cursor-pointer"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>{t('signInButton')}</span>
            </button>
          )}
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center text-sm font-medium text-emerald-600 dark:text-emerald-400 space-y-2 animate-in fade-in duration-300">
            <Check className="h-6 w-6 mx-auto text-emerald-500" />
            <p>{session || !requireModeration ? t('commentPublished') : t('commentSubmitted')}</p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="text-xs underline text-[var(--portal-color-text-secondary)] hover:text-[var(--portal-color-text)] pt-2 cursor-pointer"
            >
              继续发表
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {formError && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-600 dark:text-red-400">
                {formError}
              </div>
            )}

            {/* Guest Details (when unauthenticated) */}
            {!session && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Nickname (Required) */}
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--portal-color-text-tertiary)]" />
                    <input
                      type="text"
                      required
                      maxLength={50}
                      value={guestInfo.authorName}
                      onChange={(e) =>
                        setGuestInfo((prev) => ({ ...prev, authorName: e.target.value }))
                      }
                      placeholder={t('namePlaceholder')}
                      className="w-full rounded-xl border border-transparent bg-[var(--portal-color-bg)] pl-9 pr-3 py-2 text-xs text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Email (Required) */}
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--portal-color-text-tertiary)]" />
                    <input
                      type="email"
                      required
                      maxLength={100}
                      value={guestInfo.authorEmail}
                      onChange={(e) =>
                        setGuestInfo((prev) => ({ ...prev, authorEmail: e.target.value }))
                      }
                      placeholder={t('emailPlaceholder')}
                      className="w-full rounded-xl border border-transparent bg-[var(--portal-color-bg)] pl-9 pr-3 py-2 text-xs text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Website (Optional, https:// only) */}
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--portal-color-text-tertiary)]" />
                    <input
                      type="url"
                      maxLength={255}
                      value={guestInfo.authorUrl}
                      onChange={(e) =>
                        setGuestInfo((prev) => ({ ...prev, authorUrl: e.target.value }))
                      }
                      placeholder={t('websitePlaceholder')}
                      className="w-full rounded-xl border border-transparent bg-[var(--portal-color-bg)] pl-9 pr-3 py-2 text-xs text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                <div className="border-b border-[var(--portal-color-border)] my-1" />
              </>
            )}

            {/* Honeypot field for bot protection */}
            <div className="hidden" aria-hidden="true" style={{ display: 'none', position: 'absolute', left: '-9999px' }}>
              <input
                type="text"
                name="website_hp"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            {/* Comment Content */}
            <textarea
              placeholder={t('commentPlaceholder')}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
              maxLength={2000}
              className="w-full resize-none rounded-2xl border border-transparent bg-[var(--portal-color-bg)] p-3.5 text-xs sm:text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none transition-colors leading-relaxed block"
            />

            {/* Form Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-[var(--portal-color-text-tertiary)] leading-tight">
                {session || !requireModeration ? '' : t('moderationNotice')}
              </span>
              <button
                type="submit"
                disabled={submitting || !content.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--portal-color-primary)] px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{submitting ? t('submitting') : t('submit')}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
