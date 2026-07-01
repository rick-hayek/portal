import { prisma } from '@portal/db';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const reference = await prisma.reference.findUnique({
      where: { slug },
    });

    if (!reference) {
      return new Response('Reference Not Found', { status: 404 });
    }

    return new Response(reference.htmlCode, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Failed to fetch reference page', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
