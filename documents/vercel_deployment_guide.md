# Vercel 部署指南 (Next.js 16 Monorepo + Prisma)

本项目采用 Turborepo Monorepo 架构，并依赖 PostgreSQL、Redis 和 Meilisearch。要将项目顺利部署至 Vercel，请按照本指南进行项目配置和环境变量设置。

---

## 部署方案选择

在 Vercel 导入 GitHub 仓库时，针对本 Monorepo 结构，有以下两种配置方案。**推荐使用方案 B**。

### 方案 A：直接以 `apps/web` 作为 Root Directory（用户当前截图的设置）

在此方案中，Vercel 将 `apps/web` 视为项目的根路径，但仍会自动寻找并构建外部的工作区依赖（如 `packages/db`、`packages/api` 等）。

* **Framework Preset**: `Next.js`
* **Root Directory**: `apps/web`
* **Build Command**: 开启 Override 并填写：
  ```bash
  npx prisma generate --schema=../../packages/db/prisma/schema.prisma && next build
  ```
  *(注：如果根目录已配置 `postinstall` 脚本，此处可以直接留空使用默认的 `next build`)*
* **Output Directory**: 默认值即可 (`.next`)

### 方案 B：以项目根目录作为 Root Directory（Turborepo 官方推荐）

让 Vercel 在根目录下运行，通过 Turborepo 协调各子包的构建和缓存。

* **Framework Preset**: `Next.js`
* **Root Directory**: `.` (留空或填写根目录)
* **Build Command**: 开启 Override 并填写：
  ```bash
  pnpm --filter @portal/web build
  ```
* **Output Directory**: 开启 Override 并填写：
  ```bash
  apps/web/.next
  ```

---

## 步骤 1：配置环境变量

在 Vercel 项目面板中的 **Settings -> Environment Variables** 添加以下环境变量。

### 1. 必填环境变量

| 变量名 | 说明 | 示例值 / 生成方式 |
| :--- | :--- | :--- |
| `DATABASE_URL` | **生产环境 PostgreSQL 数据库连接串**。<br/>不能是 localhost。建议使用 Supabase、Neon 等托管数据库。如果连接池限制较严，可加 `?pgbouncer=true`。 | `postgresql://user:password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `AUTH_SECRET` | Auth.js (Next-Auth) 的加密密钥。 | 在终端中运行 `openssl rand -base64 32` 生成 |
| `AUTH_TRUST_HOST` | 在 Vercel 等 Serverless 平台，Next-Auth 需要信任 Vercel 域名。 | `true` |

### 2. 选填功能环境变量

| 变量名 | 说明 | 示例值 |
| :--- | :--- | :--- |
| `GITHUB_CLIENT_ID` | GitHub OAuth 登录 App Client ID。 | `Ov23...` (在 GitHub Developer Settings 创建) |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth 登录 App Client Secret。 | `8a7d...` |
| `REDIS_URL` | Redis 缓存连接串（如 Upstash Redis）。如果未使用 Redis 缓存，可留空。 | `rediss://default:pwd@shared-redis.upstash.io:6379` |
| `MEILISEARCH_URL` | Meilisearch 搜索服务地址。 | `https://ms-abc.meilisearch.com` |
| `MEILISEARCH_KEY` | Meilisearch Master Key / Search Key。 | `your_meili_production_key` |

---

## 步骤 2：Prisma Client 自动生成

为了确保 Vercel 构建 Next.js 时不报 `PrismaClient` 丢失或 `tag implicitly has any type` 等 TypeScript 编译错误，项目根目录的 `package.json` 中已添加 `postinstall` 钩子：

```json
"scripts": {
  "postinstall": "pnpm db:generate"
}
```

**说明**：
* 每次 Vercel 进行依赖安装 (`pnpm install`) 后，会自动触发 `pnpm db:generate` 来生成 Prisma 客户端类型。
* 因此，你**不需要**修改 Vercel 默认的 Build Command，直接使用 `next build` 即可顺利完成打包。

---

## 步骤 3：数据库迁移（Database Migration）

Vercel 是 Serverless 运行环境，无法在每次部署时自动安全地执行 `prisma migrate dev`。你需要在上线前手动或通过 CI/CD 执行数据库表结构迁移。

### 方法 1：本地执行远程迁移（推荐）

在本地终端中，通过临时环境变量将迁移应用到生产数据库：

