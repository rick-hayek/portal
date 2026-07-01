import { prisma } from '@portal/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;

  try {
    const attachment = await prisma.attachment.findUnique({
      where: { filename },
    });

    if (!attachment) {
      return new Response('Attachment Not Found', { status: 404 });
    }

    return new Response(attachment.fileData, {
      headers: {
        'Content-Type': attachment.mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Failed to fetch attachment', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
