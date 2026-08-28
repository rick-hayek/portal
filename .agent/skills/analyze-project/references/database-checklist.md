# Database & Storage Audit Reference Checklist

Use this checklist during **Phase 2.4: Database & Storage Layer Audit**. Do not load this file during other phases.

---

## 1. Schema Design & Constraints
- [ ] **Primary & Foreign Keys**: Proper ID generation strategy (`cuid`, `uuid`), explicit foreign key relation names.
- [ ] **Referential Actions**: Intentional `onDelete: Cascade` vs `onDelete: Restrict` / `SetNull`.
- [ ] **Unique Constraints**: Business identifiers uniquely constrained (`slug`, `email`, compound keys).
- [ ] **JSON Columns Validation**: Unstructured `Json` fields bounded by application-level schemas.

## 2. Query Performance & Indexing
- [ ] **Index Coverage**: Indices on frequently filtered (`status`, `weekOf`), sorted (`createdAt`), or joined columns.
- [ ] **Compound Index Strategy**: Order of fields in compound indices matching actual query filter combinations.
- [ ] **N+1 Prevention**: Explicit `include` / `select` in Prisma queries, batch loaders where appropriate.

## 3. Storage, Retention & Lifecycle
- [ ] **Unbounded Table Growth**: Telemetry/event tables (e.g. `PageView`) analyzed for partitioning, retention, or rollup strategy.
- [ ] **Media & Object Storage**: Large binary files offloaded to S3 / Cloudflare R2 rather than stored in PostgreSQL.
- [ ] **Connection Pooling**: Singleton Prisma client pattern on `globalThis` to prevent connection leaks during HMR.

## 4. Migration & History
- [ ] **Migration Discipline**: Tracking schema changes through sequential, version-controlled SQL files in `prisma/migrations/`.
- [ ] **Zero-Downtime Compatibility**: Ensuring new columns on existing large tables are nullable or have safe defaults.
