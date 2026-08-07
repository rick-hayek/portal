# Voocii Portal

A modern, full-stack personal portal and portfolio built with Next.js 16, tRPC, Prisma, and Tailwind CSS v4.

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

### 4. Database Setup

Launch database server:
```bash
docker compose up -d
```

Run Prisma migrations to initialize the database schema:

```bash
pnpm prisma migrate dev
```

(Optional) Seed the database with initial data:

```bash
pnpm prisma db seed
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
## Deployment

### 1. Site Configuration (Pre-deployment)

Before deploying to production, update your site configuration in [`apps/web/src/site.config.ts`](file:///Users/rick/src/portal/apps/web/src/site.config.ts) with your domain name and site metadata:

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

## License

MIT


