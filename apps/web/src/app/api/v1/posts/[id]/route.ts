import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';
import { prisma } from '@portal/db';
import { TRPCError } from '@trpc/server';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// Helper to find post by ID or slug
async function findPostByIdOrSlug(idOrSlug: string) {
  return prisma.post.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
      category: { select: { id: true, name: true, slug: true } },
      tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
    },
  });
}

export async function GET(req: Request, { params }: RouteParams) {
  const { id } = await params;
  try {
    const post = await findPostByIdOrSlug(id);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // If post is draft, require authentication
    if (post.status === 'draft') {
      const authResult = await authenticateRequest(req);
      if (!authResult) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
    }

    return NextResponse.json(post);
  } catch (error: any) {
    console.error(`REST GET /posts/${id} error:`, error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  const { id } = await params;
  const authResult = await authenticateRequest(req);
  if (!authResult) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { caller } = authResult;

  try {
    const post = await findPostByIdOrSlug(id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const body = await req.json();
    const { title, slug, content, excerpt, status, categoryId, tagIds } = body;

    const updatedPost = await caller.admin.postUpdate({
      id: post.id,
      title: title || undefined,
      slug: slug || undefined,
      content: content || undefined,
      excerpt: excerpt === null ? undefined : excerpt,
      status: status || undefined,
      categoryId: categoryId === null ? null : categoryId || undefined,
      tagIds: tagIds || undefined,
    });

    return NextResponse.json({ success: true, data: updatedPost });
  } catch (error: any) {
    console.error(`REST PUT /posts/${id} error:`, error);
    if (error instanceof TRPCError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const { id } = await params;
  const authResult = await authenticateRequest(req);
  if (!authResult) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { caller } = authResult;

  try {
    const post = await findPostByIdOrSlug(id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const deletedPost = await caller.admin.postDelete({
      id: post.id,
    });

    return NextResponse.json({ success: true, data: deletedPost });
  } catch (error: any) {
    console.error(`REST DELETE /posts/${id} error:`, error);
    if (error instanceof TRPCError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
