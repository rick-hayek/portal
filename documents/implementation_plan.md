# Portal — 实现计划文档

> 技术栈：**方案 A 全栈 TypeScript**（Next.js 16 + tRPC + Prisma + PostgreSQL）
>
> 策略：**MVP 优先** — 初期从数据库到前端实现最小可运行系统，逐步迭代完善。
>
> 📅 最后更新：2026-02-20 (Phase 5 完成)

---

## 阶段总览

| 阶段 | 内容 | 预估 | 状态 | 产出 |
|------|------|------|------|------|
| **Phase 0** | 基础设施 | 3 天 | ✅ 已完成 | Monorepo + Next.js 16 + 5 packages + Docker |
| **Phase 1** | 核心系统 | 10 天 | ✅ 已完成 | 主题引擎(5套) + 布局 + Zod配置 + 模块注册 |
| **Phase 2** | MVP 最小系统 | 14 天 | ✅ 已完成 | DB → API → Blog + About + 留言板 |
| **Phase 3** | 内容增强 | 13 天 | ✅ 已完成 | 搜索 + 认证 + 管理后台基础 |
| **Phase 4** | 展示与管理 | 10 天 | ✅ 已完成 | 作品集 + 统计 + 管理后台完善 |
| **Phase 5** | 扩展模块 | 12 天 | ✅ 已完成 | 简历 + 图库 + 友链 + 工具箱 |
| **Phase 6** | 优化与上线 | 6 天 | ⬜ 待开始 | SEO/i18n/性能 + CI/CD + 部署 |
| **合计** | | **约 68 天** | | |

> **快速上线路径：** Phase 0 → 1 → 2（约 27 天）即可获得一个含博客、留言板的可用站点。

---

## Phase 0：项目初始化（3 天）✅ 已完成

> **完成日期：** 2026-02-13

### 实际产出

- [x] **Monorepo** — pnpm workspace + Turborepo 2.8.7 + Biome 2.3.15 + TypeScript 5.9.3
- [x] **Next.js 应用** — `apps/web`：Next.js 16.1.6 + React 19.2.3 + Tailwind CSS v4 + Turbopack
- [x] **5 个包骨架**：
  - `@portal/shared` — 核心类型定义（SiteModule, ThemeConfig, SiteConfig 等）
  - `@portal/config` — defineConfig() 辅助函数
  - `@portal/theme` — 2 套预设主题（极简白、暗夜黑），剩余 3 套 Phase 1 补充
  - `@portal/db` — 完整 Prisma schema（10 表数据模型），singleton PrismaClient
  - `@portal/api` — tRPC 骨架占位
- [x] **Docker Compose** — PostgreSQL 16 + Redis 7 + MeiliSearch（含 health check）
- [x] **环境配置** — `.env.example`、`.gitignore`（Node.js 版）

### 验收结果

| 检查项 | 结果 |
|--------|------|
| `pnpm dev` | ✅ Next.js 16.1.6 on localhost:3000, ~1.8s ready |
| `pnpm lint` | ✅ 28 files, 0 errors |
| `tsc --noEmit` (all packages) | ✅ 全部通过 |

---

## Phase 1：核心系统（10 天）✅ 已完成

### 1.1 主题引擎（4 天）

**产出：**
- `packages/theme/themes/` — 5 套主题 JSON（极简白、暗夜黑、赛博朋克、自然绿、复古棕）
- `packages/theme/engine/ThemeProvider.tsx` — React Context + CSS 变量注入
- `packages/theme/engine/useTheme.ts` — 切换/读取/持久化 Hook

**核心逻辑：**
1. localStorage 读取用户偏好 → 回退到 `prefers-color-scheme`
2. 主题 Token 注入 `document.documentElement` CSS 变量
3. Tailwind CSS v4 通过 `@theme` 引用这些 CSS 变量

**✅ 验收：** 主题切换器可在 5 套主题间切换，刷新后保持。

### 1.2 布局系统（3 天）

