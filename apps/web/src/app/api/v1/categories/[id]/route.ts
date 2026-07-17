import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';
import { prisma } from '@portal/db';
import { TRPCError } from '@trpc/server';

interface RouteParams {
  params: {
    id: string;
  };
}

// Helper to find category by ID or slug
async function findCategoryByIdOrSlug(idOrSlug: string) {
  return prisma.category.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
  });
}

export async function PUT(req: Request, { params }: RouteParams) {
  const authResult = await authenticateRequest(req);
  if (!authResult) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { caller } = authResult;

  try {
    const category = await findCategoryByIdOrSlug(params.id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const body = await req.json();
    const { name, slug } = body;

    const updatedCategory = await caller.admin.categoryUpdate({
      id: category.id,
      name: name || undefined,
      slug: slug || undefined,
    });

    return NextResponse.json({ success: true, data: updatedCategory });
  } catch (error: any) {
    console.error(`REST PUT /categories/${params.id} error:`, error);
    if (error instanceof TRPCError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const authResult = await authenticateRequest(req);
  if (!authResult) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { caller } = authResult;

  try {
    const category = await findCategoryByIdOrSlug(params.id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const deletedCategory = await caller.admin.categoryDelete({
      id: category.id,
    });

    return NextResponse.json({ success: true, data: deletedCategory });
  } catch (error: any) {
    console.error(`REST DELETE /categories/${params.id} error:`, error);
    if (error instanceof TRPCError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
