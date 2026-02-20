'use client';

import React from 'react';
import { trpc } from '@/lib/api/client';
import Image from 'next/image';
import { Globe, ArrowUpRight, Link2 } from 'lucide-react';

export default function LinksPage() {
    const { data: links, isLoading } = trpc.link.list.useQuery();

    if (isLoading) {
        return (
            <div className="mx-auto max-w-5xl space-y-12">
                <header className="space-y-4">
                    <h1 className="text-4xl font-extrabold tracking-tight text-[var(--portal-color-text)] md:text-5xl">
                        Loading Links...
                    </h1>
                </header>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="flex h-32 animate-pulse rounded-2xl bg-[var(--portal-color-surface)] p-6" />
                    ))}
                </div>
            </div>
        );
    }

    // Group links by category
    const groupedLinks = links?.reduce((acc, link) => {
        const cat = link.category || 'other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(link);
        return acc;
    }, {} as Record<string, typeof links>) || {};

    const categoryTitles: Record<string, string> = {
        friend: 'Friends',
        tool: 'Tools & Utilities',
        inspiration: 'Inspirations',
        other: 'Other Links'
    };

    return (
        <div className="mx-auto max-w-5xl space-y-16">
            <header className="space-y-4 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--portal-color-primary)]/10 text-[var(--portal-color-primary)]">
                    <Link2 className="h-8 w-8" />
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-[var(--portal-color-text)] md:text-5xl">
                    Bookmarks & Friends
                </h1>
                <p className="mx-auto max-w-2xl text-lg text-[var(--portal-color-text-secondary)]">
                    A collection of tools I use, people I admire, and websites that inspire me.
                </p>
            </header>

            {Object.entries(groupedLinks).map(([category, items]) => (
                <section key={category} className="space-y-8">
                    <h2 className="text-2xl font-bold tracking-tight text-[var(--portal-color-text)] flex items-center gap-3">
                        <span className="flex-1 border-b border-[var(--portal-color-border)] content-['']"></span>
                        <span className="px-4 text-[var(--portal-color-text-secondary)] uppercase tracking-wider text-sm font-semibold">
                            {categoryTitles[category] || category}
                        </span>
                        <span className="flex-1 border-b border-[var(--portal-color-border)] content-['']"></span>
                    </h2>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((link) => (
                            <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative flex flex-col gap-4 rounded-2xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-6 transition-all hover:-translate-y-1 hover:border-[var(--portal-color-primary)] hover:shadow-lg hover:shadow-[var(--portal-color-primary)]/5"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--portal-color-bg)] ring-1 ring-[var(--portal-color-border)] transition-transform group-hover:scale-110">
                                        {link.avatar ? (
                                            <Image
                                                src={link.avatar}
                                                alt={link.name}
                                                width={48}
                                                height={48}
                                                className="h-full w-full object-cover"
                                                unoptimized={link.avatar.includes('dicebear')}
                                            />
                                        ) : (
                                            <Globe className="h-6 w-6 text-[var(--portal-color-text-tertiary)]" />
                                        )}
                                    </div>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--portal-color-bg)] text-[var(--portal-color-text-tertiary)] transition-colors group-hover:bg-[var(--portal-color-primary)] group-hover:text-white">
                                        <ArrowUpRight className="h-4 w-4" />
                                    </div>
                                </div>
                                <div className="space-y-1.5 mt-2">
                                    <h3 className="font-semibold leading-none tracking-tight text-[var(--portal-color-text)]">
                                        {link.name}
                                    </h3>
                                    {link.description && (
                                        <p className="line-clamp-2 text-sm text-[var(--portal-color-text-secondary)]">
                                            {link.description}
                                        </p>
                                    )}
                                </div>
                            </a>
                        ))}
                    </div>
                </section>
            ))}

            {links?.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--portal-color-border)] p-12 text-center">
                    <Link2 className="mb-4 h-12 w-12 text-[var(--portal-color-text-tertiary)]" />
                    <h3 className="mb-2 text-lg font-medium text-[var(--portal-color-text)]">No links found</h3>
                    <p className="text-sm text-[var(--portal-color-text-secondary)]">
                        Looks like the collection is empty for now.
                    </p>
                </div>
            )}
        </div>
    );
}
