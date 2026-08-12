'use client';

import { AlignLeft } from 'lucide-react';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { extractTocItems } from '@/lib/toc';

interface TableOfContentsProps {
  content: string;
  title?: string;
  className?: string;
}

export function TableOfContents({ content, title = '目录', className = '' }: TableOfContentsProps) {
  const headings = useMemo(() => extractTocItems(content), [content]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (headings.length === 0) return;

    setActiveId((prev) => prev || headings[0]?.id || '');

    // Set up IntersectionObserver for scroll tracking
    const observerCallback: IntersectionObserverCallback = (entries) => {
      // Find headings intersecting in top portion of viewport
      const visibleEntries = entries.filter((entry) => entry.isIntersecting);
      if (visibleEntries.length > 0) {
        // Pick the top-most visible heading
        const topEntry = visibleEntries.reduce((prev, curr) =>
          prev.boundingClientRect.top < curr.boundingClientRect.top ? prev : curr,
        );
        setActiveId(topEntry.target.id);
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: '-80px 0px -60% 0px',
      threshold: 0.1,
    });

    const observedElements: HTMLElement[] = [];

    const bindElements = () => {
      for (const item of headings) {
        const el = document.getElementById(item.id);
        if (el && !observedElements.includes(el)) {
          observer.observe(el);
          observedElements.push(el);
        }
      }
    };

    bindElements();
    const timer = setTimeout(bindElements, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveId(id);

    const targetElement = document.getElementById(id);
    if (targetElement) {
      const yOffset = -90; // Header height offset
      const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });

      // Update URL hash without scrolling
      window.history.pushState(null, '', `#${id}`);
    }
  };

  return (
    <nav
      aria-label={title}
      className={`rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-4 shadow-xs transition-colors ${className}`}
    >
      <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--portal-color-text-secondary)]">
        <AlignLeft className="h-4 w-4 shrink-0 text-[var(--portal-color-primary)]" />
        <span className="truncate">{title}</span>
      </div>

      <ul className="space-y-1 text-sm border-l border-[var(--portal-color-border)]">
        {headings.map((item, index) => {
          const isActive = activeId === item.id;
          return (
            <li key={`${item.id}-${index}`} className="overflow-hidden">
              <a
                href={`#${item.id}`}
                onClick={(e) => handleLinkClick(e, item.id)}
                title={item.text}
                className={`-ml-px block border-l-2 py-1.5 pl-3 pr-2 text-xs leading-relaxed transition-all duration-200 rounded-r-md truncate whitespace-nowrap ${
                  isActive
                    ? 'border-[var(--portal-color-primary)] font-semibold text-[var(--portal-color-primary)] bg-[var(--portal-color-primary-soft)]'
                    : 'border-transparent text-[var(--portal-color-text-secondary)] hover:border-[var(--portal-color-border)] hover:text-[var(--portal-color-text)]'
                }`}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
