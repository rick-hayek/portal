'use client';

import { signIn, useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { useState } from 'react';

interface Comment {
  id: string;
  authorName: string;
  content: string;
  createdAt: Date;
  replies?: Comment[];
}

function CommentItem({ comment, depth = 0 }: { comment: Comment; depth?: number }) {
  return (
    <div
      className={`${depth > 0 ? 'ml-6 border-l-2 border-[var(--portal-color-border)] pl-4' : ''}`}
    >
      <div className="mb-4 rounded-lg bg-[var(--portal-color-surface)] p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--portal-color-primary)] text-sm font-bold text-white">
            {comment.authorName[0]?.toUpperCase()}
          </span>
          <span className="font-medium text-[var(--portal-color-text)]">{comment.authorName}</span>
          <time className="text-xs text-[var(--portal-color-text-secondary)]">
            {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
          </time>
        </div>
        <p className="text-sm leading-relaxed text-[var(--portal-color-text)]">{comment.content}</p>
      </div>
      {comment.replies?.map((reply) => (
        <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
      ))}
    </div>
  );
}

export function CommentSection({ postId, comments = [] }: { postId: string; comments: Comment[] }) {
  const { data: session, status: sessionStatus } = useSession();
  const locale = useLocale();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/trpc/comment.create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          json: { postId, content: content.trim() },
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        setContent('');
      } else {
        alert(locale === 'zh' ? '提交评论失败，请重试。' : 'Failed to submit comment, please try again.');
      }
    } catch {
      alert(locale === 'zh' ? '提交评论失败，请重试。' : 'Failed to submit comment, please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-12">
      <h2 className="mb-6 text-2xl font-bold text-[var(--portal-color-text)]">
        Comments ({comments.length})
      </h2>

      {/* Comment List */}
      {comments.length > 0 ? (
        <div className="mb-8 space-y-2">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <p className="mb-8 text-sm text-[var(--portal-color-text-secondary)]">
          No comments yet. Be the first!
        </p>
      )}

      {/* Comment Form or Sign In Prompt */}
      {sessionStatus === 'loading' ? (
        <div className="h-32 animate-pulse rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)]" />
      ) : !session ? (
        <div
          className="flex flex-col items-center justify-center text-center transition-all border border-compat bg-[var(--portal-color-surface)]"
          style={{
            padding: '2.5rem 1.5rem',
            borderRadius: 12,
            marginBottom: '2.5rem',
            gap: '1rem',
            background:
              'linear-gradient(180deg, var(--portal-color-surface) 0%, rgba(107,142,201,0.02) 100%)',
          }}
        >
          <div
            className="flex items-center justify-center rounded-full bg-[rgba(107,142,201,0.1)] text-[var(--portal-color-primary)]"
            style={{ width: 48, height: 48, marginBottom: '.2rem' }}
          >
            <span style={{ fontSize: '1.2rem' }}>💬</span>
          </div>
          <p
            className="text-[var(--portal-color-text)]"
            style={{ fontSize: '.9rem', fontStyle: 'normal' }}
          >
            {locale === 'zh' ? '请登录后发表评论。' : 'Please sign in to leave a comment.'}
          </p>
          <button
            onClick={() => signIn()}
            className="text-white transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'var(--portal-color-primary)',
              borderRadius: 100,
              padding: '.5rem 1.8rem',
              fontSize: '.82rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(107,142,201,0.2)',
            }}
          >
            {locale === 'zh' ? '登录以发表评论' : 'Sign in to comment'}
          </button>
        </div>
      ) : submitted ? (
        <div className="rounded-lg border border-[var(--portal-color-success)] bg-[var(--portal-color-surface)] p-4 text-center text-sm text-[var(--portal-color-success)]">
          ✅ {locale === 'zh' ? '评论已提交！审核后将会显示。' : 'Comment submitted! It will appear after review.'}
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-6"
        >
          <h3 className="text-lg font-semibold text-[var(--portal-color-text)]">
            {locale === 'zh' ? '发表评论' : 'Leave a comment'}
          </h3>
          <p className="text-xs text-[var(--portal-color-text-secondary)]">
            {locale === 'zh'
              ? `当前以 ${session.user?.name || session.user?.email} 身份评论`
              : `Posting as ${session.user?.name || session.user?.email}`}
          </p>
          <textarea
            placeholder={locale === 'zh' ? '写下你的评论…' : 'Write your comment…'}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={4}
            className="w-full resize-none rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-background)] px-4 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-[var(--portal-color-primary)] px-6 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting
              ? locale === 'zh'
                ? '提交中…'
                : 'Submitting…'
              : locale === 'zh'
                ? '提交'
                : 'Submit'}
          </button>
        </form>
      )}
    </section>
  );
}
