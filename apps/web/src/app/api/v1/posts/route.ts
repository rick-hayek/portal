import { NextResponse } from 'next/server';
import { authenticateRequest, getPublicCaller } from '@/lib/api-auth';
import { TRPCError } from '@trpc/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const categorySlug = searchParams.get('categorySlug') || undefined;
    const tagSlug = searchParams.get('tagSlug') || undefined;
    const requestedStatus = searchParams.get('status') || 'published';

    // If requesting drafts or 'all', check auth
    let status: 'published' | 'draft' = 'published';
    if (requestedStatus === 'draft') {
      const authResult = await authenticateRequest(req);
      if (!authResult) {
        return NextResponse.json({ error: 'Unauthorized to view drafts' }, { status: 401 });
      }
      status = 'draft';
    }

    const caller = await getPublicCaller();
    const result = await caller.post.list({
      page,
      limit,
      categorySlug,
      tagSlug,
      status,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('REST GET /posts error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authResult = await authenticateRequest(req);
  if (!authResult) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { caller } = authResult;

  try {
    const body = await req.json();
    const { title, slug, content, excerpt, status = 'draft', categoryId, tagIds = [] } = body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: title, slug, content' },
        { status: 400 }
      );
    }

    const post = await caller.admin.postCreate({
      title,
      slug,
      content,
      excerpt: excerpt || undefined,
      status,
      categoryId: categoryId || undefined,
      tagIds,
    });

    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (error: any) {
    console.error('REST POST /posts error:', error);
    if (error instanceof TRPCError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
