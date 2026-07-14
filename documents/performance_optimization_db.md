# Implementation Plan — Offload Uploads to Cloudflare R2

This plan details the steps to integrate Cloudflare R2 (S3-compatible API) into the Portal project to store and serve uploaded attachments. This replaces the database-stored binary files (`fileData Bytes` in PostgreSQL), eliminating database query load and connection bottlenecks.

## User Review Required

> [!NOTE]
> **Scope of the Migration (Attachment Table Only)**:
> - Yes, this migration **only targets the `Attachment` table**.
> - In the database schema, `Attachment` is the only model storing actual file binary data (`fileData Bytes`). All other tables (like `Post`, `Project`, and `User`) store file references as simple URL strings (e.g. `coverImage: String?`, `avatar: String?`).
> - Moving this single table's binary payloads to R2 offloads all file storage and streaming bandwidth from PostgreSQL.

> [!NOTE]
> **Local Development Connection Setup**:
> - In local development, the app will **connect directly to your real Cloudflare R2 bucket** using R2 API tokens in your local `.env` file.
> - This is the standard industry practice for developing S3/R2 integrations, as it ensures parity with production without needing to manage a heavy local mock/simulator like MinIO. R2 has a free tier of 10GB/month, which is more than enough for development.

> [!WARNING]
> **Database Schema Migration & Data Loss**:
> Modifying the `Attachment` table to remove the `fileData` column will drop the binary data stored in the database.
> - **Impact**: Any previously uploaded files stored locally in the PostgreSQL database will be deleted.
> - **Status**: Approved (OK to drop local data for development environment).

---

## Proposed Changes

### 1. Monorepo Dependencies

We will install `@aws-sdk/client-s3` in `@portal/api` to interact with Cloudflare R2.

#### [MODIFY] [package.json](file:///Users/rick/src/portal/packages/api/package.json)
- Add `@aws-sdk/client-s3` as a dependency.

---

### 2. Database Schema

We will replace the `fileData Bytes` column with a `url String` column in the `Attachment` model.

#### [MODIFY] [schema.prisma](file:///Users/rick/src/portal/packages/db/prisma/schema.prisma)
- Update the `Attachment` model:
  ```prisma
  model Attachment {
    id        String   @id @default(cuid())
    filename  String   @unique
    mimeType  String
    url       String   @default("") // S3/R2 Public URL
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
  }
  ```

---

### 3. Environment Variables

We will add environment variables to configure R2 connectivity, pre-configuring your public R2 CDN domain.

#### [MODIFY] [.env.example](file:///Users/rick/src/portal/.env.example) and [.env](file:///Users/rick/src/portal/.env)
- Add the following variables:
  ```env
  # Cloudflare R2 Storage Configuration
  R2_ACCOUNT_ID="your-cloudflare-account-id"
  R2_ACCESS_KEY_ID="your-r2-access-key-id"
  R2_SECRET_ACCESS_KEY="your-r2-secret-access-key"
  R2_BUCKET_NAME="your-r2-bucket-name"
  R2_PUBLIC_URL="https://pub-8e6d28a4f57a48539e93d60d9359e729.r2.dev"
  ```

---

### 4. Cloudflare R2 Client Utility

We will create a utility to initialize the S3-compatible client for R2 in `@portal/api`.

#### [NEW] [r2.ts](file:///Users/rick/src/portal/packages/api/src/utils/r2.ts)
- Initialize `S3Client` with the Cloudflare R2 endpoint.
- Export utility functions:
  - `uploadToR2(filename: string, buffer: Buffer, mimeType: string): Promise<string>` (returns the public URL)
  - `deleteFromR2(filename: string): Promise<void>`

---

### 5. API Router Refactoring

We will update the `attachment` router to upload to R2 and store the resulting URL.

#### [MODIFY] [attachment.ts](file:///Users/rick/src/portal/packages/api/src/routers/attachment.ts)
- Import R2 utility functions.
- Update `create`:
  - Upload the file buffer to Cloudflare R2 using `uploadToR2`.
  - Save the metadata and the R2 `url` in the database.
- Update `delete`:
  - Query the database to find the `filename` of the target attachment.
  - Delete the object from R2 using `deleteFromR2`.
  - Delete the database record.

---

### 6. Uploads Route Redirect Optimization

Instead of streaming binary data from PostgreSQL, we will redirect the request directly to Cloudflare R2's CDN public URL. This bypasses the database entirely and offloads bandwidth from the Next.js server.

#### [MODIFY] [route.ts](file:///Users/rick/src/portal/apps/web/src/app/uploads/[filename]/route.ts)
- Replace database lookup and binary streaming with a fast redirect:
  ```typescript
  export async function GET(
    _request: Request,
    { params }: { params: Promise<{ filename: string }> },
  ) {
    const { filename } = await params;
    const r2PublicUrl = process.env.R2_PUBLIC_URL;

    if (!r2PublicUrl) {
      return new Response('R2 Public URL not configured', { status: 500 });
    }

    // Redirect to the Cloudflare R2 public URL
    return Response.redirect(`${r2PublicUrl}/${filename}`, 307);
  }
  ```

---

## Verification Plan

### Automated Tests
- Build verification: `pnpm --filter @portal/web run build`
- Typecheck verification: `pnpm typecheck`

### Manual Verification
1. Add R2 keys (Account ID, Access Key, Secret Key, and Bucket Name) to `.env`.
2. Run database migration: `pnpm db:generate && pnpm db:migrate`.
3. Open the Admin dashboard `/admin/attachments` and upload an image.
4. Verify that the image is uploaded successfully and appears in your Cloudflare R2 bucket console.
5. Attempt to view the uploaded file via the `/uploads/[filename]` link, verifying that it redirects successfully to the R2 public CDN URL.
6. Delete the attachment from the Admin dashboard and verify it is removed from R2.
