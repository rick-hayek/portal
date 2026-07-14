# Performance Analysis & Optimization Plan

This document compares the architecture of the **Portal** project with your other "instant-load" project (based on Next.js 15, Cloudflare Pages, Workers, KV, D1, and R2) to pinpoint why the Portal is slow and details how to optimize it.

---

## 1. Architectural Differences: Portal vs. The Edge Stack

| Feature | The Other Project (Edge Stack) | Current Project (Portal Stack) | Performance Impact |
| :--- | :--- | :--- | :--- |
| **Runtime Environment** | **Cloudflare Workers (V8 Isolate)**<br>Zero cold starts (<50ms). | **Node.js Runtime**<br>High cold starts (1s - 3s) in serverless environments. | High |
| **Database** | **Cloudflare D1 (Edge SQLite)**<br>Ultra-low query latency close to the edge. | **PostgreSQL (via Prisma ORM)**<br>Connection overhead, network latency (queries must travel to a central database). | High |
| **Caching Layer** | **Workers KV**<br>Global edge caching of data with millisecond reads. | **None**<br>Redis is in `docker-compose` but is **not** implemented in code. | High |
| **Static Assets / Uploads** | **Cloudflare R2 (CDN-backed)**<br>Static assets served directly via CDN. | **Database Storage (PostgreSQL Bytes)**<br>Images are stored as binaries in SQL and streamed via Next.js routes. | Critical |

---

## 2. Root Causes of Portal's Slowness

### 1) Serving Uploaded Files from PostgreSQL (Critical Bottleneck)
In the Portal project, user uploads (like avatars and blog cover images) are stored directly inside the PostgreSQL database as binary data (`fileData Bytes`) and served via [uploads/[filename]/route.ts](file:///Users/rick/src/portal/apps/web/src/app/uploads/[filename]/route.ts).
* **Why it is slow**:
  - Every image load triggers a database connection and synchronous SQL query.
  - Streaming binary data from PostgreSQL blocks connections in the Prisma connection pool, causing other requests (like page load queries) to queue up and wait.
  - Allocating raw buffer memory in Node.js for every image request degrades server performance.

### 2) Database Connection Latency & Prisma Cold Starts
* **Prisma Engine**: Prisma bundles a ~18MB native query engine binary. In serverless environments, loading this binary on a cold start introduces a 1–3 second delay.
* **No Connection Pooling**: If the PostgreSQL database is hosted remotely and doesn't use a connection pooler (like PgBouncer or Prisma Accelerate), the TCP handshake overhead on every new database connection adds 100ms–200ms per request.

### 3) Missing Database Indexes in Prisma Schema
In PostgreSQL, foreign keys and query filters do **not** automatically create database indexes.
* Looking at [schema.prisma](file:///Users/rick/src/portal/packages/db/prisma/schema.prisma), the most frequently queried model—`Post` (Blog)—has **no indexes** on:
  - `status` (queried on every page to show "published" articles)
  - `publishedAt` (used to sort articles)
  - `categoryId` / `authorId` (used for category and author filtering)
* As the database grows, PostgreSQL is forced to do slow **Sequential Scans** (scanning every single row) instead of index scans.

### 4) Dynamic Server-Side Rendering (SSR) Without Caching
* Routes like `/blog` read `searchParams` from the request. This tells Next.js to render the page dynamically at request time (no static caching).
* On every request, the server executes `trpc.post.list()` and `trpc.category.list()`, querying the database from scratch because no application-level caching layer (like Redis or `unstable_cache`) is implemented.

---

## 3. Recommended Optimization Options

### Option A: Offload Uploads to Cloudflare R2 / S3 (Highest Performance Gain)
Stop storing file binaries in PostgreSQL. Instead, store them in Cloudflare R2 or AWS S3:
1. When a user uploads an attachment, upload the binary to an **R2 bucket** instead of Prisma.
2. In the PostgreSQL database, only store the metadata and the public **CDN URL** of the file.
3. Replace `/uploads/[filename]` image sources with direct CDN links (e.g. `https://pub-xxx.r2.dev/filename.png`). This allows files to bypass the database and Next.js server entirely, serving them in milliseconds.

### Option B: Add Database Indexes to the Prisma Schema
Add indexes to [schema.prisma](file:///Users/rick/src/portal/packages/db/prisma/schema.prisma) for all foreign keys and query filters. For example, optimize the `Post` and `Comment` models:

```prisma
model Post {
  id          String    @id @default(cuid())
  // ... (other fields)
  status      String    @default("draft")
  categoryId  String?
  publishedAt DateTime?

  // Add composite indexes for querying and sorting
  @@index([status, publishedAt])
  @@index([categoryId])
  @@index([authorId])
}

model Comment {
  id          String   @id @default(cuid())
  // ... (other fields)
  status      String   @default("pending")
  postId      String
  parentId    String?

  // Add indexes for comment retrieval
  @@index([postId, status])
  @@index([parentId])
}
```
*Run `pnpm db:migrate` after adding these to update the PostgreSQL schema.*

### Option C: Implement Redis Caching (Utilize Existing Infrastructure)
Since a Redis service is already configured in [docker-compose.yml](file:///Users/rick/src/portal/docker-compose.yml), implement cache helpers for heavy tRPC queries.
1. Install `ioredis` in `packages/api` or `packages/db`.
2. Cache the list of posts or categories in Redis for 60 seconds inside `post.ts` router queries:
   ```typescript
   // Pseudo-code caching logic
   const cacheKey = `posts:page:${page}:cat:${categorySlug}`;
   const cached = await redis.get(cacheKey);
   if (cached) return JSON.parse(cached);

   const result = await ctx.prisma.post.findMany(...);
   await redis.set(cacheKey, JSON.stringify(result), 'EX', 60);
   return result;
   ```

### Option D: Migrate the Portal to the Edge Stack (Parity with Your Other Project)
If you want to achieve identical performance to your other project:
1. **Change Database Provider**: Switch the Prisma datasource from PostgreSQL to Cloudflare D1 (SQLite) using the `@prisma/adapter-d1` adapter.
2. **Move to Cloudflare Pages**: Configure the project to build with the `@opennextjs/cloudflare` adapter to compile the server components into Cloudflare Workers (V8 Edge runtime).
3. **Use Cloudflare KV for Caching**: Implement Workers KV caching instead of Redis for global cache storage.
