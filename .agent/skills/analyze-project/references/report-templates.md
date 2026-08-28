# Report Markdown Templates

Use these standard templates when generating reports in `analysis-report/`.

---

## Modular Report Template (`code-structure.md`, `frontend-structure.md`, etc.)

```markdown
# [Domain] Layer Audit & Analysis

## 1. Architecture & Organization
[High-level architecture, module breakdown, entry points]

## 2. Deep-Dive Findings & Design Patterns
[Specific patterns, libraries, data flows]

## 3. Key Findings & Actionable Recommendations
| Category | Finding / Issue | Impact | Recommendation |
|---|---|---|---|
| ... | ... | High/Medium/Low | ... |
```

---

## Executive Report Template (`PROJECT_ANALYSIS_REPORT.md`)

```markdown
# Project Analysis Report: [Project Name]

**Project Version**: [Version]  
**Audit Date**: [Date]  
**Primary Stack**: [Tech Stack]  

---

## 1. Executive Summary
- Maturity Assessment Scorecard (Scores out of 10 for Architecture, Frontend, Backend, Database, Testing).
- Core Strengths & Critical Risks.

## 2. Implementation Status vs. Design Specifications
| Spec Module / Capability | Documented Specification | Actual Implementation Status | Fidelity & Notes |
|---|---|---|---|

## 3. System Architecture & Topology Diagram
[Mermaid diagram representing high-level tiers and data flow]

## 4. Key Findings by Domain
- **Frontend & UI**
- **Backend & APIs**
- **Database & Storage**
- **Testing & CI/CD**

## 5. Prioritized Action Plan (P0 / P1 / P2)
| Priority | Domain | Issue / Optimization Opportunity | Impact | Recommended Action |
|---|---|---|---|---|

## 6. Recommended Multi-Phase Roadmap
- Phase 1 (Immediate)
- Phase 2 (Near-term)
- Phase 3 (Long-term)
```