**产出：**
- `Header` — Logo + 导航 + 主题切换器 + 移动端菜单
- `Footer` — 版权 + 社交链接
- `(site)/layout.tsx` — 组装布局

**✅ 验收：** mobile / tablet / desktop 三断点响应式正常。

### 1.3 配置系统与模块加载器（3 天）

**产出：**
- `packages/config/schema.ts` — Zod 站点配置 Schema
- `packages/config/presets/` — 5 套预设组合
- 模块注册中心 — 根据配置动态注册路由和导航

**✅ 验收：** 切换 `site.config.ts` 的 preset 值，导航和路由自动变化。

---

## Phase 2：MVP 最小可运行系统（14 天）✅ 已完成

> **核心目标：** 从数据库 → API → 前端打通完整链路，实现一个真正可用的网站。

### 2.1 数据库与 API 层（4 天）

这是整个系统的基础，必须最先完成。

**步骤：**
1. **Prisma Schema** — 定义全部数据模型（Post, Category, Comment, GuestbookEntry, SiteConfig 等）
2. `prisma migrate dev` — 生成并执行迁移
3. **种子数据** — `prisma/seed.ts` 插入示例文章、分类
4. **tRPC 初始化** — Context（含 Prisma Client、Session）、中间件（auth guard）
5. **基础 Router** — `post.list / post.bySlug / category.list` 等
6. `apps/web/app/api/trpc/[trpc]/route.ts` — tRPC HTTP Handler

**验证方式：**
```bash
# 数据库
pnpm prisma studio  # 可视化数据

# API
curl http://localhost:3000/api/trpc/post.list
# 返回 JSON 数据
```

**✅ 验收：** API 返回正确数据、Prisma Studio 可浏览数据表。

### 2.2 About 关于我模块（2 天）

- 个人介绍区、社交链接列表、技能标签云
- 内容可来自 `site.config.ts` 或 MDX 文件
- 作为第一个渲染页面验证主题系统联动

**✅ 验收：** 切换主题后 About 页样式正确联动。

### 2.3 Blog 博客模块（5 天）

**第一个需要完整前后端交互的模块：**
1. **文章列表页** — 分页、分类/标签筛选、tRPC 查询
2. **文章详情页** — Markdown 渲染（`next-mdx-remote`）+ 目录生成 + 代码高亮（`rehype-highlight`）
3. **评论组件** — 嵌套评论、tRPC Mutation 提交
4. **RSS Feed** — `/api/feed.xml` 自动生成

**✅ 验收：** 可浏览文章列表 → 点击进入详情 → 渲染 Markdown → 发表评论 → RSS 可订阅。

### 2.4 Guestbook 留言板（3 天）

1. 留言表单（昵称 + 内容 + 表情）
2. 留言列表（时间排序、tRPC 查询）
3. 简单反垃圾（前端校验 + 速率限制）

**✅ 验收：** 访客可提交留言并实时显示。

### 🎯 Phase 2 里程碑

> Phase 2 结束后，你将拥有一个**数据库驱动的、可运转的个人网站**：
> - 首页 + About + Blog（含评论）+ 留言板
> - 5 套主题可切换
> - 如果急于上线，此时即可部署

---

## Phase 3：内容增强（13 天）✅ 已完成

### 3.1 Search 全站搜索（3 天）
1. MeiliSearch 索引同步（文章发布自动索引）
2. 搜索 UI — `Cmd+K` 弹出搜索框、即时搜索
3. 高亮匹配词、分页结果

### 3.2 认证与权限（3 天）
1. Auth.js v5 集成（GitHub / Email 登录）
2. `(admin)/layout.tsx` 路由守卫
3. RBAC 中间件 — admin / editor / viewer

### 3.3 管理后台基础（7 天）
**仪表盘（3 天）：**
- 统计卡片（总文章数、总访问量、今日 PV、评论数）
- 访问趋势折线图（30 天）
- 最新评论/留言列表

