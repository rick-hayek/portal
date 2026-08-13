# Voocii Portal ![Version](https://img.shields.io/badge/version-v1.0.0-blue.svg)

A modern, full-stack personal portal and portfolio built with Next.js 16, tRPC, Prisma, and Tailwind CSS v4.

English | [中文](./README.zh.md) 
![Metro Homepage](./designs/screenshot/voocii-metro-en.png){width=400}  ![Classic Homepage](./designs/screenshot/voocii-classic-en.png){width=400}


## Features

- **Next.js 16 App Router**: Leverage the latest React features and server components.
- **tRPC**: End-to-end typesafe APIs.
- **Prisma ORM**: Type-safe database access with PostgreSQL.
- **Tailwind CSS v4**: Utility-first styling with a modern design system.
- **Next-Intl**: Full internationalization (i18n) support for English and Chinese.
- **Theme Engine**: Built-in dark mode and multiple theme presets.
- **Monorepo Architecture**: Managed with Turborepo and pnpm workspaces.
- **Modular Design**: Includes Blog, Portfolio, Guestbook, Links, and developer Tools.
- **Admin Dashboard**: Integrated content management and analytics.

## Prerequisites

- Node.js >= 20
- pnpm >= 9
- PostgreSQL >= 16
- Redis (Optional, for caching)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/rick-hayek/portal.git
cd portal
```

### 2. Install dependencies

This project uses `pnpm` as the package manager.

```bash
pnpm install
```

### 3. Environment Variables

Copy the example environment file and fill in your variables:

```bash
cp .env.example .env
```

Ensure you set the `DATABASE_URL` to your local or remote PostgreSQL instance.

### 4. Database Setup & Migrations

Launch local PostgreSQL database with Docker:
```bash
docker compose up -d
```

#### For Local Development
Run Prisma migrations to execute all version-controlled SQL scripts in chronological order:

```bash
pnpm --filter @portal/db migrate:dev
```

#### For Production Deployment
Apply all incremental migrations safely to your production database without resetting data:

```bash
pnpm --filter @portal/db migrate:deploy
```

> [!NOTE]
> All database structural changes and version history are tracked in `packages/db/prisma/migrations/`. Running the migration command automatically applies every migration sequentially from `20260213044327_init` to the latest schema version.

(Optional) Seed the database with initial data:

```bash
pnpm --filter @portal/db seed
```

### 5. Run the Development Server

Start the Turborepo development server across all packages:

```bash
pnpm dev
```

- The main application will be available at `http://localhost:3000`.
- The **Admin Dashboard** is accessible at `/admin` (e.g. `http://localhost:3000/admin`). Only authenticated users with the `admin` role can access it.

### 6. Database Studio & Administration

To open the visual database editor (Prisma Studio) to manage users, roles (e.g. setting yourself to `admin`), and content records directly:

```bash
pnpm --filter @portal/db studio
```

This will start a web client at `http://localhost:5555`.

## Project Structure

This is a Turborepo monorepo.

- `apps/web`: The main Next.js application.
- `packages/api`: tRPC routers and API logic.
- `packages/db`: Prisma schema and database client.
- `packages/theme`: Design system and theme configurations.
- `packages/config`: Shared site configurations and utilities.
- `packages/shared`: Shared TypeScript types and constants.

## Layout Configuration & Extensibility

### 1. Configuring Homepage Layout (`homeLayout`)

You can switch the homepage layout style easily in [`apps/web/src/site.config.ts`](apps/web/src/site.config.ts):

```ts
const siteConfig = defineConfig({
  // ...
  homeLayout: 'classic', // Built-in options: 'classic' | 'metro'
});
```

Built-in layouts:
- `'classic'`: Traditional responsive flow layout with clean hero section, post lists, and card grids.
- `'metro'`: Microsoft Windows Metro-style grid layout (Tessellate Noir dark high-contrast grid design).

### 2. Layout Extensibility (Adding Custom Layouts)

The architecture decouples layout components from page data fetching, allowing seamless addition of new homepage layouts (e.g. `'bento'`, `'newspaper'`, `'minimal'`):

1. **Create Layout Component**:
   Build your layout component inside [`apps/web/src/components/home/layouts/`](apps/web/src/components/home/layouts/) (e.g. `BentoLayout.tsx`).
2. **Register Config Option**:
   Add your new layout key to `homeLayout` type/options in configuration.
3. **Dispatch in Home Route**:
   In [`apps/web/src/app/[locale]/(site)/page.tsx`](apps/web/src/app/[locale]/(site)/page.tsx), add a dispatch branch:
   ```tsx
   if (activeLayout === 'bento') {
     return <BentoLayout {...layoutProps} />;
   }
   ```

---

## Deployment

### 1. Site Configuration (Pre-deployment)

Before deploying to production, update your site configuration in [`apps/web/src/site.config.ts`](apps/web/src/site.config.ts) with your domain name and site metadata:

```ts
const siteConfig = defineConfig({
  site: {
    title: 'Your Site Title',
    description: 'Your site description',
    url: 'https://your-domain.com', // Must be set to your production domain
    locale: 'zh-CN',
  },
  // ...
});
```

> [!IMPORTANT]
> Setting `site.url` to your actual production domain is required for:
> - **SEO & Search Crawlers**: Canonical URLs generated in `sitemap.xml` and `robots.txt`.
> - **Social Sharing**: Open Graph and Twitter Card preview links when sharing pages.
> - **RSS Feed**: Article canonical URLs in `/feed.xml`.

### 2. Vercel Deployment

The project is optimized for deployment on Vercel. Ensure you configure all relevant environment variables in your Vercel project settings.

### 3. Database Migrations (Production)

When deploying updates that involve database schema changes, you must apply the migrations to your production database.

#### Option 1: Manual Migration
Run the following command locally with your production database URL set as the `DATABASE_URL` environment variable:
```bash
DATABASE_URL="your-production-database-url" pnpm --filter @portal/db migrate:deploy
```

#### Option 2: Automatic Vercel Build Step (Recommended)
Configure the **Build Command** in your Vercel project settings to run migrations automatically before every build:
```bash
pnpm --filter @portal/db migrate:deploy && turbo build
```
This ensures the database schema is always updated before building and serving the new version.

## Versioning & Changelog

This project adheres to [Semantic Versioning (SemVer)](https://semver.org/):
- **MAJOR (`X.0.0`)**: Breaking changes or major architectural overhauls.
- **MINOR (`0.X.0`)**: New feature modules, layouts, or non-breaking API additions.
- **PATCH (`0.0.X`)**: Bug fixes, performance optimizations, or UI styling polish.

All version releases, detailed feature additions, and breaking changes are documented in [`CHANGELOG.md`](CHANGELOG.md).

## License

MIT


