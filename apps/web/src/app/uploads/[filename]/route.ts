export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  const r2PublicUrl = process.env.R2_PUBLIC_URL;

  if (!r2PublicUrl) {
    console.error('R2_PUBLIC_URL environment variable is not defined');
    return new Response('Server Configuration Error', { status: 500 });
  }

  // Normalize slash at the end of the public URL
  const baseUrl = r2PublicUrl.replace(/\/$/, '');
  const targetUrl = `${baseUrl}/${filename}`;

  // Perform a 307 Temporary Redirect to the R2 public CDN URL
  return Response.redirect(targetUrl, 307);
}
