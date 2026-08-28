# Testing & CI/CD Audit Reference Checklist

Use this checklist during **Phase 2.5: Testing & CI/CD Layer Audit**. Do not load this file during other phases.

---

## 1. Test Suite Health & Synchronization
- [ ] **Execution Status**: Current passing/failing tests count and failure root causes.
- [ ] **Path Drift Verification**: Detecting test assertions pointing to obsolete, pre-refactor directory paths.
- [ ] **Fixture Integrity**: Testing data and constants matching current production constants (e.g. theme names, config keys).

## 2. Test Pyramid & Coverage
- [ ] **Unit Tests**: Coverage of pure utility functions, Zod schemas, security sanitizers, and transformers.
- [ ] **Integration Tests**: tRPC procedure execution, database model constraints, and authentication adapters.
- [ ] **End-to-End (E2E) Tests**: Browser-level coverage for critical user journeys (Home, Blog, Admin moderation).

## 3. CI/CD Pipeline Configuration
- [ ] **Quality Gates**: Workflow executing typecheck, linting, migration check, AND automated tests (`pnpm test`).
- [ ] **Environment Simulation**: Ephemeral database containers (e.g. PostgreSQL 16) with proper health checks.
- [ ] **Build Artifact Validation**: Verifying that production builds complete without missing environment variables.
