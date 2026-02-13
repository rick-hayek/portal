'use client';

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
        <div className={`${depth > 0 ? 'ml-6 border-l-2 border-[var(--portal-color-border)] pl-4' : ''}`}>
            <div className="mb-4 rounded-lg bg-[var(--portal-color-surface)] p-4">
                <div className="mb-2 flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--portal-color-primary)] text-sm font-bold text-white">
                        {comment.authorName[0]?.toUpperCase()}
                    </span>
                    <span className="font-medium text-[var(--portal-color-text)]">
                        {comment.authorName}
                    </span>
                    <time className="text-xs text-[var(--portal-color-text-secondary)]">
                        {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
                    </time>
                </div>
                <p className="text-sm leading-relaxed text-[var(--portal-color-text)]">
                    {comment.content}
                </p>
            </div>
            {comment.replies?.map((reply) => (
                <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
            ))}
        </div>
    );
}

export function CommentSection({
    postId,
    comments = [],
}: {
    postId: string;
    comments: Comment[];
}) {
    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !content.trim()) return;
        setSubmitting(true);
        try {
            await fetch('/api/trpc/comment.create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    json: { postId, authorName: name.trim(), content: content.trim() },
                }),
            });
            setSubmitted(true);
            setName('');
            setContent('');
        } catch {
            // silently fail for now
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

            {/* Comment Form */}
            {submitted ? (
                <div className="rounded-lg border border-[var(--portal-color-success)] bg-[var(--portal-color-surface)] p-4 text-center text-sm text-[var(--portal-color-success)]">
                    ✅ Comment submitted! It will appear after review.
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-6">
                    <h3 className="text-lg font-semibold text-[var(--portal-color-text)]">Leave a comment</h3>
                    <input
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-background)] px-4 py-2 text-sm text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
                    />
                    <textarea
                        placeholder="Write your comment…"
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
                        {submitting ? 'Submitting…' : 'Submit'}
                    </button>
                </form>
            )}
        </section>
    );
}
