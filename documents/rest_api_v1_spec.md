# Portal REST API v1 规范文档 (Specification)

本文档详细描述了 Portal 系统的 REST API v1 接口规范，主要用于外部工具（如 MCP Server、自动化脚本文档发布、三方系统集成）对博客文章和分类进行 CRUD 管理。

---

## 1. 基础信息 (General Information)

- **Base URL**: `/api/v1`
- **数据传输格式**: JSON (`Content-Type: application/json`)
- **字符编码**: UTF-8

---

## 2. 身份验证 (Authentication)

公共只读接口（如获取公开文章列表、所有分类列表）无需鉴权。  
涉及写操作（创建、更新、删除）以及查看草稿状态接口必须提供管理员密钥。

### 鉴权方式
支持通过 **HTTP Header** 传入 API Key：

1. **Header 方式一（推荐）**:
   ```http
   x-api-key: <YOUR_ADMIN_API_KEY>
   ```
2. **Header 方式二（Bearer Token）**:
   ```http
   Authorization: Bearer <YOUR_ADMIN_API_KEY>
   ```

> ℹ️ **说明**：API Key 对应服务器环境变量中的 `ADMIN_API_KEY`。校验通过后，系统将自动映射为数据库中 `role = 'admin'` 的管理员身份执行操作。

---

## 3. 错误处理与响应格式 (Error Handling)

### 成功响应
包含 HTTP 状态码 `200` 或 `201`。
```json
{
  "success": true,
  "data": { ... }
}
```

### 错误响应
根据不同错误返回相应 HTTP 状态码及 JSON 提示：
```json
{
  "error": "错误描述信息"
}
```

| HTTP 状态码 | 含义 | 常见场景 |
| :--- | :--- | :--- |
| `400 Bad Request` | 请求参数缺失或无效 | 缺少必填字段（如 title/slug/content）或参数格式错误 |
| `401 Unauthorized` | 未授权 / 鉴权失败 | 缺少或错误的 API Key |
| `404 Not Found` | 资源不存在 | 文章或分类 ID/slug 不存在，或试图未授权查看草稿 |
| `500 Internal Server Error` | 服务器内部错误 | 数据库异常或系统未捕获异常 |

---

## 4. 接口列表 (API Endpoints)

### 4.1 文章管理 (Posts API)

#### 1. 获取文章列表
- **请求方式**: `GET /api/v1/posts`
- **鉴权**: 否（除非请求 `status=draft`）
- **Query 参数**:

| 参数 | 类型 | 必填 | 默认值 | 描述 |
| :--- | :--- | :--- | :--- | :--- |
| `page` | `number` | 否 | `1` | 当前页码 |
| `limit` | `number` | 否 | `10` | 每页数量 |
| `categorySlug` | `string` | 否 | - | 按分类 Slug 过滤 |
| `tagSlug` | `string` | 否 | - | 按标签 Slug 过滤 |
| `status` | `string` | 否 | `published` | 文章状态：`published`（公开）或 `draft`（草稿，需要鉴权） |

- **响应示例 (200 OK)**:
```json
{
  "posts": [
    {
      "id": "cly123456000008l28z3z...",
      "title": "示例文章标题",
      "slug": "sample-post-slug",
      "excerpt": "文章摘要",
      "status": "published",
      "publishedAt": "2026-08-06T10:00:00.000Z",
      "createdAt": "2026-08-06T10:00:00.000Z",
      "category": {
        "id": "cat_tech_id",
        "name": "技术",
        "name_en": "Tech",
        "slug": "tech"
      },
      "author": {
        "id": "user_admin_id",
        "name": "Rick",
        "image": null
      },
      "tags": [
        {
          "tag": {
            "id": "tag_nextjs_id",
            "name": "Next.js",
            "slug": "nextjs"
          }
        }
      ]
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

#### 2. 创建新文章
- **请求方式**: `POST /api/v1/posts`
- **鉴权**: **必须**
- **请求 Body (JSON)**:

| 字段 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| `title` | `string` | **是** | 文章标题 |
| `slug` | `string` | **是** | URL 唯一缩略名 (Slug) |
| `content` | `string` | **是** | Markdown 格式的正文内容 |
| `excerpt` | `string` | 否 | 文章摘要 |
| `status` | `string` | 否 | 状态：`draft` (默认) 或 `published` |
| `category` | `string` | 否 | 分类标示。支持匹配分类名称（如`"技术"`）、英文名（如`"Tech"`）、Slug（如`"tech"`）或分类 ID。若不存在则置空 |
| `tagIds` | `string[]` | 否 | 标签 ID 数组 |

- **请求示例**:
```json
{
  "title": "使用 MCP 自动发布博客文章",
  "slug": "auto-publish-with-mcp",
  "content": "# 标题\n\n这是使用 MCP 自动发布的文章正文...",
  "status": "published",
  "category": "技术"
}
```

- **响应示例 (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": "cmrk2w4e9000846akgxgx...",
    "title": "使用 MCP 自动发布博客文章",
    "slug": "auto-publish-with-mcp",
    "status": "published",
    "categoryId": "cat_tech_id",
    "createdAt": "2026-08-06T11:00:00.000Z"
  }
}
```

