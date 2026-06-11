import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getTRPCServer } from '@/lib/trpc-server';
import { prisma } from '@portal/db';
import Image from 'next/image';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Index' });
  const tGuestbook = await getTranslations({ locale, namespace: 'Guestbook' });

  const trpc = await getTRPCServer();

  // Fetch real data from DB via tRPC direct caller and Prisma
  const postsData = await trpc.post.list({ page: 1, limit: 3, status: 'published' });
  const posts = postsData.posts;

  const projects = await trpc.portfolio.list({ featured: true });

  const guestbookData = await trpc.guestbook.list({ page: 1, limit: 4 });
  const guestbookEntries = guestbookData.entries;

  const [postCount, projectCount, viewCount, guestbookCount] = await Promise.all([
    prisma.post.count({ where: { status: 'published' } }),
    prisma.project.count(),
    prisma.pageView.count(),
    prisma.guestbookEntry.count(),
  ]);

  return (
    <div className="flex w-full flex-col">
      {/* HERO SECTION */}
      <section className="flex min-h-screen w-full items-center justify-center pt-32 pb-16 px-8">
        <div className="mx-auto w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Hero Text */}
          <div>
            {/* Badge */}
            <div
              className="mb-8 inline-flex items-center gap-2 py-1.5 px-3.5 rounded-full bg-[var(--portal-color-primary-soft)] border text-[0.72rem] font-semibold text-[var(--portal-color-primary)] tracking-wide"
              style={{ borderColor: 'rgba(107, 142, 201, 0.15)' }}
            >
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              </span>
              {t('badge')}
            </div>

            {/* Title */}
            <h1 className="text-[clamp(2.8rem,5vw,4.5rem)] font-extrabold leading-[1.05] tracking-tighter mb-6 text-[var(--portal-color-text)]">
              {t('title1')}
              <br />
              <span className="text-[var(--portal-color-primary)]">{t('title2')}</span>
            </h1>

            {/* Description */}
            <p className="text-[1.05rem] leading-[1.75] max-w-[440px] mb-10 border-l-2 border-[rgba(107,142,201,0.25)] pl-[1.2rem] text-[var(--portal-color-text-secondary)]">
              {t('description')}
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3 mb-10">
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-white no-underline transition-all duration-300 hover:-translate-y-0.5 py-3 px-7 rounded-full bg-[var(--portal-color-primary)] font-semibold text-[0.88rem] shadow-[0_2px_12px_rgba(107,142,201,0.2)] hover:shadow-[0_4px_16px_rgba(107,142,201,0.35)]"
              >
                {t('exploreBlog')}
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-1.5 no-underline transition-all duration-300 py-3 px-7 rounded-full bg-transparent text-[var(--portal-color-text)] font-medium text-[0.88rem] border-[1.5px] border-compat hover:bg-[var(--portal-color-surface-alt)] hover:-translate-y-0.5"
              >
                {t('viewProjects')}
              </Link>
            </div>

            {/* Tags */}
            <div className="flex gap-4 text-[0.78rem] font-medium text-[var(--portal-color-text-secondary)]">
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                Next.js
              </span>
              <span className="flex items-center gap-1.5">
                <span className="font-bold">TS</span>
                TypeScript
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                  />
                </svg>
                tRPC
              </span>
            </div>
          </div>

          {/* Code Terminal Card */}
          <div className="hidden lg:block">
            <div className="border border-compat bg-[var(--portal-color-surface)] shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-2xl overflow-hidden">
              {/* Terminal Header */}
              <div className="flex items-center justify-between py-3 px-4 border-b border-compat-soft bg-[var(--portal-color-surface-alt)]">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[rgba(239,68,68,0.7)]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[rgba(245,158,11,0.7)]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[rgba(16,185,129,0.7)]"></div>
                </div>
                <span className="font-mono text-[0.65rem] text-[var(--portal-color-text-secondary)]">
                  portal — zsh
                </span>
                <div className="w-8"></div>
              </div>

              {/* Terminal Body */}
              <div className="p-6 font-mono text-[0.82rem] leading-[1.8] text-[var(--portal-color-text-secondary)]">
                <div className="opacity-50">// Initializing Portal</div>
                <div>
                  <span className="text-violet-500">const</span>
                  <span className="text-[var(--portal-color-primary)]"> developer</span> = {'{ '}
                </div>
                <div className="pl-6">
                  <span className="text-[var(--portal-color-primary)]">name:</span>{' '}
                  <span className="text-emerald-600 dark:text-emerald-400">'Rick'</span>,
                </div>
                <div className="pl-6">
                  <span className="text-[var(--portal-color-primary)]">role:</span>{' '}
                  <span className="text-emerald-600 dark:text-emerald-400">
                    'Full-Stack Engineer'
                  </span>
                  ,
                </div>
                <div className="pl-6">
                  <span className="text-[var(--portal-color-primary)]">stack:</span> [
                  <span className="text-emerald-600 dark:text-emerald-400">'Next.js'</span>,{' '}
                  <span className="text-emerald-600 dark:text-emerald-400">'TypeScript'</span>,{' '}
                  <span className="text-emerald-600 dark:text-emerald-400">'Prisma'</span>],
                </div>
                <div className="pl-6">
                  <span className="text-[var(--portal-color-primary)]">status:</span>{' '}
                  <span className="text-emerald-600 dark:text-emerald-400">'Building'</span>
                </div>
                <div>{'}; '}</div>
                <div className="mt-4 flex items-center gap-2 text-[var(--portal-color-text-secondary)]">
                  <span className="text-emerald-500">➜</span>
                  <span className="text-[var(--portal-color-text)]">pnpm dev</span>
                  <span className="inline-block h-4 w-0.5 animate-pulse bg-[var(--portal-color-primary)]"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOG SECTION */}
      <div className="w-full border-y border-compat-soft bg-[var(--portal-color-surface)]">
        <section className="py-20 px-8 max-w-[1200px] mx-auto w-full">
          <div className="flex items-baseline gap-3 mb-10">
            <span className="w-7 h-[2px] bg-[var(--portal-color-primary)] shrink-0"></span>
            <span className="font-mono text-[0.7rem] tracking-widest uppercase text-[var(--portal-color-primary)] font-medium">
              {t('latestPosts')}
            </span>
            <h2 className="text-[1.6rem] font-bold tracking-tight text-[var(--portal-color-text)]">
              {t('blogTitle')}
            </h2>
          </div>

          <div className="flex flex-col">
            {posts.length > 0 ? (
              posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group text-inherit no-underline transition-all duration-300 ease-out hover:bg-[var(--portal-color-primary-soft)] hover:border-transparent hover:pl-6 grid grid-cols-[80px_1fr_auto] gap-6 items-baseline py-5 px-4 border-b border-compat-soft cursor-pointer rounded-xl hover:shadow-[0_4px_20px_rgba(107,142,201,0.05)]"
                >
                  <span className="whitespace-nowrap font-mono text-[0.72rem] text-[var(--portal-color-text-tertiary)]">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString(locale, {
                          month: 'short',
                          day: 'numeric',
                        })
                      : '—'}
                  </span>
                  <div>
                    {post.category && (
                      <span className="inline-block text-[0.6rem] font-semibold tracking-widest uppercase text-[var(--portal-color-primary)] py-0.5 px-2 bg-[var(--portal-color-primary-soft)] rounded-[6px] mb-1.5">
                        {post.category.name}
                      </span>
                    )}
                    <div className="text-base font-semibold leading-normal tracking-tight text-[var(--portal-color-text)] mb-1 group-hover:text-[var(--portal-color-primary)] transition-colors duration-300">
                      {post.title}
                    </div>
                    {post.excerpt && (
                      <div className="text-[0.82rem] leading-relaxed text-[var(--portal-color-text-secondary)]">
                        {post.excerpt}
                      </div>
                    )}
                  </div>
                  <span className="text-[18px] text-[var(--portal-color-primary)] opacity-0 -translate-x-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0">
                    →
                  </span>
                </Link>
              ))
            ) : (
              <p className="py-12 text-center text-[var(--portal-color-text-secondary)]">
                No articles published yet.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* PORTFOLIO SECTION */}
      <section className="py-20 px-8 max-w-[1200px] mx-auto w-full">
        <div className="flex items-baseline justify-between mb-10">
          <div className="flex items-baseline gap-3">
            <span className="w-7 h-[2px] bg-[var(--portal-color-primary)] shrink-0"></span>
            <span className="font-mono text-[0.7rem] tracking-widest uppercase text-[var(--portal-color-primary)] font-medium">
              {t('selectedWork')}
            </span>
            <h2 className="text-[1.6rem] font-bold tracking-tight text-[var(--portal-color-text)]">
              {t('projectsTitle')}
            </h2>
          </div>
          <Link
            href="/portfolio"
            className="group flex items-center gap-1.5 no-underline transition-colors text-[0.82rem] font-medium text-[var(--portal-color-text-secondary)] hover:text-[var(--portal-color-primary)]"
          >
            {t('viewAll')}{' '}
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length > 0 ? (
            projects.map((project) => (
              <Link
                key={project.id}
                href={`/portfolio/${project.slug}`}
                className="group cursor-pointer overflow-hidden border border-compat-soft hover-border-compat-primary no-underline transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_12px_30px_rgba(0,0,0,0.2)] rounded-2xl bg-[var(--portal-color-surface)]"
              >
                <div className="h-[180px] relative bg-gradient-to-br from-[var(--portal-color-surface-alt)] to-[rgba(107,142,201,0.05)] flex items-center justify-center text-[3rem]">
                  {project.coverImage ? (
                    <Image
                      src={project.coverImage}
                      alt={project.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    '🚀'
                  )}
                  {project.featured && (
                    <span className="absolute top-2.5 left-2.5 py-1 px-2.5 rounded-full bg-[var(--portal-color-primary)] text-white text-[0.58rem] font-bold tracking-wider uppercase shadow-sm">
                      Featured
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <div className="text-base font-bold text-[var(--portal-color-text)] group-hover:text-[var(--portal-color-primary)] transition-colors duration-300 mb-1 tracking-tight">
                    {project.title}
                  </div>
                  <div className="text-[0.82rem] text-[var(--portal-color-text-secondary)] leading-relaxed mb-4 line-clamp-2">
                    {project.description}
                  </div>
                  {project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {project.techStack.map((tag) => (
                        <span
                          key={tag}
                          className="font-mono text-[0.6rem] py-1 px-2 rounded-[6px] bg-[var(--portal-color-primary-soft)] text-[var(--portal-color-primary)] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <p className="col-span-full py-12 text-center text-[var(--portal-color-text-secondary)]">
              No showcase projects available yet.
            </p>
          )}
        </div>
      </section>

      {/* GUESTBOOK SECTION */}
      <div className="w-full border-y border-compat-soft bg-[var(--portal-color-surface)]">
        <section className="py-20 px-8 max-w-[1200px] mx-auto w-full">
          <div className="flex items-baseline gap-3 mb-10">
            <span className="w-7 h-[2px] bg-[var(--portal-color-primary)] shrink-0"></span>
            <span className="font-mono text-[0.7rem] tracking-widest uppercase text-[var(--portal-color-primary)] font-medium">
              {t('community')}
            </span>
            <h2 className="text-[1.6rem] font-bold tracking-tight text-[var(--portal-color-text)]">
              {t('guestbookTitle')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guestbookEntries.length > 0 ? (
              guestbookEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-5 rounded-xl bg-[var(--portal-color-background)] border border-compat-soft hover-border-compat-primary transition-all duration-300 ease-out hover:shadow-[0_8px_24px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)]"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    {entry.avatar ? (
                      <img
                        src={entry.avatar}
                        alt={entry.authorName}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[var(--portal-color-primary-soft)] text-[var(--portal-color-primary)] flex items-center justify-center text-[0.65rem] font-bold">
                        {entry.authorName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="text-[0.78rem] font-semibold text-[var(--portal-color-text)]">
                      {entry.authorName}
                    </span>
                    <span className="ml-auto text-[0.6rem] font-mono text-[var(--portal-color-text-tertiary)]">
                      {new Date(entry.createdAt).toLocaleDateString(locale, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="text-[0.82rem] leading-relaxed text-[var(--portal-color-text-secondary)]">
                    {entry.content}
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-full py-12 text-center text-[var(--portal-color-text-secondary)]">
                No guestbook messages yet.
              </p>
            )}
          </div>

          {/* Stats Row */}
          <div className="mt-8 pt-8 border-t border-compat-soft grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
            {[
              { num: String(postCount), label: tGuestbook('stats.posts') },
              { num: String(projectCount), label: tGuestbook('stats.projects') },
              {
                num: viewCount >= 1000 ? `${(viewCount / 1000).toFixed(1)}K` : String(viewCount),
                label: tGuestbook('stats.pageViews'),
              },
              { num: String(guestbookCount), label: tGuestbook('stats.guestbook') },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-extrabold tracking-tighter leading-none text-[var(--portal-color-text)]">
                  {stat.num}
                </div>
                <div className="mt-1 text-[0.72rem] font-medium tracking-wider uppercase text-[var(--portal-color-text-secondary)]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
