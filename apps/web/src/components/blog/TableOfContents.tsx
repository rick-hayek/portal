'use client';

import { AlignLeft } from 'lucide-react';
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { extractTocItems } from '@/lib/toc';

interface TableOfContentsProps {
  content: string;
  title?: string;
  className?: string;
}

export function TableOfContents({ content, title = '目录', className = '' }: TableOfContentsProps) {
  // Deterministically extract TOC items from markdown content
  const items = useMemo(() => extractTocItems(content), [content]);
  const [activeId, setActiveId] = useState<string>('');

  // Lock scroll spy updating during smooth scroll triggered by explicit click
  const isClickingRef = useRef(false);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (items.length === 0) return;

    // Scroll spy: Determine active heading based on window.scrollY + header offset & bottom check
    const handleScroll = () => {
      if (isClickingRef.current) return;

      // Edge case: If scrolled to bottom of document, highlight the final TOC item
      const isBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;

      if (isBottom && items.length > 0) {
        const lastId = items[items.length - 1]?.id;
        if (lastId) {
          setActiveId(lastId);
          return;
        }
      }

      const headerOffset = 125; // Header height + safety gap
      const scrollPosition = window.scrollY + headerOffset;

      let currentActiveId = items[0]?.id || '';
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            currentActiveId = item.id;
          } else {
            break;
          }
        }
      }

      setActiveId(currentActiveId);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Re-check after dynamic content (images/mdx) finish loading
    const timer = setTimeout(handleScroll, 300);

    return () => {
      clearTimeout(timer);
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveId(id);

    // Lock scroll spy while smooth scrolling to target heading
    isClickingRef.current = true;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      isClickingRef.current = false;
    }, 800);

    const targetElement = document.getElementById(id);
    if (targetElement) {
      const yOffset = -90; // Fixed navbar height offset
      const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });

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
        {items.map((item, index) => {
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
