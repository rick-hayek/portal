'use client';

import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function HomePage() {
    const t = useTranslations('Index');
    return (
        <div className="flex w-full flex-col">
            {/* HERO SECTION */}
            <section className="flex min-h-screen w-full items-center justify-center" style={{ padding: '8rem 2rem 4rem' }}>
                <div className="mx-auto w-full max-w-[1200px]" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
                    {/* Hero Text */}
                    <div>
                        {/* Badge */}
                        <div className="mb-8 inline-flex items-center gap-2" style={{ padding: '0.3rem 0.8rem', borderRadius: '100px', background: 'rgba(107, 142, 201, 0.08)', border: '1px solid rgba(107, 142, 201, 0.15)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--portal-color-primary, #6b8ec9)', letterSpacing: '0.02em' }}>
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full" style={{ background: '#10b981', opacity: 0.75 }}></span>
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: '#10b981' }}></span>
                            </span>
                            {t('badge')}
                        </div>

                        {/* Title */}
                        <h1 style={{ fontSize: 'clamp(2.8rem, 5vw, 4.5rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: '1.5rem' }}>
                            {t('title1')}<br />
                            <span style={{ color: 'var(--portal-color-primary, #6b8ec9)' }}>{t('title2')}</span>
                        </h1>

                        {/* Description */}
                        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, maxWidth: '440px', marginBottom: '2.5rem', borderLeft: '2px solid rgba(107, 142, 201, 0.25)', paddingLeft: '1.2rem', color: 'var(--portal-color-text-secondary, #4b5563)' }}>
                            {t('description')}
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex items-center gap-3" style={{ marginBottom: '2.5rem' }}>
                            <Link
                                href="/blog"
                                className="inline-flex items-center gap-1.5 text-white no-underline transition-all hover:-translate-y-0.5"
                                style={{ padding: '0.75rem 1.8rem', borderRadius: '100px', background: 'var(--portal-color-primary, #6b8ec9)', fontWeight: 600, fontSize: '0.88rem', boxShadow: '0 2px 12px rgba(107, 142, 201, 0.2)' }}
                            >
                                {t('exploreBlog')}
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </Link>
                            <Link
                                href="/portfolio"
                                className="inline-flex items-center gap-1.5 no-underline transition-all"
                                style={{ padding: '0.75rem 1.8rem', borderRadius: '100px', background: 'transparent', color: 'var(--portal-color-text, #111827)', fontWeight: 500, fontSize: '0.88rem', border: '1.5px solid var(--portal-color-border, #e5e7eb)' }}
                            >
                                {t('viewProjects')}
                            </Link>
                        </div>

                        {/* Tags */}
                        <div className="flex gap-4" style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--portal-color-text-secondary, #4b5563)' }}>
                            <span className="flex items-center gap-1.5">
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                                Next.js
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span style={{ fontWeight: 'bold' }}>TS</span>
                                TypeScript
                            </span>
                            <span className="flex items-center gap-1.5">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                                tRPC
                            </span>
                        </div>
                    </div>

                    {/* Code Terminal Card */}
                    <div className="hidden lg:block">
                        <div style={{ border: '1px solid var(--portal-color-border, #e5e7eb)', background: 'var(--portal-color-surface, #ffffff)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)', borderRadius: '16px', overflow: 'hidden' }}>
                            {/* Terminal Header */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 1rem', borderBottom: '1px solid var(--portal-color-border-soft, #f0f1f3)', background: 'var(--portal-color-surface-alt, #f1f3f7)' }}>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444aa' }}></div>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0baa' }}></div>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981aa' }}></div>
                                </div>
                                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.65rem', color: 'var(--portal-color-text-secondary, #9ca3af)' }}>portal — zsh</span>
                                <div style={{ width: '32px' }}></div>
                            </div>

                            {/* Terminal Body */}
                            <div style={{ padding: '1.5rem', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.82rem', lineHeight: 1.8, color: 'var(--portal-color-text-secondary, #4b5563)' }}>
                                <div style={{ opacity: 0.5 }}>// Initializing Portal</div>
                                <div>
                                    <span style={{ color: '#7c3aed' }}>const</span>
                                    <span style={{ color: 'var(--portal-color-primary, #6b8ec9)' }}> developer</span> = {'{ '}
                                </div>
                                <div style={{ paddingLeft: '1.5rem' }}>
                                    <span style={{ color: 'var(--portal-color-primary, #6b8ec9)' }}>name:</span> <span style={{ color: '#059669' }}>'Rick'</span>,
                                </div>
                                <div style={{ paddingLeft: '1.5rem' }}>
                                    <span style={{ color: 'var(--portal-color-primary, #6b8ec9)' }}>role:</span> <span style={{ color: '#059669' }}>'Full-Stack Engineer'</span>,
                                </div>
                                <div style={{ paddingLeft: '1.5rem' }}>
                                    <span style={{ color: 'var(--portal-color-primary, #6b8ec9)' }}>stack:</span> [<span style={{ color: '#059669' }}>'Next.js'</span>, <span style={{ color: '#059669' }}>'TypeScript'</span>, <span style={{ color: '#059669' }}>'Prisma'</span>],
                                </div>
                                <div style={{ paddingLeft: '1.5rem' }}>
                                    <span style={{ color: 'var(--portal-color-primary, #6b8ec9)' }}>status:</span> <span style={{ color: '#059669' }}>'Building'</span>
                                </div>
                                <div>{'}; '}</div>
                                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--portal-color-text-secondary, #4b5563)' }}>
                                    <span style={{ color: '#10b981' }}>➜</span>
                                    <span style={{ color: 'var(--portal-color-text, #111827)' }}>pnpm dev</span>
                                    <span className="inline-block h-4 w-0.5 animate-pulse" style={{ background: 'var(--portal-color-primary, #6b8ec9)' }}></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* BLOG SECTION */}
            <div style={{ width: '100%', borderTop: '1px solid var(--portal-color-border-soft, #f0f1f3)', borderBottom: '1px solid var(--portal-color-border-soft, #f0f1f3)', background: 'var(--portal-color-surface, #ffffff)' }}>

                <section style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.8rem', marginBottom: '2.5rem' }}>
                        <span style={{ width: '28px', height: '2px', background: 'var(--portal-color-primary, #6b8ec9)', flexShrink: 0 }}></span>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--portal-color-primary, #6b8ec9)', fontWeight: 500 }}>{t('latestPosts')}</span>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--portal-color-text, #111827)' }}>{t('blogTitle')}</h2>
                    </div>

                    <div className="flex flex-col">
                        {[
                            { date: 'Feb 10', cat: '随笔', title: '写代码的一些感悟', desc: '编程多年后的一些思考：关于简洁、可读性和工程实践。' },
                            { date: 'Feb 07', cat: '生活', title: '我的开发环境搭建', desc: '分享我的 macOS 开发环境配置，包括编辑器、终端、工具链。' },
                            { date: 'Feb 04', cat: '技术', title: 'React Server Components 实践指南', desc: '从概念到实战，全面掌握 RSC 的核心用法与最佳实践。' },
                        ].map((post, i) => (
                            <Link
                                key={i}
                                href={`/blog/post-${i}`}
                                className="group text-inherit no-underline transition-all hover:bg-[var(--portal-color-primary)]/5 hover:border-transparent hover:pl-6"
                                style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: '1.5rem', alignItems: 'baseline', padding: '1.2rem 1rem', borderBottom: '1px solid var(--portal-color-border-soft, #f0f1f3)', cursor: 'pointer', borderRadius: '12px' }}
                            >
                                <span style={{ whiteSpace: 'nowrap', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.72rem', color: 'var(--portal-color-text-secondary, #9ca3af)' }}>
                                    {post.date}
                                </span>
                                <div>
                                    <span style={{ display: 'inline-block', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--portal-color-primary, #6b8ec9)', padding: '0.1rem 0.5rem', background: 'var(--portal-color-primary-soft, rgba(107, 142, 201, 0.08))', borderRadius: '6px', marginBottom: '0.3rem' }}>
                                        {post.cat}
                                    </span>
                                    <div style={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.4, letterSpacing: '-0.02em', color: 'var(--portal-color-text, #111827)', marginBottom: '0.2rem' }}>
                                        {post.title}
                                    </div>
                                    <div style={{ fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--portal-color-text-secondary, #4b5563)' }}>
                                        {post.desc}
                                    </div>
                                </div>
                                <span style={{ fontSize: '18px', color: 'var(--portal-color-primary, #6b8ec9)', opacity: 0, transform: 'translateX(-8px)', transition: 'all 0.25s' }} className="group-hover:opacity-100 group-hover:translate-x-0">
                                    →
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>

            {/* PORTFOLIO SECTION */}

            <section style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.8rem' }}>
                        <span style={{ width: '28px', height: '2px', background: 'var(--portal-color-primary, #6b8ec9)', flexShrink: 0 }}></span>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--portal-color-primary, #6b8ec9)', fontWeight: 500 }}>{t('selectedWork')}</span>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--portal-color-text, #111827)' }}>{t('projectsTitle')}</h2>
                    </div>
                    <Link href="/portfolio" className="group flex items-center gap-1.5 no-underline transition-colors" style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--portal-color-text-secondary, #4b5563)' }}>
                        {t('viewAll')} <span className="transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.2rem' }}>
                    {[
                        { name: 'Portal', desc: '全栈个人网站引擎，支持多主题切换与模块化架构。', icon: '🚀', tags: ['Next.js', 'TypeScript', 'tRPC', 'Prisma'], featured: true },
                        { name: 'Chat App', desc: '实时聊天应用，基于 WebSocket 毫秒级消息推送。', icon: '💬', tags: ['React', 'Node.js', 'WebSocket', 'Redis'], featured: true },
                        { name: 'CLI Toolkit', desc: '命令行工具集：批处理、JSON 解析、代码统计。', icon: '⚡', tags: ['Rust', 'CLI', 'Cross-platform'], featured: false },
                    ].map((project, i) => (
                        <div
                            key={i}
                            className="group cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1"
                            style={{ border: '1px solid var(--portal-color-border, #e5e7eb)', borderRadius: '16px', background: 'var(--portal-color-background, #f8f9fb)' }}
                        >
                            <div style={{ height: '180px', position: 'relative', background: 'linear-gradient(135deg, var(--portal-color-surface-alt, #f1f3f7), rgba(107, 142, 201, 0.06))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                                {project.icon}
                                {project.featured && (
                                    <span style={{ position: 'absolute', top: '10px', left: '10px', padding: '0.2rem 0.6rem', borderRadius: '100px', background: 'var(--portal-color-primary, #6b8ec9)', color: '#fff', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                        Featured
                                    </span>
                                )}
                            </div>
                            <div style={{ padding: '1.3rem' }}>
                                <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.3rem', letterSpacing: '-0.02em', color: 'var(--portal-color-text, #111827)' }}>
                                    {project.name}
                                </div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--portal-color-text-secondary, #4b5563)', lineHeight: 1.6, marginBottom: '0.8rem' }}>
                                    {project.desc}
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {project.tags.map(tag => (
                                        <span key={tag} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.6rem', padding: '0.2rem 0.5rem', borderRadius: '6px', background: 'var(--portal-color-primary-soft, rgba(107, 142, 201, 0.08))', color: 'var(--portal-color-primary, #6b8ec9)', fontWeight: 500 }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>


            {/* GUESTBOOK SECTION */}
            <div style={{ width: '100%', borderTop: '1px solid var(--portal-color-border-soft, #f0f1f3)', borderBottom: '1px solid var(--portal-color-border-soft, #f0f1f3)', background: 'var(--portal-color-surface, #ffffff)' }}>
                <section style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.8rem', marginBottom: '2.5rem' }}>
                        <span style={{ width: '28px', height: '2px', background: 'var(--portal-color-primary, #6b8ec9)', flexShrink: 0 }}></span>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--portal-color-primary, #6b8ec9)', fontWeight: 500 }}>{t('community')}</span>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--portal-color-text, #111827)' }}>{t('guestbookTitle')}</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {[
                            { avatar: 'JL', name: 'John Lee', time: '2d ago', msg: 'Great blog! Learned a lot about RSC patterns from your posts. Keep it up! 🙌' },
                            { avatar: 'AW', name: 'Alice Wang', time: '5d ago', msg: 'Portal 这个项目太酷了，架构设计很用心，期待更多分享！' },
                            { avatar: 'TK', name: 'Tom Kim', time: '1w ago', msg: 'The tRPC integration is beautifully done. Thanks for the open source work! 🎉' },
                            { avatar: 'LS', name: 'Lisa Sun', time: '1w ago', msg: '刚好在学 Next.js，你的文章对我帮助很大，谢谢！' },
                        ].map((msg, i) => (
                            <div
                                key={i}
                                className="transition-all hover:border-[var(--portal-color-primary)] hover:shadow-[0_4px_16px_rgba(0,0,0,.06)]"
                                style={{ padding: '1.2rem', borderRadius: '12px', background: 'var(--portal-color-surface, #ffffff)', border: '1px solid var(--portal-color-border, #e5e7eb)' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--portal-color-primary-soft, rgba(107, 142, 201, 0.1))', color: 'var(--portal-color-primary, #6b8ec9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700 }}>
                                        {msg.avatar}
                                    </div>
                                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--portal-color-text, #111827)' }}>{msg.name}</span>
                                    <span style={{ marginLeft: 'auto', fontSize: '0.6rem', fontFamily: "'IBM Plex Mono', monospace", color: 'var(--portal-color-text-secondary, #9ca3af)' }}>{msg.time}</span>
                                </div>
                                <div style={{ fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--portal-color-text-secondary, #4b5563)' }}>
                                    {msg.msg}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Stats Row */}
                    <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--portal-color-border-soft, #f0f1f3)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '2rem', justifyItems: 'center' }}>
                        {[
                            { num: '42', label: 'Posts' },
                            { num: '12', label: 'Projects' },
                            { num: '3.2K', label: 'Page Views' },
                            { num: '86', label: 'Guestbook' },
                        ].map((stat, i) => (
                            <div key={i} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--portal-color-text, #111827)' }}>
                                    {stat.num}
                                </div>
                                <div style={{ marginTop: '0.2rem', fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--portal-color-text-secondary, #9ca3af)' }}>
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
