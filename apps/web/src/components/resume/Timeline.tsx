import React from 'react';

export interface TimelineItemProps {
    title: string;
    subtitle: string;
    date: string;
    location?: string;
    description?: string | string[];
}

export function Timeline({ items }: { items: TimelineItemProps[] }) {
    if (!items || items.length === 0) return null;

    return (
        <div className="relative border-l border-[var(--portal-color-border)] ml-3 space-y-8 pb-4">
            {items.map((item, idx) => (
                <div key={idx} className="relative pl-6">
                    {/* Timeline Dot */}
                    <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-[var(--portal-color-background)] bg-[var(--portal-color-primary)]"></div>

                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-lg font-bold text-[var(--portal-color-text)]">{item.title}</h3>
                        <span className="text-sm font-medium text-[var(--portal-color-primary)] shrink-0">{item.date}</span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--portal-color-text-secondary)]">
                        <span className="font-semibold">{item.subtitle}</span>
                        {item.location && (
                            <>
                                <span className="hidden sm:inline">&middot;</span>
                                <span>{item.location}</span>
                            </>
                        )}
                    </div>

                    {item.description && (
                        <div className="mt-3 text-sm text-[var(--portal-color-text)]">
                            {Array.isArray(item.description) ? (
                                <ul className="list-disc space-y-1.5 pl-4 text-[var(--portal-color-text-secondary)]">
                                    {item.description.map((desc, i) => (
                                        <li key={i}>{desc}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-[var(--portal-color-text-secondary)]">{item.description}</p>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
