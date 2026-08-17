# Microsoft Bing Search 接入与 IndexNow 配置指南 (voocii.com)

本指南总结了 **Portal (voocii.com)** 接入 **Microsoft Bing Webmaster Tools** 搜索引擎收录、**IndexNow 极速收录** 以及 **SEO 最佳实践（H1 标题与 SSR 规范）** 的完整步骤与基础设施配置。

---

## 目录
1. [项目基础设施一览](#1-项目基础设施一览)
2. [Bing Webmaster Tools 配置步骤](#2-bing-webmaster-tools-配置步骤)
   - [第一步：站点添加与域名所有权验证](#第一步站点添加与域名所有权验证)
   - [第二步：提交 Sitemap 站点地图](#第二步提交-sitemap-站点地图)
   - [第三步：激活 IndexNow 极速/秒级收录](#第三步激活-indexnow-极速秒级收录)
3. [IndexNow API 使用说明与 URL 推送示例](#3-indexnow-api-使用说明与-url-推送示例)
4. [SEO 最佳实践与 H1 标签规范](#4-seo-最佳实践与-h1-标签规范)

---

## 1. 项目基础设施一览

网站已在 Next.js App Router 架构中内置并部署上线了所有搜索引擎所需的标准接口与验证文件：

| 配置项 | 验证/服务 URL | 代码文件路径 | 状态 | 说明 |
| :--- | :--- | :--- | :---: | :--- |
| **Bing 所有权验证** | `https://voocii.com/BingSiteAuth.xml` | [`apps/web/public/BingSiteAuth.xml`](file:///Users/rick/src/portal/apps/web/public/BingSiteAuth.xml) | ✅ 已上线 | 包含 Bing 专属 XML 验证 Key |
| **IndexNow Key 秘钥** | `https://voocii.com/823a2b3835ea4e889a2f4b7a8c6b3f2d.txt` | [`apps/web/public/823a2b3835ea4e889a2f4b7a8c6b3f2d.txt`](file:///Users/rick/src/portal/apps/web/public/823a2b3835ea4e889a2f4b7a8c6b3f2d.txt) | ✅ 已上线 | IndexNow 协议自动校验秘钥 |
| **Sitemap 站点地图** | `https://voocii.com/sitemap.xml` | [`apps/web/src/app/sitemap.ts`](file:///Users/rick/src/portal/apps/web/src/app/sitemap.ts) | ✅ 已上线 | 动态包含中英文全站静态与博客/书籍/作品页面 |
| **Robots.txt** | `https://voocii.com/robots.txt` | [`apps/web/src/app/robots.ts`](file:///Users/rick/src/portal/apps/web/src/app/robots.ts) | ✅ 已上线 | 指引 Bingbot 爬取 Sitemap，屏蔽 admin/api 路由 |

---

## 2. Bing Webmaster Tools 配置步骤

### 第一步：站点添加与域名所有权验证
访问 [Bing Webmaster Tools](https://www.bing.com/webmasters)，登录账号并添加域名 `voocii.com`：

- **推荐方式 A（最快捷 - Google Search Console 一键同步）**：
  若域名已绑定 Google Search Console，直接选择 **"从 GSC 导入"**，无需任何代码操作。
- **推荐方式 B（使用现有的 XML 验证文件）**：
  选择 **XML 文件验证** 方式，Bingbot 会自动校验 `https://voocii.com/BingSiteAuth.xml`，点击 **Verify（验证）** 即可通过。

### 第二步：提交 Sitemap 站点地图
1. 登录 Bing Webmaster 控制台，在左侧导航栏点击 **Sitemaps（站点地图）**。
2. 点击右上角 **Submit sitemap** 按钮。
3. 输入 Sitemap 完整地址：`https://voocii.com/sitemap.xml`。
4. 提交后 Bingbot 会自动轮询抓取网站所有中英文网页。

### 第三步：激活 IndexNow 极速/秒级收录
IndexNow 是微软 Bing、Yandex 等联合推出的**实时收录协议**。

> 💡 **原理说明**：
> IndexNow 协议采用无状态设计，**在 Webmaster 界面无需点击任何 Verify 按钮**。当你（或系统）发送第一次 HTTP POST/GET 请求推送 URL 时，Bing 服务器会在同一秒内自动抓取 `https://voocii.com/823a2b3835ea4e889a2f4b7a8c6b3f2d.txt` 完成身份校验并返回 `200/202 OK`。

---

## 3. IndexNow API 使用说明与 URL 推送示例

### 手动 API 推送 (cURL / Terminal)
发布新博客文章或重要更新后，可以在终端直接运行以下 cURL 命令向 Bing 实时推送 URL：

```bash
curl -i -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{
    "host": "voocii.com",
    "key": "823a2b3835ea4e889a2f4b7a8c6b3f2d",
    "keyLocation": "https://voocii.com/823a2b3835ea4e889a2f4b7a8c6b3f2d.txt",
    "urlList": [
      "https://voocii.com/zh/blog/your-new-post",
      "https://voocii.com/en/blog/your-new-post"
    ]
  }'
```

**响应码说明**：
- `200` / `202`：提交成功，Bing 已接收并加入极速抓取队列。
- `400`：请求 JSON 格式错误。
- `403`：Key 校验失败（无法找到 txt 文件或 key 不匹配）。

---

## 4. SEO 最佳实践与 H1 标签规范

Bing 搜索引擎会对网站进行 SEO 健康度审计，要求每个页面必须具备**单一且语义清晰的 `<h1>` 标签**。

### 已修复的 H1 缺失隐患
1. **书籍详情页 (`/books/[slug]`)**：
   - 原先采用纯 Client 侧加载，SSR 初始输出 HTML 为菊花 Loading，导致 Bingbot 无法拿到 `<h1>`。
   - **已修复**：重构 [`books/[slug]/page.tsx`](file:///Users/rick/src/portal/apps/web/src/app/[locale]/(site)/books/[slug]/page.tsx) 在服务端预检索数据并渲染，确保 SSR 初始 HTML 直接包含 `<h1 className="text-3xl ...">{book.title}</h1>`。
2. **博客列表与分类页 (`/blog`, `/blog?category=...`)**：
   - 原先 `<Suspense>` 骨架屏只有灰色占位块。
   - **已修复**：优化 [`blog/page.tsx`](file:///Users/rick/src/portal/apps/web/src/app/[locale]/(site)/blog/page.tsx)，在 SSR 骨架和首屏中输出语义化标题 `<h1 className="text-[var(--portal-color-text)]">{displayTitle}</h1>`。

---

> 指南维护于 2026 年 8 月。