```bash
DATABASE_URL="你的生产环境数据库连接串" pnpm db:migrate
```
或者，如果不想生成开发时的 migration 文件，只应用现有迁移：
```bash
DATABASE_URL="你的生产环境数据库连接串" pnpm --filter @portal/db exec prisma migrate deploy
```

### 方法 2：利用 Vercel 部署前置构建（Build Command 前缀）

你可以将 Vercel 的 Build Command 修改为先执行迁移再打包：
```bash
pnpm --filter @portal/db exec prisma migrate deploy && pnpm --filter @portal/web build
```
* 注意：这要求你的生产数据库没有 IP 白名单限制，或者允许 Vercel 构建服务器的 IP 连接。

---

## 步骤 4：初始化管理员数据（Seed）

如果需要在生产数据库导入初始文章分类及基础配置，同样可以利用临时环境变量在本地执行：

```bash
DATABASE_URL="你的生产环境数据库连接串" pnpm db:seed
```

---

## 常见部署排查 (Troubleshooting)

### 1. 编译时报错 `PrismaClient` 找不到 / 类型报错
* **原因**：Prisma Client 还没有被生成。
* **解决**：确保项目根目录的 `package.json` 中已配置 `"postinstall": "pnpm db:generate"` 脚本。Vercel 在依赖安装后会自动调用该钩子生成客户端类型。

### 2. 数据库报错 `npm error Tracker "idealTree" already exists` / Vercel 回退到 npm 安装
* **原因**：当 Vercel 把 **Root Directory** 设为 `apps/web` 时，它会尝试返回上级寻找 lockfile 并在最外层安装依赖。然而，因为 pnpm 锁文件版本和 Vercel 检测机制冲突，Vercel 会顽固地回退到 npm 安装（命令为 `npm install --prefix=../..`），从而因为依赖解析冲突而崩溃。
* **解决**：在 Vercel 项目设置 **Build and Output Settings** 中，开启 **Install Command** 的 **Override**，并手动填入：
  ```bash
  pnpm install --prefix ../..
  ```
  这样能强制 Vercel 使用 pnpm 进行多层级 Workspace 依赖的正确安装。

### 3. Vercel 报错 `Error: No Next.js version detected`
* **原因**：通常是由于前置的依赖安装步骤错误（例如混用了 npm 和 pnpm），导致 `apps/web/node_modules/next` 并没有被正确下载，Vercel 在构建后置检查时无法识别 Next.js 的版本。
* **解决**：
  1. 确认 **Root Directory** 设置为 `apps/web`；
  2. 确认 **Framework Preset** 设置为 `Next.js`；
  3. 按照上面第 2 条的解决方法，强制覆盖 **Install Command** 为 `pnpm install --prefix ../..` 并重新部署。

### 4. 部署时出现 Turborepo 环境变量警告（`missing from turbo.json`）
* **原因**：Vercel 默认开启了 Turborepo 缓存过滤。如果在 Vercel 面板配置了环境变量（如 `DATABASE_URL`），但没有在项目的 `turbo.json` 中进行放行声明，Turborepo 会在编译时过滤掉它们，导致程序拿不到这些变量。
* **解决**：在项目根目录下的 `turbo.json` 中配置 `globalEnv`，将所有用到的环境变量登记进去：
  ```json
  "globalEnv": [
    "DATABASE_URL",
    "AUTH_SECRET",
    "AUTH_TRUST_HOST",
    "GITHUB_CLIENT_ID",
    "GITHUB_CLIENT_SECRET",
    "REDIS_URL",
    "MEILISEARCH_URL",
    "MEILISEARCH_KEY"
  ]
  ```

### 5. 创建 Neon 数据库时是否要选择 Neon Auth？
* **原因**：Neon 提供了一键集成鉴权服务的开关。
* **解决**：**不需要开启**。本项目使用内置的 `Next-Auth (Auth.js)`，用户数据由本地定义的 Prisma Schema 关系表（User/Session等）自行管理。开启 Neon Auth 会导致代码鉴权逻辑冲突。请保持该开关关闭，只需获取普通数据库连接串（`DATABASE_URL`）即可。

### 6. `REDIS_URL` 和 `MEILISEARCH_URL` 环境变量是否可以在 Vercel 留空？
* **解决**：**可以留空**。
  * `REDIS_URL` 属于预留字段，当前项目并无 Redis 强依赖逻辑；
  * `MEILISEARCH_URL` 已在检索路由中加入了 `try...catch` 降级容错机制。如果线上未配置 Meilisearch 服务，搜索会安全地自动降级，不会导致整个部署崩溃。

