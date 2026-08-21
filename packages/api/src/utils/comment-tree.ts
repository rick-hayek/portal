import type { PrismaClient } from '@portal/db';
import { attachCommentAvatars } from './gravatar';

export async function fetchCommentTree(prisma: PrismaClient, postId: string) {
  const allComments = await prisma.comment.findMany({
    where: { postId, status: 'approved' },
    orderBy: { createdAt: 'asc' },
  });

  const commentMap = new Map<string, any>();
  const rootComments: any[] = [];

  for (const c of allComments) {
    commentMap.set(c.id, { ...c, replies: [] });
  }

  for (const c of allComments) {
    const node = commentMap.get(c.id);
    if (c.parentId && commentMap.has(c.parentId)) {
      commentMap.get(c.parentId).replies.push(node);
    } else {
      rootComments.push(node);
    }
  }

  // Root comments sorted by createdAt desc (newest roots first)
  rootComments.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return attachCommentAvatars(prisma, rootComments);
}