**内容管理（4 天）：**
- 文章列表表格（搜索、筛选、排序、批量操作）
- Markdown 编辑器（TipTap / Milkdown）
- 草稿 → 预览 → 发布工作流
- 媒体库（上传、浏览）

**✅ 验收：** 管理员登录 → 仪表盘查看数据 → 新建/编辑文章 → 前台看到发布内容。

---

## Phase 4：展示与管理完善（10 天）✅ 已完成

### 4.1 Portfolio 作品集（4 天）
- 项目卡片网格（封面 + 标题 + 技术栈标签）
- 详情页 + 按技术栈筛选
- 管理后台项目 CRUD

### 4.2 Analytics 数据统计（3 天）
- 自研轻量埋点（PageView 记录）
- 管理后台数据分析页（趋势、地域、设备）

### 4.3 管理后台完善（3 天）
- 外观配置（主题预览切换、导航编辑器）
- 模块管理（启用/禁用开关、预设切换）
- 系统设置（站点信息、SEO、备份）

---

## Phase 5：扩展模块（12 天）✅ 已完成

> 这些模块优先级较低，可根据实际需要选择性实现。

### 5.1 Resume 简历（3 天）
- 时间线布局（教育/工作经历）
- 技能图表、PDF 导出

### 5.2 Gallery 图库（4 天）
- 瀑布流、灯箱预览（PhotoSwipe）
- 相册分组、懒加载

### 5.3 Links 友链（2 天）
- 链接卡片网格、分类
- 存活检测（定时任务）

### 5.4 Tools 工具箱（3 天）
- 工具注册接口
- 初始工具：JSON 格式化、Base64、颜色转换

---

## Phase 6：优化与上线（6 天）

### 6.1 SEO / i18n / 性能（3 天）
- `generateMetadata()` 动态 Meta
- Sitemap 自动生成
- `next-intl` 国际化
- Lighthouse 评分 > 90

### 6.2 CI/CD 与部署（3 天）

**GitHub Actions：**
```yaml
steps:
  - pnpm install --frozen-lockfile
  - pnpm typecheck
  - pnpm lint
  - pnpm test        # Vitest
  - pnpm test:e2e    # Playwright
  - pnpm build
```

**生产部署清单：**
- [ ] Vercel 项目连接 GitHub
- [ ] 环境变量配置（DATABASE_URL, REDIS_URL, AUTH_SECRET 等）
- [ ] SSL + 自定义域名
- [ ] 数据库迁移执行
- [ ] 管理员账号初始化
- [ ] Sentry 错误监控
- [ ] 数据库定时备份

---

## 迭代优先级矩阵

```
            高 ← 用户价值 → 低
          ┌─────────────────────┐
  高      │  Blog    Search    │  先做
  ↑       │  About   Auth      │
  实      │  留言板  管理后台   │
  现      ├─────────────────────┤
  难      │  作品集  统计      │  次做
  度      │  工具箱            │
  ↓       ├─────────────────────┤
  低      │  简历    友链      │  后做
          │  图库              │
          └─────────────────────┘
```

---

## 里程碑时间表

| 里程碑 | 交付物 | 累计天数 | 状态 |
|--------|--------|----------|------|
| **M0** 工程就绪 | Monorepo + Next.js 16 + Prisma Schema | 3 | ✅ 已完成 |
| **M1** 核心跑通 | 主题 + 布局 + 模块加载 | 13 | ✅ 已完成 |
| **M2** MVP 上线 🎯 | Blog + About + 留言板（数据库全链路） | 27 | ✅ 已完成 |
| **M3** 内容增强 | 搜索 + 认证 + 管理后台 | 40 | ✅ 已完成 |
| **M4** 展示完善 | 作品集 + 统计 + 管理后台完整 | 50 | ✅ 已完成 |
| **M5** 全模块 | 简历 + 图库 + 友链 + 工具箱 | 62 | ✅ 已完成 |
| **M6** 生产就绪 | SEO/i18n + CI/CD + 部署 | 68 | ⬜ |
