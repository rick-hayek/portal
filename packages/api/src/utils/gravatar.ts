import crypto from 'node:crypto';
import type { PrismaClient } from '@portal/db';

/**
 * Generate a standard Gravatar image URL from an email address.
 * Falls back to 404 so clients can render custom styled initials.
 */
export function getGravatarUrl(email?: string | null, size = 96): string | null {
  if (!email || !email.trim()) return null;
  const hash = crypto.createHash('md5').update(email.trim().toLowerCase()).digest('hex');
  return `https://gravatar.com/avatar/${hash}?d=404&s=${size}`;
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
 * 2. Otherwise, fallback to Gravatar URL
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

  const resolveAvatar = (email?: string | null) => {
    if (!email) return null;
    const clean = email.trim().toLowerCase();
    return userImageMap.get(clean) || getGravatarUrl(email);
  };

  return comments.map((c) => ({
    ...c,
    avatar: resolveAvatar(c.authorEmail),
    replies: (c.replies || []).map((r) => ({
      ...r,
      avatar: resolveAvatar(r.authorEmail),
    })),
  }));
}
