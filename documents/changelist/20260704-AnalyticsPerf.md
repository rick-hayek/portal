# Analytics Tracking Performance Optimization Plan

This plan aims to optimize the page view logging behavior to reduce client-side network noise and database write operations.

## Analysis and Findings
1. **Asynchronous Fetch**: The current `analytics.track` request is sent via the browser's asynchronous `fetch` API inside a React `useEffect` callback when the pathname changes. This does not block the browser's UI thread or layout rendering, but it has other performance side-effects.
2. **Performance Impact**: 
   - Every single page transition triggers a database `INSERT` operation. Rapid clicking increases database CPU utilization and connection pool consumption.
   - Fast page transitions cause the browser to abort previous fetch requests via `AbortController`, generating aborted requests in the network panel.
3. **Queue and Batching Solution**: Implementing a client-side memory queue allows us to buffer events and send them in batches. This reduces the number of HTTP requests and bulk inserts many records into the database in a single query using Prisma's `createMany`.

---

## Proposed Changes

### 1. Client-Side Page View Queue

#### [MODIFY] [PageViewTracker.tsx](file:///Users/rick/src/portal/apps/web/src/components/analytics/PageViewTracker.tsx)
- Implement a persistent, module-level `eventQueue` array and a `flushTimeout` timer.
- When navigating, push the event to `eventQueue`.
- Flush the queue immediately if it reaches 5 events, or after 5 seconds of inactivity.
- Use `fetch(..., { keepalive: true })` to ensure pending requests complete even if the user closes the page.
- Listen to `visibilitychange` to flush the queue when the tab is closed or hidden.

### 2. Backend Batch Insertion

#### [MODIFY] [analytics.ts](file:///Users/rick/src/portal/packages/api/src/routers/analytics.ts)
- Modify the `track` mutation input validator to accept an array of events.
- Implement Prisma's `createMany` to perform a single SQL bulk insert.
- Support a custom `createdAt` timestamp mapping so that the database records the exact time the page view occurred rather than the flush time.

---

## Verification Plan

### Automated Tests
- Run `pnpm typecheck` to verify no compile errors.
- Run `pnpm build` to compile the production bundle.

### Manual Verification
- Start the server, open the portal, and click between pages.
- Verify that **no** HTTP requests are sent immediately in the network panel.
- After clicking 5 times, verify that a single `analytics.track` request containing all 5 events is sent.
- Wait 5 seconds after a single page visit and verify the queue is flushed.
