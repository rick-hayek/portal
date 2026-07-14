'use client';

import Image from 'next/image';
import { signIn, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import { useLocalSWR } from '@/hooks/useLocalSWR';

interface GuestbookEntry {
  id: string;
  authorName: string;
  content: string;
  avatar: string | null;
  createdAt: string;
}

interface GuestbookData {
  result: {
    data: {
      json: {
        entries: GuestbookEntry[];
        pagination: { page: number; totalPages: number; total: number };
      };
    };
  };
}

export default function GuestbookPage() {
  const t = useTranslations('Guestbook');
  const { data: session, status: sessionStatus } = useSession();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: cachedData, loading, mutate } = useLocalSWR(
    'guestbook-entries',
    useCallback(async () => {
      const res = await fetch('/api/trpc/guestbook.list?input={}');
      const data: GuestbookData = await res.json();
      return {
        entries: data.result.data.json.entries,
        total: data.result.data.json.pagination.total,
      };
    }, [])
  );

  const entries = cachedData?.entries ?? [];
  const total = cachedData?.total ?? 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !content.trim()) return;
    setSubmitting(true);
    try {
      await fetch('/api/trpc/guestbook.create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          json: { content: content.trim() },
        }),
      });
      setContent('');
      await mutate();
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '5rem 2rem', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      {/* Section header */}
      <div className="flex items-baseline" style={{ gap: '.8rem', marginBottom: '2.5rem' }}>
        <span
          style={{ width: 28, height: 2, background: 'var(--portal-color-primary)', flexShrink: 0 }}
        ></span>
        <span
          className="font-mono uppercase text-[var(--portal-color-primary)]"
          style={{ fontSize: '.7rem', fontWeight: 500, letterSpacing: '.1em' }}
        >
          {t('community')}
        </span>
        <h1
          className="text-[var(--portal-color-text)]"
          style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-.03em' }}
        >
          {t('title')}
        </h1>
      </div>

      {/* Submit Form or Sign In Prompt */}
      {sessionStatus === 'loading' ? (
        <div
          className="border border-compat bg-[var(--portal-color-surface)] animate-pulse"
          style={{ height: 160, borderRadius: 12, marginBottom: '2.5rem' }}
        />
      ) : !session ? (
        <div
          className="border border-compat bg-[var(--portal-color-surface)] flex flex-col items-center justify-center text-center transition-all"
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
            style={{ fontSize: '.9rem', fontWeight: 500 }}
          >
            {t('signInToLeave')}
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
            {t('signInButton')}
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="border border-compat bg-[var(--portal-color-surface)]"
          style={{ padding: '1.5rem', borderRadius: 12, marginBottom: '2.5rem' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '.2rem' }}>
              {session.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? 'User'}
                  width={24}
                  height={24}
                  className="rounded-full border border-compat object-cover"
                  style={{ width: 24, height: 24 }}
                />
              ) : (
                <div
                  className="flex items-center justify-center rounded-full bg-[var(--portal-color-primary)] font-bold text-white"
                  style={{ width: 24, height: 24, fontSize: '.65rem' }}
                >
                  {(session.user?.name ?? session.user?.email ?? 'U')[0].toUpperCase()}
                </div>
              )}
              <span
                className="text-[var(--portal-color-text-secondary)] font-medium"
                style={{ fontSize: '.8rem' }}
              >
                {t('postingAs', { name: session.user?.name ?? 'User' })}
              </span>
            </div>
            <textarea
              placeholder={t('messagePlaceholder')}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={3}
              maxLength={500}
              className="resize-none border border-compat bg-[var(--portal-color-background)] text-[var(--portal-color-text)] focus:border-[var(--portal-color-primary)] focus:outline-none"
              style={{ padding: '.6rem 1rem', borderRadius: 8, fontSize: '.85rem', width: '100%' }}
            />
            <div className="flex items-center justify-between">
              <span
                className="text-[var(--portal-color-text-secondary)]"
                style={{ fontSize: '.72rem' }}
              >
                {content.length}/500
              </span>
              <button
                type="submit"
                disabled={submitting}
                className="text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{
                  background: 'var(--portal-color-primary)',
                  borderRadius: 100,
                  padding: '.4rem 1.2rem',
                  fontSize: '.82rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {submitting ? t('sending') : t('send')}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Entries */}
      {loading ? (
        <p
          className="py-8 text-center text-[var(--portal-color-text-secondary)]"
          style={{ fontSize: '.82rem' }}
        >
          {t('loading')}
        </p>
      ) : entries.length > 0 ? (
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="border border-compat bg-[var(--portal-color-surface)] transition-all hover-border-compat-primary"
              style={{ padding: '1.2rem', borderRadius: 12, boxShadow: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
            >
              <div className="flex items-center" style={{ gap: '.6rem', marginBottom: '.5rem' }}>
                {entry.avatar ? (
                  <Image
                    src={entry.avatar}
                    alt={entry.authorName}
                    width={28}
                    height={28}
                    className="rounded-full border border-compat object-cover"
                    style={{ width: 28, height: 28 }}
                  />
                ) : (
                  <span
                    className="flex items-center justify-center rounded-full bg-[rgba(107,142,201,0.1)] text-[var(--portal-color-primary)]"
                    style={{ width: 28, height: 28, fontSize: '.65rem', fontWeight: 700 }}
                  >
                    {entry.authorName.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <span
                  className="text-[var(--portal-color-text)]"
                  style={{ fontSize: '.78rem', fontWeight: 600 }}
                >
                  {entry.authorName}
                </span>
                <time
                  className="ml-auto font-mono text-[var(--portal-color-text-secondary)]"
                  style={{ fontSize: '.6rem' }}
                >
                  {new Date(entry.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
              </div>
              <p
                className="text-[var(--portal-color-text-secondary)]"
                style={{ fontSize: '.82rem', lineHeight: 1.6 }}
              >
                {entry.content}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p
          className="py-8 text-center text-[var(--portal-color-text-secondary)]"
          style={{ fontSize: '.82rem' }}
        >
          {t('noMessages')}
        </p>
      )}

      {/* Stats Row */}
      <div
        className="flex border-t border-compat-soft"
        style={{ gap: '3rem', padding: '2rem 0', marginTop: '2rem' }}
      >
        <div className="text-center">
          <div
            className="text-[var(--portal-color-text)]"
            style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-.04em' }}
          >
            42
          </div>
          <div
            className="uppercase text-[var(--portal-color-text-secondary)]"
            style={{
              fontSize: '.72rem',
              fontWeight: 500,
              letterSpacing: '.04em',
              marginTop: '.2rem',
            }}
          >
            {t('stats.posts')}
          </div>
        </div>
        <div className="text-center">
          <div
            className="text-[var(--portal-color-text)]"
            style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-.04em' }}
          >
            12
          </div>
          <div
            className="uppercase text-[var(--portal-color-text-secondary)]"
            style={{
              fontSize: '.72rem',
              fontWeight: 500,
              letterSpacing: '.04em',
              marginTop: '.2rem',
            }}
          >
            {t('stats.projects')}
          </div>
        </div>
        <div className="text-center">
          <div
            className="text-[var(--portal-color-text)]"
            style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-.04em' }}
          >
            3.2K
          </div>
          <div
            className="uppercase text-[var(--portal-color-text-secondary)]"
            style={{
              fontSize: '.72rem',
              fontWeight: 500,
              letterSpacing: '.04em',
              marginTop: '.2rem',
            }}
          >
            {t('stats.pageViews')}
          </div>
        </div>
        <div className="text-center">
          <div
            className="text-[var(--portal-color-text)]"
            style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-.04em' }}
          >
            {total || 86}
          </div>
          <div
            className="uppercase text-[var(--portal-color-text-secondary)]"
            style={{
              fontSize: '.72rem',
              fontWeight: 500,
              letterSpacing: '.04em',
              marginTop: '.2rem',
            }}
          >
            {t('stats.guestbook')}
          </div>
        </div>
      </div>
    </div>
  );
}
