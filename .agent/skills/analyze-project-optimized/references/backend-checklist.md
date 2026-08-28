# Backend & API Audit Reference Checklist

Use this checklist during **Phase 2.3: Backend & API Layer Audit**. Do not load this file during other phases.

---

## 1. API Architecture & Organization
- [ ] **Router Decomposition**: Monolithic vs modular router files (e.g. splitting bloated admin routers into domain sub-routers).
- [ ] **Procedure Guard Hierarchy**: Correct categorization into `publicProcedure`, `protectedProcedure`, and `adminProcedure`.
- [ ] **Dual-Channel Authentication**: Session verification for Web UI vs API Key / Bearer tokens for automation / REST v1 endpoints.

## 2. Input Validation & Type Safety
- [ ] **Zod Schema Coverage**: Full validation of input queries and mutation payloads; strict integer/string bounds.
- [ ] **Client IP Resolution**: Multi-proxy header extraction (`cf-connecting-ip` -> `x-forwarded-for` -> `x-real-ip`).
- [ ] **Sanitization**: Protection against SQL/Prisma injection, path traversal on file uploads.

## 3. Services & External Integrations
- [ ] **Search Pipeline**: MeiliSearch index synchronization on create/update/delete, with graceful fallback to PostgreSQL `ILIKE`.
- [ ] **Email System**: Pluggable provider abstraction (Mailgun / Sendgrid), asynchronous notification triggers, email template safety.
- [ ] **Rate Limiting**: Presence of Redis / Upstash rate limiting on public write endpoints (comments, guestbook, link submissions).

## 4. Resilience & Error Handling
- [ ] **Transaction Boundaries**: Multi-table operations wrapped in `prisma.$transaction`.
- [ ] **Error Standardization**: Consistent `TRPCError` codes (`UNAUTHORIZED`, `FORBIDDEN`, `BAD_REQUEST`, `NOT_FOUND`).
- [ ] **Observability**: Request logging, development vs production logging separation, no leaked secrets in logs.