---

#### 3. 获取单篇文章详情
- **请求方式**: `GET /api/v1/posts/{id}`
- **说明**: `{id}` 参数既支持数据库 `id`（如 `cly...`），也支持文章 `slug`。
- **鉴权**: 否（若文章为 `draft` 草稿状态，则要求管理员鉴权；未鉴权返回 `404`）
- **响应示例 (200 OK)**:
```json
{
  "id": "cmrk2w4e9000846akgxgx...",
  "title": "使用 MCP 自动发布博客文章",
  "slug": "auto-publish-with-mcp",
  "content": "# 标题\n\n正文内容...",
  "excerpt": null,
  "status": "published",
  "publishedAt": "2026-08-06T11:00:00.000Z",
  "category": {
    "id": "cat_tech_id",
    "name": "技术",
    "slug": "tech"
  },
  "author": {
    "id": "user_admin_id",
    "name": "Rick"
  },
  "tags": []
}
```

---

#### 4. 更新文章
- **请求方式**: `PUT /api/v1/posts/{id}`
- **说明**: `{id}` 参数支持 `id` 或 `slug`。
- **鉴权**: **必须**
- **请求 Body (JSON)** (均可选):

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `title` | `string` | 新标题 |
| `slug` | `string` | 新 URL Slug |
| `content` | `string` | 新 Markdown 正文 |
| `excerpt` | `string \| null` | 新摘要（传 null 可清空） |
| `status` | `string` | `draft` 或 `published` |
| `categoryId` | `string \| null` | 分类 ID（传 null 可解绑分类） |
| `tagIds` | `string[]` | 覆盖标签 ID 列表 |

- **响应示例 (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "cmrk2w4e9000846akgxgx...",
    "title": "更新后的标题",
    "updatedAt": "2026-08-06T12:00:00.000Z"
  }
}
```

---

#### 5. 删除文章
- **请求方式**: `DELETE /api/v1/posts/{id}`
- **说明**: `{id}` 参数支持 `id` 或 `slug`。
- **鉴权**: **必须**
- **响应示例 (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "cmrk2w4e9000846akgxgx...",
    "title": "被删除的文章标题"
  }
}
```

---

### 4.2 分类管理 (Categories API)

#### 1. 获取所有分类列表
- **请求方式**: `GET /api/v1/categories`
- **鉴权**: 否
- **响应示例 (200 OK)**:
```json
[
  {
    "id": "cat_tech_id",
    "name": "技术",
    "name_en": "Tech",
    "slug": "tech",
    "_count": {
      "posts": 12
    }
  },
  {
    "id": "cat_life_id",
    "name": "生活",
    "name_en": "Life",
    "slug": "life",
    "_count": {
      "posts": 5
    }
  }
]
```

---

#### 2. 创建新分类
- **请求方式**: `POST /api/v1/categories`
- **鉴权**: **必须**
- **请求 Body (JSON)**:

| 字段 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **是** | 分类显示名称（如："技术"） |
| `slug` | `string` | **是** | URL 缩略名（如："tech"） |
| `name_en` | `string` | 否 | 英文显示名称（如："Tech"） |

