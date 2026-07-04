export type * from '@prisma/client';
export { PrismaClient } from '@prisma/client';

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  cfPrismaCache: Map<string, PrismaClient> | undefined;
};

if (!globalForPrisma.cfPrismaCache) {
  globalForPrisma.cfPrismaCache = new Map<string, PrismaClient>();
}

// 尝试引入 @opennextjs/cloudflare 获取上下文
let getCloudflareContext: (() => any) | undefined;
try {
  const openNextCf = await import('@opennextjs/cloudflare');
  getCloudflareContext = openNextCf.getCloudflareContext;
} catch (e) {
  // 忽略，非 Cloudflare 部署环境可能未安装或无需加载
}

/**
 * 动态获取当前运行环境的最优 Prisma 实例：
 * - Cloudflare Workers/Pages: 从上下文动态检测 Hyperdrive，若有则使用 PrismaPg 适配器连接池。
 * - Vercel / Node.js / 本地开发: 使用默认的原生 TCP 直连。
 */
function getActivePrisma(): PrismaClient {
  // 1. 如果在 Cloudflare 环境，尝试读取 Hyperdrive 绑定
  if (getCloudflareContext) {
    try {
      const context = getCloudflareContext();
      const connectionString = context?.env?.HYPERDRIVE?.connectionString;
      if (connectionString) {
        let client = globalForPrisma.cfPrismaCache!.get(connectionString);
        if (!client) {
          const pool = new Pool({ connectionString });
          const adapter = new PrismaPg(pool);
          client = new PrismaClient({ adapter });
          globalForPrisma.cfPrismaCache!.set(connectionString, client);
        }
        return client;
      }
    } catch (e) {
      // getCloudflareContext 在构建阶段或非请求生命周期中调用会抛错，直接吞掉回退
    }
  }

  // 2. 传统 Node.js 或本地开发，使用原生 TCP 连接（带全局缓存）
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client;
  }

  return client;
}

// 导出透明代理：让所有的 `import { prisma } from '@portal/db'` 自动适应当前环境，无需修改业务代码
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    const activeClient = getActivePrisma();
    const value = Reflect.get(activeClient, prop);
    if (typeof value === 'function') {
      return value.bind(activeClient);
    }
    return value;
  },
  set(target, prop, value) {
    const activeClient = getActivePrisma();
    return Reflect.set(activeClient, prop, value);
  }
});
