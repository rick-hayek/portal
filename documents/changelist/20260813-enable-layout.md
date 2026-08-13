# 首页静态布局配置化与 Tessellate Noir (Metro Grid) 布局实现方案

为 Portal 首页引入基于 `site.config.ts` 的静态布局配置机制（Build-time / Config-driven Layout Selection），并实现第二套全新的首页布局：**Tessellate Noir (Metro Grid 网格布局)**。

---

## User Review Required

> [!IMPORTANT]
> **配置与架构升级说明**：
> 1. 本次升级将在 `siteConfig` 中引入 `homeLayout` 配置选项（可选值为 `'classic'` | `'metro'`），默认值为 `'classic'`。
> 2. 布局选型在服务端编译/渲染阶段决定（纯 RSC 模式），零客户端水合负担，零样式闪烁（CLS = 0）。
> 3. `MetroGrid` 布局将采用 `designs/stitch_metro_grid_personal_blog/DESIGN.md` 中定义的 **Tessellate Noir** 风格规范（高对比度色块、严苛 12 栏 Masonry 网格、硬朗 0px 边角、无阴影纯平设计）。

---

## Open Questions

> [!NOTE]
> 目前暂无阻塞性问题。未来若需要为访客开放前端交互切换按钮，现有组件拆分方案可 100% 平滑升级包装 `LayoutProvider`。

---

## Proposed Changes

### 1. 配置 Schema 与类型定义 (`@portal/shared` & `@portal/config`)

扩展 `SiteConfig` 类型与 Zod 校验 Schema，使其支持 `homeLayout` 字段。

---

#### [MODIFY] [types.ts](file:///Users/rick/src/portal/packages/shared/src/types.ts)
- 在 `SiteConfig` 接口中添加 `homeLayout?: 'classic' | 'metro';` 定义。

#### [MODIFY] [schema.ts](file:///Users/rick/src/portal/packages/config/src/schema.ts)
- 在 `siteConfigSchema` 中扩展 `homeLayout: z.enum(['classic', 'metro']).default('classic')`。

#### [MODIFY] [site.config.ts](file:///Users/rick/src/portal/apps/web/src/site.config.ts)
- 在配置文件中显式或隐式支持 `homeLayout` 配置项（默认为 `'classic'`，可改为 `'metro'` 开启新布局）。

---

### 2. 首页布局解耦与 Metro Grid 实现 (`apps/web`)

将原 [page.tsx](file:///Users/rick/src/portal/apps/web/src/app/%5Blocale%5D/%28site%29/page.tsx) 中的展示逻辑重构解耦为两套独立且纯粹的服务端布局组件，并共享数据类型与通用子卡片。

---

#### [NEW] [ClassicLayout.tsx](file:///Users/rick/src/portal/apps/web/src/components/home/layouts/ClassicLayout.tsx)
- 提取现有 [page.tsx](file:///Users/rick/src/portal/apps/web/src/app/%5Blocale%5D/%28site%29/page.tsx) 中的完整 Hero 独立流式布局与区块结构，保证现有默认外观完全一致。

#### [NEW] [MetroLayout.tsx](file:///Users/rick/src/portal/apps/web/src/components/home/layouts/MetroLayout.tsx)
- 实现全新的 **Tessellate Noir (Metro Grid)** 布局：
  - **12 Column Tile System**：将作者简介、最新文章、精选项目、图书与留言板有机整合进严密的 12 栏网格中。
  - **Metro Visual Tiles**：黑黄/青/珊瑚高饱色彩交替的 Tile 视觉块、大号 Montserrat / Inter 粗体字。
  - **Hard Edges & Zero Depth**：严格遵守 `DESIGN.md` 规范（0px border-radius，无任何 drop-shadow）。

#### [MODIFY] [page.tsx](file:///Users/rick/src/portal/apps/web/src/app/%5Blocale%5D/%28site%29/page.tsx)
- [page.tsx](file:///Users/rick/src/portal/apps/web/src/app/%5Blocale%5D/%28site%29/page.tsx) 保持为轻量级 Async Server Component，专门负责数据获取（tRPC / Prisma / i18n）。
- 获取数据后，根据 `siteConfig.homeLayout` 分发渲染 `<MetroLayout ... />` 或 `<ClassicLayout ... />`。

---

## Verification Plan

### Automated Tests
- 运行工程 TypeScript 类型检查与 Lint 检查：
  ```bash
  pnpm build
  ```
  （或者在其各自 package 目录下运行 `pnpm check-types` / `pnpm lint`）

### Manual Verification
1. 在 `site.config.ts` 中设置 `homeLayout: 'classic'`，启动开发服务器，验证首页呈现原有排版，无破坏性影响。
2. 在 `site.config.ts` 中设置 `homeLayout: 'metro'`，验证首页瞬间切换为全新的 Tessellate Noir (Metro Grid) 极简网格布局。
3. 检查响应式排版（Desktop 12 栏、Tablet 6 栏、Mobile 2 栏）及暗黑/高对比度色彩适配。
