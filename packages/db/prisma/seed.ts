import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database…');

    // Clean existing data
    await prisma.postTag.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.guestbookEntry.deleteMany();
    await prisma.post.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.category.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();

    // ── Admin User ──────────────────────────────────────
    const passwordHash = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.create({
        data: {
            email: 'admin@portal.dev',
            name: 'Rick',
            role: 'admin',
            passwordHash,
        },
    });
    console.log(`  ✓ User: ${admin.name}`);

    // ── Categories ──────────────────────────────────────
    const categories = await Promise.all([
        prisma.category.create({ data: { name: '技术', slug: 'tech' } }),
        prisma.category.create({ data: { name: '生活', slug: 'life' } }),
        prisma.category.create({ data: { name: '随笔', slug: 'essay' } }),
    ]);
    console.log(`  ✓ Categories: ${categories.map((c) => c.name).join(', ')}`);

    // ── Tags ────────────────────────────────────────────
    const tags = await Promise.all([
        prisma.tag.create({ data: { name: 'TypeScript', slug: 'typescript' } }),
        prisma.tag.create({ data: { name: 'React', slug: 'react' } }),
        prisma.tag.create({ data: { name: 'Next.js', slug: 'nextjs' } }),
    ]);
    console.log(`  ✓ Tags: ${tags.map((t) => t.name).join(', ')}`);

    // ── Posts ───────────────────────────────────────────
    const posts = [
        {
            title: '使用 Next.js 16 构建现代 Web 应用',
            slug: 'building-modern-web-apps-with-nextjs-16',
            excerpt: '探索 Next.js 16 的新特性：React 19 支持、改进的缓存策略和 Turbopack。',
            content: `# 使用 Next.js 16 构建现代 Web 应用

Next.js 16 带来了许多激动人心的新特性。让我们一起来探索。

## React 19 支持

Next.js 16 全面支持 React 19，包括 Server Components 和新的 hooks。

\`\`\`tsx
// Server Component — 默认行为
export default async function Page() {
  const data = await fetchData();
  return <div>{data.title}</div>;
}
\`\`\`

## Turbopack 生产就绪

Turbopack 终于进入稳定版本，开发构建速度提升 10 倍。

## 改进的缓存

新的缓存 API 提供了更精细的控制。

> **提示：** 升级到 Next.js 16 只需要运行 \`npx @next/upgrade\`。

---

*感谢阅读！如有疑问欢迎在评论区留言。*`,
            categoryIndex: 0,
            tagIndices: [2],
        },
        {
            title: 'TypeScript 高级类型技巧',
            slug: 'advanced-typescript-type-tricks',
            excerpt: '深入理解 TypeScript 的条件类型、映射类型和模板字面量类型。',
            content: `# TypeScript 高级类型技巧

掌握这些高级类型技巧，让你的 TypeScript 代码更加类型安全。

## 条件类型

\`\`\`typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<"hello">; // true
type B = IsString<42>;      // false
\`\`\`

## 映射类型

\`\`\`typescript
type Optional<T> = {
  [K in keyof T]?: T[K];
};
\`\`\`

## 模板字面量类型

\`\`\`typescript
type EventName = \`on\${"Click" | "Hover" | "Focus"}\`;
// "onClick" | "onHover" | "onFocus"
\`\`\`

这些技巧在构建库和框架时特别有用。`,
            categoryIndex: 0,
            tagIndices: [0],
        },
        {
            title: 'React Server Components 实践指南',
            slug: 'react-server-components-guide',
            excerpt: '从概念到实战，全面掌握 React Server Components。',
            content: `# React Server Components 实践指南

Server Components 改变了我们构建 React 应用的方式。

## 什么是 Server Components？

Server Components 在服务端运行，不会发送到客户端 JavaScript bundle 中。

## 何时使用？

| 场景 | Server Component | Client Component |
|------|:---:|:---:|
| 数据获取 | ✅ | ❌ |
| 使用 hooks | ❌ | ✅ |
| 事件处理 | ❌ | ✅ |
| 访问数据库 | ✅ | ❌ |

## 最佳实践

1. **默认使用 Server Components**
2. 只在需要交互时使用 Client Components
3. 尽量将 Client Component 下推到叶子节点

\`\`\`tsx
// 混合使用的模式
import { ClientCounter } from './Counter';

export default async function Page() {
  const data = await db.query('SELECT * FROM posts');
  return (
    <div>
      <h1>Posts ({data.length})</h1>
      <ClientCounter />
    </div>
  );
}
\`\`\``,
            categoryIndex: 0,
            tagIndices: [1, 2],
        },
        {
            title: '我的开发环境搭建',
            slug: 'my-dev-setup',
            excerpt: '分享我的 macOS 开发环境配置，包括编辑器、终端、工具链。',
            content: `# 我的开发环境搭建

好的工具能大幅提升开发效率。以下是我的配置。

## 编辑器

使用 **VS Code** + 以下扩展：
- ESLint
- Prettier
- GitLens
- Thunder Client

## 终端

- **Warp** — AI 驱动的终端
- **Oh My Zsh** — Zsh 框架
- **Starship** — 跨平台 prompt

## 字体

**JetBrains Mono** — 等宽编程字体，支持 ligatures。

---

*你的开发环境是什么样的？欢迎留言分享！*`,
            categoryIndex: 1,
            tagIndices: [],
        },
        {
            title: '写代码的一些感悟',
            slug: 'thoughts-on-coding',
            excerpt: '编程多年后的一些思考：关于简洁、可读性和工程实践。',
            content: `# 写代码的一些感悟

编程不只是写代码，更是一种思维方式。

## 简洁不等于简单

> "简洁是复杂的终极形式。" — 达·芬奇

好代码不是代码数量最少，而是**意图最清晰**。

## 命名是最难的事

好的命名能替代注释：

\`\`\`typescript
// 差
const d = new Date().getTime() - s;

// 好
const elapsedMs = Date.now() - startTime;
\`\`\`

## 过早优化是万恶之源

先让它**能用**，再让它**好用**，最后才让它**快**。

---

*这些只是个人感悟，欢迎讨论。*`,
            categoryIndex: 2,
            tagIndices: [],
        },
    ];

    for (let i = 0; i < posts.length; i++) {
        const p = posts[i]!;
        const publishDate = new Date();
        publishDate.setDate(publishDate.getDate() - (posts.length - i) * 3);

        const post = await prisma.post.create({
            data: {
                title: p.title,
                slug: p.slug,
                excerpt: p.excerpt,
                content: p.content,
                status: 'published',
                authorId: admin.id,
                categoryId: categories[p.categoryIndex]!.id,
                publishedAt: publishDate,
                tags: {
                    create: p.tagIndices.map((ti) => ({
                        tagId: tags[ti]!.id,
                    })),
                },
            },
        });
        console.log(`  ✓ Post: ${post.title}`);
    }

    // ── Comments ──────────────────────────────────────
    const firstPost = await prisma.post.findFirst({ orderBy: { publishedAt: 'asc' } });
    if (firstPost) {
        const comment1 = await prisma.comment.create({
            data: {
                postId: firstPost.id,
                authorName: '访客小明',
                content: '写得很好！Next.js 16 确实带来了很多改进。',
                status: 'approved',
            },
        });
        await prisma.comment.create({
            data: {
                postId: firstPost.id,
                authorName: 'Rick',
                content: '谢谢！有什么具体想了解的可以继续讨论。',
                status: 'approved',
                parentId: comment1.id,
            },
        });
        console.log('  ✓ Comments: 2 (with nested reply)');
    }

    // ── Guestbook Entries ─────────────────────────────
    await prisma.guestbookEntry.createMany({
        data: [
            { authorName: '张三', content: '很棒的网站！设计很漂亮 🎨' },
            { authorName: 'Alice', content: 'Love the theme switcher! Great work 👏' },
        ],
    });
    console.log('  ✓ Guestbook entries: 2');

    console.log('\n✅ Seed complete!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
