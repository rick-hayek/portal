import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { url, method = 'GET', headers = {}, body } = payload;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL scheme
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return NextResponse.json(
        { error: 'Only HTTP and HTTPS protocols are supported' },
        { status: 400 },
      );
    }

    // Clean headers to avoid proxy loop / host mismatches
    const forwardHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      const lower = key.toLowerCase();
      if (
        lower !== 'host' &&
        lower !== 'content-length' &&
        lower !== 'connection' &&
        typeof value === 'string'
      ) {
        forwardHeaders[key] = value;
      }
    }

    const startTime = Date.now();
    const fetchOptions: RequestInit = {
      method: method.toUpperCase(),
      headers: forwardHeaders,
      cache: 'no-store',
    };

    if (
      body &&
      typeof body === 'string' &&
      ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())
    ) {
      fetchOptions.body = body;
    }

    const response = await fetch(url, fetchOptions);
    const duration = Date.now() - startTime;

    const responseText = await response.text();
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((val, key) => {
      responseHeaders[key] = val;
    });

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseText,
      duration,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err?.message || 'Proxy request failed',
        isProxyError: true,
      },
      { status: 502 },
    );
  }
}
