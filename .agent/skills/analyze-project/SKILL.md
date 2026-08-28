---
name: analyze-project
description: Optimized, context-efficient project analysis and architecture audit using progressive disclosure, on-demand reference retrieval, script pre-aggregation, and isolated sandboxing. Use when the user asks to analyze the project, audit frontend/backend/database/tests, or generate structured architecture reports without context window degradation.
---

# Optimized Project Analysis & Audit

An agentic, progressive-disclosure workflow designed to analyze full-stack codebases, evaluate architecture fidelity, and synthesize modular audit reports while maintaining extreme context window efficiency and high attention quality.

---

## Core Progressive Disclosure Principles

1. **Pre-aggregation via Scripts (`scripts/`)**:
   - Never dump raw directory trees or inspect dozens of files to understand basic structure.
   - Run lightweight scanner scripts in `scripts/` to get instant, dense JSON summaries of workspace topology, routes, layout variants, router complexity metrics, and DB models.

2. **On-Demand Reference Loading (`references/`)**:
   - Do NOT hold all checklist rules across all domains in working memory.
   - Load specific checklists (e.g. `references/frontend-checklist.md`) via `view_file` **strictly during that specific phase**, and do not carry them forward.

3. **External Memory & Timestamped Output Directory**:
   - By default, create a timestamped output directory formatted as **`analysis-report-YYYYMMDDHHmm`** (e.g. `analysis-report-202608281300`), unless the user explicitly provides a target folder path in their request.
   - Write each domain report (`code-structure.md`, `frontend-structure.md`, etc.) to the target output directory **immediately** upon phase completion.
   - For complex audits, delegate individual audit phases to subagents so each domain audit runs in an isolated, clean context window.

4. **Default Language & i18n Output Policy**:
   - **Default Language**: By default, generate all audit markdown reports in **English** (`*.md`).
   - Do not proactively generate duplicate bilingual reports (e.g. `*.zh.md`) unless the user explicitly requested a specific language in their prompt.
   - If the user asks for a translated version after reviewing the report, generate the requested language document on demand.

5. **Tool Call & Workspace File Writing Rule**:
   - When writing report files to the user's workspace directory (e.g. `analysis-report-YYYYMMDDHHmm/` or a user-specified path), use standard `write_to_file` **WITHOUT** providing `ArtifactMetadata`.
   - `ArtifactMetadata` is strictly reserved for internal IDE brain artifacts located inside `<appDataDir>/brain/...`. Passing it for workspace files will cause tool execution errors.

6. **Two-Pass Executive Synthesis**:
   - Synthesize the final `PROJECT_ANALYSIS_REPORT.md` exclusively from the persisted `analysis-report-YYYYMMDDHHmm/*.md` files, without re-reading raw source code.

---

## Execution Workflow

```
[Phase 1: Discovery & Specs] ──────► Read architecture docs & Run scripts/*.mjs
                                          │
[Phase 2.1: Code Structure] ──────► Write analysis-report-<timestamp>/code-structure.md
                                          │
[Phase 2.2: Frontend Audit] ──────► Read references/frontend-checklist.md
                                    Write analysis-report-<timestamp>/frontend-structure.md
                                          │
[Phase 2.3: Backend Audit] ───────► Read references/backend-checklist.md
                                    Write analysis-report-<timestamp>/backend-structure.md
                                          │
[Phase 2.4: Database Audit] ──────► Read references/database-checklist.md
                                    Write analysis-report-<timestamp>/database-structure.md
                                          │
[Phase 2.5: Testing Audit] ───────► Read references/testing-checklist.md
                                    Write analysis-report-<timestamp>/test-analysis.md
                                          │
[Phase 3: Final Synthesis] ───────► Read references/report-templates.md
                                    Synthesize analysis-report-<timestamp>/PROJECT_ANALYSIS_REPORT.md
```

---

## Step-by-Step Procedure

### Phase 1: High-Speed Discovery & Workspace Pre-aggregation
1. **Run Pre-aggregation Scripts**:
   ```bash
   node ./scripts/summarize-workspace.mjs
   node ./scripts/extract-routes.mjs
   node ./scripts/scan-db-models.mjs
   ```
2. **Review High-Level Specs & Requirements**:
   - **Search Docs Folders**: Inspect existing documentation in `docs/`, `doc/`, `documents/`, `design/`, `designs/`, `architecture/`, `spec/`, `specs/`, `rfc/`, or `wiki/`.
   - **Read High-Level Project Guides**: Review `README.md`, `README.*.md`, `ARCHITECTURE.md`, `DESIGN.md`, or `SPEC.md`.
   - **Extract Key Baselines**: Identify core design decisions, business scope, runtime environments, and documented technical boundaries.

---

### Phase 2: Layered Inspection & Incremental Persistence

Initialize target directory (default: **`analysis-report-YYYYMMDDHHmm`**, e.g. `analysis-report-202608281300`, or user-specified folder). For each sub-step:

#### Step 2.1: Code & Workspace Structure
- **Actions**: Parse workspace packages, dependency graph, build pipeline (`turbo.json`, `pnpm-workspace.yaml`), and data flow.
- **Output**: Write `code-structure.md`.

#### Step 2.2: Frontend Layer Audit
- **On-Demand Reference**: Load `references/frontend-checklist.md`.
- **Actions**: Inspect entry layout, routing paradigms, layout engine variants (`ClassicLayout`, `MetroLayout`, etc.), theme engine tokens, anti-FOUC script, MDX/XSS sanitization, and state synchronization. Inspect 2–3 sample UI/Client components.
- **Output**: Write `frontend-structure.md`.

#### Step 2.3: Backend & API Layer Audit
- **On-Demand Reference**: Load `references/backend-checklist.md`.
- **Actions**: Audit procedure guards (`publicProcedure`, `protectedProcedure`, `adminProcedure`), Zod schema validation, API Key authentication, router complexity metrics (e.g. monolithic router refactoring opportunities), MeiliSearch fallback, and email notification services.
- **Output**: Write `backend-structure.md`.

#### Step 2.4: Database & Storage Layer Audit
- **On-Demand Reference**: Load `references/database-checklist.md`.
- **Actions**: Audit Prisma schema models, unique and compound indices, relational cascades, migration history in `prisma/migrations/`, connection pooling singleton, and R2 asset storage.
- **Output**: Write `database-structure.md`.

#### Step 2.5: Testing & CI/CD Layer Audit
- **On-Demand Reference**: Load `references/testing-checklist.md`.
- **Actions**: Execute test suite (`pnpm test`), diagnose root cause of any failures (e.g. path drift after refactorings), and audit GitHub Actions workflow (`.github/workflows/ci.yml`).
- **Output**: Write `test-analysis.md`.

---

### Phase 3: Final Synthesis & Executive Report

1. **On-Demand Reference**: Load `references/report-templates.md`.
2. **Synthesize Reports**:
   - Read the 5 generated markdown documents in the target `analysis-report-YYYYMMDDHHmm/` directory.
   - Construct executive scorecards, spec-vs-implementation matrices, domain summaries, and prioritized P0/P1/P2 action items.
3. **Output**:
   - Write `PROJECT_ANALYSIS_REPORT.md`.
4. **Present Results**:
   - Output an executive overview with clickable links to all generated artifacts.