- **响应示例 (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": "cat_new_id",
    "name": "阅读",
    "name_en": "Reading",
    "slug": "reading",
    "createdAt": "2026-08-06T12:00:00.000Z"
  }
}
```

---

#### 3. 更新分类
- **请求方式**: `PUT /api/v1/categories/{id}`
- **说明**: `{id}` 参数支持 `id` 或 `slug`。
- **鉴权**: **必须**
- **请求 Body (JSON)** (均可选):

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `name` | `string` | 新分类名称 |
| `name_en` | `string` | 新英文分类名称 |
| `slug` | `string` | 新分类 Slug |

- **响应示例 (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "cat_tech_id",
    "name": "技术与架构",
    "name_en": "Tech & Architecture",
    "slug": "tech"
  }
}
```

---

#### 4. 删除分类
- **请求方式**: `DELETE /api/v1/categories/{id}`
- **说明**: `{id}` 参数支持 `id` 或 `slug`。
- **鉴权**: **必须**
- **响应示例 (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "cat_new_id",
    "name": "阅读",
    "slug": "reading"
  }
}
```

---

### 4.3 文件与图片上传 (Upload / Attachments API)

#### 1. 上传文件/图片
- **请求方式**: `POST /api/v1/upload`
- **鉴权**: **必须**
- **支持的数据格式**:
  - `multipart/form-data`（标准文件上传，推荐）
  - `application/json`（Base64 字符串上传）

##### 请求格式 A: `multipart/form-data`
使用标准表单上传二进制图片文件：

| Form 字段 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| `file` | `File` | **是** | 要上传的文件/图片（如 `voocii-avatar-localhost.svg`） |

- **cURL 示例**:
```bash
curl -X POST "http://localhost:3000/api/v1/upload" \
  -H "x-api-key: YOUR_ADMIN_API_KEY" \
  -F "file=@/path/to/voocii-avatar-localhost.svg"
```

##### 请求格式 B: `application/json` (Base64)
直接传输 Base64 编码的图片数据：

| 字段 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| `filename` | `string` | **是** | 文件名（如 `voocii-avatar-localhost.svg`） |
| `fileData` | `string` | **是** | 文件 Base64 编码数据字符串 |
| `mimeType` | `string` | 否 | MIME 类型（如 `image/svg+xml` 或 `image/png`） |

- **请求 Body (JSON) 示例**:
```json
{
  "filename": "voocii-avatar-localhost.svg",
  "mimeType": "image/svg+xml",
  "fileData": "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg=="
}
```

- **响应示例 (201 Created)**:
成功后返回上传附件元数据及访问 URL 地址：
```json
{
  "success": true,
  "data": {
    "id": "cmrk2w4e9000846akgxgx...",
    "filename": "voocii-avatar-localhost.svg",
    "mimeType": "image/svg+xml",
    "url": "https://pub-r2.dev/voocii-avatar-localhost.svg",
    "createdAt": "2026-08-07T12:30:00.000Z"
  }
}
```

---

## 5. MCP (Model Context Protocol) 集成最佳实践

在使用 Codex 或 Claude 接入 Portal REST API 时，可以通过定义工具（Tool）让 AI Agent 自动化发布和管理文章。

### 示例 MCP Tool Schema 定义 (TypeScript / Zod)

```ts
import { z } from 'zod';

export const publishPostTool = {
  name: 'publish_post',
  description: 'Publish a new blog post to Portal.',
  inputSchema: z.object({
    title: z.string().describe('The title of the blog post'),
    slug: z.string().describe('URL slug for the post, e.g. "my-first-post"'),
    content: z.string().min(3).describe('The Markdown content of the blog post.'),
    excerpt: z.string().optional().describe('Short summary of the post'),
    status: z.enum(['draft', 'published']).default('draft').describe('Publication status'),
    category: z.string().optional().describe(
      'Blog post category / 文章分类. Accepts name (e.g. "技术"), English name, slug ("tech"), or category ID.'
    ),
  }),
};

export const uploadImageTool = {
  name: 'upload_image',
  description: 'Upload an image or attachment file to Portal and receive its public URL.',
  inputSchema: z.object({
    filename: z.string().describe('Filename, e.g. "voocii-avatar-localhost.svg" or "photo.png"'),
    fileData: z.string().describe('Base64-encoded string of the file content'),
    mimeType: z.string().optional().describe('MIME type of the file, e.g. "image/svg+xml" or "image/png"'),
  }),
};
```

---

## 6. 版本变更与维护

如有版本变更或新增 API 路由，请同步更新本文档。
文件位置: `documents/rest_api_v1_spec.md`
