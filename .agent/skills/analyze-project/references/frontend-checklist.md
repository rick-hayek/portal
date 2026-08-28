# Frontend Audit Reference Checklist

Use this checklist during **Phase 2.2: Frontend Layer Audit**. Do not load this file during other phases.

---

## 1. Routing & Layout Architecture
- [ ] **Routing Paradigm**: App Router conventions (`[locale]`, route groups `(site)`, `(admin)`, parallel/intercepting routes).
- [ ] **Layout Composition**: Layout nesting, root HTML/body tags, provider tree depth, and error boundaries.
- [ ] **Multi-Layout Engine**: Layout switching mechanisms, dynamic components, and layout isolation.

## 2. Rendering & Performance (Core Web Vitals)
- [ ] **RSC vs Client Components**: Appropriate use of `'use client'`; server-side data fetching via direct caller vs client fetching.
- [ ] **Bundle & Code Splitting**: Heavy client library isolation (e.g. Monaco editor, Mermaid, chart libraries, highlight.js dynamic imports).
- [ ] **Anti-FOUC & Hydration**: Inline script theme injection (`ThemeScript`), `suppressHydrationWarning` on root tags, zero layout shifts on mount.
- [ ] **Image & Asset Optimization**: Next/Image usage, priority flags on LCP hero elements, correct responsive sizes.

## 3. UI, Theming & Design System
- [ ] **Theme Engine**: CSS custom properties token structure (`--portal-color-*`), light/dark mode contrast compliance.
- [ ] **Tailwind CSS v4 Integration**: `@theme` mapping, design token consistency, no ad-hoc arbitrary styles.
- [ ] **Typography & Spacing**: Font loading via `next/font`, responsive typography scale, vertical rhythm.

## 4. Forms, Interactions & Security
- [ ] **Spam & Abuse Defense**: Honeypot fields, math captchas, submission time tokens (`timingToken`).
- [ ] **Markdown / MDX Pipeline**: AST sanitization (`rehype-sanitize`), disallowed raw scripts, XSS-proof rendering.
- [ ] **Accessibility (a11y)**: Focus rings (`:focus-visible`), ARIA attributes on modals/drawers (`aria-modal`, `aria-expanded`), keyboard navigability.
- [ ] **Modal & Overlay Architecture**: Standardized dialog primitives, scroll locking, and escape-key handling.
