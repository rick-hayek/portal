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

function CommentItem({
  comment,
  postId,
  session,
  locale,
  depth = 0,
}: {
  comment: Comment;
  postId: string;
  session: any;
  locale: string;
  depth?: number;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replySubmitted, setReplySubmitted] = useState(false);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setReplySubmitting(true);
    try {
      const res = await fetch('/api/trpc/comment.create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          json: { postId, content: replyContent.trim(), parentId: comment.id },
        }),
      });
      if (res.ok) {
        setReplySubmitted(true);
        setReplyContent('');
        setTimeout(() => {
          setShowReplyForm(false);
          setReplySubmitted(false);
        }, 3000);
      } else {
        alert(locale === 'zh' ? '提交回复失败，请重试。' : 'Failed to submit reply, please try again.');
      }
    } catch {
      alert(locale === 'zh' ? '提交回复失败，请重试。' : 'Failed to submit reply, please try again.');
    } finally {
      setReplySubmitting(false);
    }
  };

  return (
    <div
      className={`${depth > 0 ? 'ml-4 sm:ml-6 border-l-2 border-[var(--portal-color-border)] pl-3 sm:pl-4' : ''}`}
    >
      <div className="mb-4 rounded-lg bg-[var(--portal-color-surface)] p-4 shadow-sm border border-[var(--portal-color-border-soft)]">
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
        
        {/* Reply button */}
        {session && (
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 text-xs font-medium text-[var(--portal-color-primary)] hover:underline"
            >
              <span>💬</span> {locale === 'zh' ? '回复' : 'Reply'}
            </button>
          </div>
        )}
      </div>

      {/* Reply input form */}
      {showReplyForm && session && (
        <div className="ml-4 sm:ml-6 mb-4 rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-4">
          {replySubmitted ? (
            <div className="text-xs text-[var(--portal-color-success)] text-center font-medium py-1">
              ✅ {locale === 'zh' ? '回复已提交！审核后将会显示。' : 'Reply submitted! It will appear after review.'}
            </div>
          ) : (
            <form onSubmit={handleReplySubmit} className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[var(--portal-color-text-secondary)]">
                <span className="font-medium">
                  {locale === 'zh' ? `回复 @${comment.authorName}` : `Replying to @${comment.authorName}`}
                </span>
                <button
                  type="button"
                  onClick={() => setShowReplyForm(false)}
                  className="hover:underline text-red-500 font-medium"
                >
                  {locale === 'zh' ? '取消' : 'Cancel'}
                </button>
              </div>
              <textarea
                placeholder={locale === 'zh' ? '写下你的回复…' : 'Write your reply…'}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                required
                rows={2}
                className="w-full resize-none rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-background)] px-3 py-1.5 text-xs text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReplyForm(false)}
                  className="rounded-lg border border-[var(--portal-color-border)] px-3 py-1 text-xs text-[var(--portal-color-text-secondary)] hover:bg-[var(--portal-color-surface-alt)]"
                >
                  {locale === 'zh' ? '取消' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={replySubmitting}
                  className="rounded-lg bg-[var(--portal-color-primary)] px-4 py-1 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  {replySubmitting
                    ? locale === 'zh'
                      ? '提交中…'
                      : 'Submitting…'
                    : locale === 'zh'
                      ? '回复'
                      : 'Reply'}
                </button>
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
        />
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
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              session={session}
              locale={locale}
            />
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
