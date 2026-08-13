# Changelog

All notable changes to the Voocii Portal project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-08-13

### Added
- **Metro Grid Layout (Tessellate Noir)**: Microsoft Windows Metro-style 9-tile grid layout with custom accent color tokens (`#fbbc00`, `#00e3fd`, `#ffdfd4`, `#4f46e5`, `#e11d48`, `#6b21a8`, `#0d9488`).
- **Dynamic Layout Dispatching**: Configurable `homeLayout` (`'classic'` | `'metro'`) in `site.config.ts` supporting extensible homepage layout components.
- **RSC Sub-link Navigation**: Pure React Server Component (RSC) Z-Index layer overlay pattern for nested tile links (books, tools, network avatars) with 0 JS hydration overhead.
- **Theme Engine Integration**: Dark Neon theme locking in Metro mode with zero white-flash background transitions.

([`fc16105`](https://github.com/rick-hayek/voocii-portal/commit/fc16105bfb34b8d566a959b16461de207391834f))

## [0.5.0] - 2026-07-17

### Added
- **Authenticated REST API (v1)**: Implement REST API routes (`/api/v1/posts`, `/api/v1/categories`) with API key authentication for external integrations ([`6b62417`](https://github.com/rick-hayek/voocii-portal/commit/6b6241752245c69424aef4bcae025ef43aa32202)).

## [0.4.0] - 2026-07-14

### Changed
- **Cloudflare R2 Attachment Storage**: Migrate file attachment storage from PostgreSQL byte arrays to Cloudflare R2 object storage with redirect-based asset serving ([`bfba2ae`](https://github.com/rick-hayek/voocii-portal/commit/bfba2aef43c30eaae5666e30e709aff2861dd201)).

## [0.3.0] - 2026-07-05

### Added
- **AI & Open-Source Trending Page**: Dedicated AI & GitHub trending repository tracking page (`/trending`) featuring weekly star growth data aggregation ([`d187eca`](https://github.com/rick-hayek/voocii-portal/commit/d187eca7246912d744171a961d6d555fd1080517)).

## [0.2.0] - 2026-02-21

### Added
- **Internationalization (i18n)**: Implement full English and Chinese localization with `next-intl`, i18n-aware routing middleware, and locale dictionary files ([`a94eed2`](https://github.com/rick-hayek/voocii-portal/commit/a94eed21bbf38a97cc2e6c56f1feefbe9841544a)).

## [0.1.0] - 2026-02-13

### Added
- **Initial Project Release**: Initialize core project structure with Next.js 16 App Router application, Turborepo monorepo packages, tRPC API, and Prisma ORM PostgreSQL schema ([`e20fc69`](https://github.com/rick-hayek/voocii-portal/commit/e20fc69ee65f755cf33c1a7149f149f9f0068280)).
