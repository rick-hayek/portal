import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

// Initialize S3Client for Cloudflare R2
const s3Client = new S3Client({
  endpoint: R2_ACCOUNT_ID ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : undefined,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || '',
    secretAccessKey: R2_SECRET_ACCESS_KEY || '',
  },
  region: 'auto',
});

/**
 * Uploads a buffer to Cloudflare R2
 * @param filename File name/key in the bucket
 * @param buffer File binary buffer
 * @param mimeType MIME type of the file
 * @returns The public URL of the uploaded file
 */
export async function uploadToR2(
  filename: string,
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  if (!R2_BUCKET_NAME || !R2_PUBLIC_URL) {
    throw new Error('R2 configuration is missing (R2_BUCKET_NAME or R2_PUBLIC_URL)');
  }

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: filename,
    Body: buffer,
    ContentType: mimeType,
  });

  await s3Client.send(command);

  // Normalize slash at the end of the public URL
  const baseUrl = R2_PUBLIC_URL.replace(/\/$/, '');
  return `${baseUrl}/${filename}`;
}

/**
 * Deletes a file from Cloudflare R2
 * @param filename File name/key in the bucket
 */
export async function deleteFromR2(filename: string): Promise<void> {
  if (!R2_BUCKET_NAME) {
    throw new Error('R2 configuration is missing (R2_BUCKET_NAME)');
  }

  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: filename,
  });

  await s3Client.send(command);
}
