import { NextResponse } from 'next/server';
import { authenticateRequest, getPublicCaller } from '@/lib/api-auth';
import { TRPCError } from '@trpc/server';

export async function GET(req: Request) {
  try {
    const caller = await getPublicCaller();
    const result = await caller.category.list();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('REST GET /categories error:', error);
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
    const { name, slug } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields: name, slug' },
        { status: 400 }
      );
    }

    const category = await caller.admin.categoryCreate({
      name,
      slug,
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: any) {
    console.error('REST POST /categories error:', error);
    if (error instanceof TRPCError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
