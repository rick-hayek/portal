import crypto from 'node:crypto';
import type { PrismaClient } from '@portal/db';

const PALETTE = [
  '4f46e5', // indigo
  '06b6d4', // cyan
  '059669', // emerald
  'd97706', // amber
  'dc2626', // red
  '7c3aed', // violet
  'db2777', // pink
  '2563eb', // blue
  '0891b2', // teal
  '16a34a', // green
];

/**
 * Generate a standard Gravatar image URL from an email address with dynamic initials fallback.
 * Note: Gravatar's WordPress CDN strips query parameters (?key=value) from custom default image URLs.
 * Therefore, we use UI-Avatars REST path format (https://ui-avatars.com/api/{name}/{size}/{bg}/{color})
 * which is fully preserved and returns a vibrant initial avatar with HTTP 200.
 */
export function getGravatarUrl(
  email?: string | null,
  name?: string | null,
  size = 96,
): string | null {
  if (!email || !email.trim()) return null;
  const hash = crypto.createHash('md5').update(email.trim().toLowerCase()).digest('hex');
  const displayName = (name || email.split('@')[0] || 'User').trim();
  
  // Pick a deterministic pleasant background color based on email hash
  const colorIndex = Math.abs(hash.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % PALETTE.length;
  const bg = PALETTE[colorIndex];
  
  // REST path format avoiding query string parameter stripping in Gravatar proxy
  const fallbackUrl = `https://ui-avatars.com/api/${encodeURIComponent(displayName)}/${size}/${bg}/ffffff`;
  return `https://gravatar.com/avatar/${hash}?d=${encodeURIComponent(fallbackUrl)}&s=${size}`;
}

interface CommentWithReplies {
  id: string;
  authorName: string;
  authorEmail: string | null;
  authorUrl?: string | null;
  content: string;
  createdAt: Date;
  replies?: CommentWithReplies[];
  [key: string]: any;
}

/**
 * Resolves avatars for comments:
 * 1. If authorEmail belongs to a registered User with image (e.g. GitHub avatar), use User.image
 * 2. Otherwise, fallback to Gravatar URL with UI-Avatars initials fallback
 */
export async function attachCommentAvatars<T extends CommentWithReplies>(
  prisma: PrismaClient,
  comments: T[],
): Promise<Array<T & { avatar: string | null; replies: Array<any & { avatar: string | null }> }>> {
  const emails = Array.from(
    new Set(
      comments
        .flatMap((c) => [c.authorEmail, ...(c.replies?.map((r) => r.authorEmail) || [])])
        .filter((e): e is string => Boolean(e && e.trim())),
    ),
  );

  const userImageMap = new Map<string, string>();
  if (emails.length > 0) {
    const users = await prisma.user.findMany({
      where: {
        email: { in: emails },
        image: { not: null },
      },
      select: { email: true, image: true },
    });
    for (const u of users) {
      if (u.email && u.image) {
        userImageMap.set(u.email.toLowerCase(), u.image);
      }
    }
  }

  const resolveAvatar = (email?: string | null, name?: string | null) => {
    if (!email) return null;
    const clean = email.trim().toLowerCase();
    return userImageMap.get(clean) || getGravatarUrl(email, name);
  };

  return comments.map((c) => ({
    ...c,
    avatar: resolveAvatar(c.authorEmail, c.authorName),
    replies: (c.replies || []).map((r) => ({
      ...r,
      avatar: resolveAvatar(r.authorEmail, r.authorName),
    })),
  }));
}
