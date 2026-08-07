import { TRPCError } from '@trpc/server';
import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';

export async function POST(req: Request) {
  const authResult = await authenticateRequest(req);
  if (!authResult) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { caller } = authResult;

  try {
    const contentType = req.headers.get('content-type') || '';

    let filename: string;
    let mimeType: string;
    let fileData: string; // Base64 string

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'Missing file field in form-data' }, { status: 400 });
      }

      filename = file.name;
      mimeType = file.type || 'application/octet-stream';
      const arrayBuffer = await file.arrayBuffer();
      fileData = Buffer.from(arrayBuffer).toString('base64');
    } else {
      const body = await req.json();
      filename = body.filename;
      mimeType = body.mimeType || 'application/octet-stream';
      fileData = body.fileData || body.file;

      if (!filename || !fileData) {
        return NextResponse.json(
          { error: 'Missing required fields: filename, fileData' },
          { status: 400 },
        );
      }
    }

    const attachment = await caller.attachment.create({
      filename,
      mimeType,
      fileData,
    });

    return NextResponse.json({
      success: true,
      data: attachment,
    }, { status: 201 });
  } catch (error: any) {
    console.error('REST POST /upload error:', error);
    if (error instanceof TRPCError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
