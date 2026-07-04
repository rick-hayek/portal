# PageView 数据表空间与性能评估报告

本报告针对 [schema.prisma](file:///Users/rick/src/portal/packages/db/prisma/schema.prisma#L183-L193) 中定义的 `PageView` 分析统计表进行定量空间计算，并评估在高并发/大数据量下对系统整体性能的潜在影响，最后提供最佳实践优化方案。

---

## 1. 空间占用评估 (Storage Calculation)

`PageView` 的表结构定义如下：
```prisma
model PageView {
  id        String   @id @default(cuid())
  path      String
  referrer  String?
  userAgent String?
  country   String?
  createdAt DateTime @default(now())

  @@index([path])
  @@index([createdAt])
}
```

### 单条记录大小估算 (PostgreSQL 引擎)

| 数据字段 | 数据类型 | 估算平均占用空间 (Bytes) | 备注 |
| :--- | :--- | :--- | :--- |
| `id` | CUID (Text) | ~30 B | 字符串 cuid 长度一般在 25-30 字符左右。 |
| `path` | Text | ~40 B | 页面路径（如 `/zh/blog/websocket-explainer`）。 |
| `referrer` | Text (Nullable) | ~30 B | 来源网址（部分为 Null，部分包含长 URL，均值约 30B）。 |
| `userAgent` | Text (Nullable) | ~150 B | 浏览器 UA 字符串非常长，通常在 120B 到 200B 之间。 |
| `country` | Text (Nullable) | ~4 B | 地理国别码（一般为 2 字符）。 |
| `createdAt` | Timestamp | 8 B | PostgreSQL 的时区时间戳固定占用 8 字节。 |
| **行头部与对齐开销** | tuple header | ~32 B | 包含行指针、NULL 值标志位及 8 字节内存对齐填充。 |
| **单行数据小计 (Data)** | | **约 294 B** | 粗略取整为 **300 字节 / 条**。 |

### 索引空间开销 (Indexes)
表中定义了 3 个 B-Tree 索引（主键、path 索引、createdAt 索引）：
* **主键索引 (`id`)**：每个条目约 `30B (id) + 8B (指向物理行的指针) + 12B (B-Tree 节点开销) = 50 字节`。
* **Path 索引 (`path`)**：每个条目约 `40B (path) + 8B + 12B = 60 字节`。
* **时间戳索引 (`createdAt`)**：每个条目约 `8B (createdAt) + 8B + 12B = 28 字节`。
* **单行索引小计 (Index)**：**约 138 字节 / 条**。

### 综合总计
每产生一次页面访问，数据库需要写入：
$$\text{单次访问空间} = 300\text{ 字节 (数据)} + 138\text{ 字节 (索引)} \approx 438\text{ 字节 (约 0.44 KB)}$$

### 不同访问量下的数据库体积预测与比重

| 访问量 (Page Views) | 占用数据库体积 (Data + Index) | 占系统总库大小的比重 (假设网站文章数约 100 篇) |
| :--- | :--- | :--- |
| **10,000** | 约 4.4 MB | ~40% (博客基本表数据约 6MB) |
| **100,000** | 约 44 MB | ~88% (分析数据开始主导数据库) |
| **1,000,000 (100万)** | 约 440 MB (0.44 GB) | **~98.6%** (博客内容数据仅占不到 1.4%) |
| **10,000,000 (1000万)** | 约 4.4 GB | **~99.8%** |

> [!IMPORTANT]
> **结论一**：该表在访问量放大后会呈现**爆发式膨胀**。由于博客本身的业务数据（文章、分类、配置）体积是基本恒定且极小的（100 篇文章通常不到 10MB），**网站一旦拥有持续活跃的流量，`PageView` 表将迅速吞噬 95% 以上的数据库磁盘空间。**

---

## 2. 访问量大后对网站性能的影响

当 `PageView` 积累到百万级或千万级时，会对整个网站的性能产生深远影响：

### ① 写入瓶颈与数据库连接池耗尽
* 任何用户打开任何网页，前端都会发起一次写入 `PageView` 表的请求。这是一个**强同步/高频写**操作。
* 在突发流量（如文章被大量转发）时，大量的并发 `INSERT` 会瞬间占满数据库的**连接池**，导致主业务逻辑（如读取文章、加载评论）因为拿不到数据库连接而报错超时。
* B-Tree 索引每次写入时都需要重平衡和分裂页面，会导致频繁的磁盘写入（Write IOPS 暴增）。

### ② 内存抖动与缓存失效 (Buffer Cache Pollution)
* 关系型数据库（如 PostgreSQL）会将热数据和索引缓存在内存（RAM）中。
* 随着 `PageView` 的索引变得越来越巨大，如果索引的尺寸超过了数据库被分配的物理内存大小，数据库将不得不频繁将索引从内存换出到磁盘（Page Fault）。
* 这将极大地**拖慢所有的查询**——不仅是统计查询变慢，由于内存缓存被 `PageView` 索引占满，就连用户正常访问博客首页、文章页等核心业务的 SQL 查询也会被拖慢数倍。

### ③ 后台统计报表查询灾难
* 管理后台通常需要对 `PageView` 进行 `COUNT(*)`，或者 `GROUP BY path` 进行排序来计算热门文章。
* 在千万级的数据集上，即使有索引，这些统计查询也会变成**慢查询**，极其消耗 CPU 和磁盘 I/O。

---

## 3. 最佳实践与应对策略 (Mitigation Strategies)

如果网站的日均流量开始爬升，直接在 OLTP（关系型事务数据库）中直接记录原始访问日志是众所周知的反模式。建议采用以下手段进行优化：

### 方案 A：异步批量写入与数据归档（中短期，低成本）
1. **内存缓冲异步写入**：
   不直接每访问一次就执行 `prisma.pageView.create()`。可以用 Redis 或者 Node.js 进程内内存作为缓冲区，累积 100 条记录或每隔 10 秒钟，使用 `createMany` 一次性**批量写入**数据库，这样可以将数据库的 IOPS 开销降低 99%。
2. **数据保留策略 (Data Retention Policy)**：
   仅在 `PageView` 中保留最近 30 天或 90 天的原始访问记录。
3. **统计数据预聚合 (Pre-aggregation)**：
   新建一张每日统计表 `DailyStats (date, path, viewCount)`。每天凌晨运行一个定时任务，把 90 天前的原始 `PageView` 数据聚合为每天的阅读数累加进 `DailyStats`（一条数据就能代替数万条原始记录），然后把 90 天前的 `PageView` 原始行物理删除（`DELETE`）。

### 方案 B：剥离分析业务，采用专业的统计引擎（长期，彻底根治）
1. **使用开源免费的自建统计系统**：
   引入 **Umami** 或 **Plausible**。它们是轻量级的专业网站统计工具，具有极佳的隐私保护和超高的数据压缩率，且不占用主数据库的任何资源。
2. **使用第三方托管系统**：
   直接集成 **Google Analytics (GA4)**。开发成本为零，无需消耗自身的服务器资源与带宽。
