# Portal

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
git clone https://github.com/yourusername/portal.git
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

The application will be available at `http://localhost:3000`.

## Project Structure

This is a Turborepo monorepo.

- `apps/web`: The main Next.js application.
- `packages/api`: tRPC routers and API logic.
- `packages/db`: Prisma schema and database client.
- `packages/theme`: Design system and theme configurations.
- `packages/config`: Shared site configurations and utilities.
- `packages/shared`: Shared TypeScript types and constants.

## Deployment

The project is optimized for deployment on Vercel. Ensure you configure all relevant environment variables in your Vercel project settings.

## License

MIT
