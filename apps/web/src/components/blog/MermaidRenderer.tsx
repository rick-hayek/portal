'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

interface MermaidRendererProps {
  /**
   * Optional content dependency to re-trigger rendering when markdown changes dynamically (e.g. in Markdown Editor).
   */
  content?: string;
  /**
   * Optional CSS selector to target specific container element. Default: '.prose-portal, .prose, article'
   */
  selector?: string;
}

let mermaidPromise: Promise<typeof import('mermaid').default> | null = null;

function loadMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then((m) => {
      const mermaid = m.default;
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        theme: 'neutral',
        fontFamily: 'inherit',
        suppressErrorRendering: true,
      });
      return mermaid;
    });
  }
  return mermaidPromise;
}

const RENDER_VERSION = 'v7';

export function MermaidRenderer({ content, selector }: MermaidRendererProps) {
  const pathname = usePathname();
  const isRenderingRef = useRef(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: content and pathname changes require re-running render
  useEffect(() => {
    let active = true;

    async function renderMermaidDiagrams() {
      if (isRenderingRef.current) return;
      isRenderingRef.current = true;

      try {
        const mermaid = await loadMermaid();
        if (!active) return;

        const isDarkMode =
          document.documentElement.classList.contains('dark') ||
          document.body.classList.contains('dark') ||
          document.documentElement.getAttribute('data-theme') === 'dark';

        const themeMode = isDarkMode ? 'dark' : 'light';

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          theme: isDarkMode ? 'dark' : 'neutral',
          fontFamily: 'inherit',
          suppressErrorRendering: true,
        });

        const containerSelector = selector || '.prose-portal, .prose, article, body';
        const containers = document.querySelectorAll(containerSelector);

        const nodesToProcess: HTMLElement[] = [];
        containers.forEach((container) => {
          const codeNodes = container.querySelectorAll<HTMLElement>(
            'code.language-mermaid, code.lang-mermaid, div.mermaid, pre.language-mermaid, div.mermaid-rendered-container',
          );
          codeNodes.forEach((node) => {
            if (
              !node.dataset.mermaidProcessed ||
              node.dataset.renderedTheme !== themeMode ||
              node.dataset.renderVersion !== RENDER_VERSION
            ) {
              nodesToProcess.push(node);
            }
          });
        });

        for (let i = 0; i < nodesToProcess.length; i++) {
          if (!active) break;
          const node = nodesToProcess[i];
          const rawCode = node.getAttribute('data-raw-code') || node.textContent || '';
          if (!rawCode.trim()) continue;

          const uniqueId = `mermaid-${Math.random().toString(36).substring(2, 9)}-${i}`;

          try {
            const { svg } = await mermaid.render(uniqueId, rawCode.trim());

            if (!active) break;

            const parentPre = node.closest('pre');
            const targetContainer = parentPre || node;

            const wrapper = document.createElement('div');
            wrapper.className = [
              'mermaid-rendered-container my-6 flex justify-center overflow-x-auto rounded-xl bg-[var(--portal-color-surface)] p-6 border border-[var(--portal-color-border)] shadow-xs',
              '[&_svg]:max-w-full [&_svg]:h-auto',

              // Force 100% opacity on all SVG & HTML nodes
              '[&_svg_text]:!opacity-100 [&_svg_tspan]:!opacity-100 [&_svg_line]:!opacity-100 [&_svg_path]:!opacity-100 [&_svg_polygon]:!opacity-100 [&_svg_foreignObject]:!opacity-100',

              // HTML Text inside foreignObject (Flowcharts / Graphs) -> Must use valid Tailwind text-[...] utility for CSS color
              '[&_svg_foreignObject]:!text-[var(--portal-color-text)]',
              '[&_svg_foreignObject_div]:!text-[var(--portal-color-text)] [&_svg_foreignObject_div]:!font-semibold',
              '[&_svg_foreignObject_span]:!text-[var(--portal-color-text)] [&_svg_foreignObject_span]:!font-semibold',
              '[&_svg_.nodeLabel]:!text-[var(--portal-color-text)] [&_svg_.nodeLabel]:!font-semibold [&_svg_.nodeLabel]:!opacity-100',
              '[&_svg_.nodeLabel_span]:!text-[var(--portal-color-text)]',
              '[&_svg_.edgeLabel]:!text-[var(--portal-color-text)] [&_svg_.edgeLabel_span]:!text-[var(--portal-color-text)]',

              // SVG Text & Tspan (Sequence diagrams, state diagrams, class diagrams) -> Uses SVG fill-[...] utility
              '[&_svg_text]:!fill-[var(--portal-color-text)] [&_svg_tspan]:!fill-[var(--portal-color-text)] [&_svg_text]:!font-semibold',
              '[&_svg_.messageText]:!fill-[var(--portal-color-text)] [&_svg_.messageText_tspan]:!fill-[var(--portal-color-text)]',
              '[&_svg_text.actor]:!fill-[var(--portal-color-text)] [&_svg_text.actor_tspan]:!fill-[var(--portal-color-text)] [&_svg_text.actor]:!font-bold',

              // Flowchart & Diagram Node Shapes (Background & Border)
              '[&_svg_.node_rect]:!fill-[var(--portal-color-surface-alt)] [&_svg_.node_rect]:!stroke-[var(--portal-color-primary)] [&_svg_.node_rect]:!stroke-width-[1.5px]',
              '[&_svg_.node_polygon]:!fill-[var(--portal-color-surface-alt)] [&_svg_.node_polygon]:!stroke-[var(--portal-color-primary)] [&_svg_.node_polygon]:!stroke-width-[1.5px]',
              '[&_svg_.node_path]:!fill-[var(--portal-color-surface-alt)] [&_svg_.node_path]:!stroke-[var(--portal-color-primary)] [&_svg_.node_path]:!stroke-width-[1.5px]',
              '[&_svg_.node_circle]:!fill-[var(--portal-color-surface-alt)] [&_svg_.node_circle]:!stroke-[var(--portal-color-primary)] [&_svg_.node_circle]:!stroke-width-[1.5px]',
              '[&_svg_.node_ellipse]:!fill-[var(--portal-color-surface-alt)] [&_svg_.node_ellipse]:!stroke-[var(--portal-color-primary)] [&_svg_.node_ellipse]:!stroke-width-[1.5px]',
              '[&_svg_.node_label-container]:!fill-[var(--portal-color-surface-alt)] [&_svg_.node_label-container]:!stroke-[var(--portal-color-primary)]',
              '[&_svg_.basic_.label-container]:!fill-[var(--portal-color-surface-alt)] [&_svg_.basic_.label-container]:!stroke-[var(--portal-color-primary)]',

              // Flowchart Connecting Lines & Arrowheads
              '[&_svg_.edgePath_path]:!stroke-[var(--portal-color-text)] [&_svg_.edgePath_path]:!stroke-width-[1.5px]',
              '[&_svg_.flowchart-link]:!stroke-[var(--portal-color-text)] [&_svg_.flowchart-link]:!stroke-width-[1.5px]',
              '[&_svg_.edgeLabel_rect]:!fill-[var(--portal-color-surface)] [&_svg_.edgeLabel_rect]:!stroke-[var(--portal-color-border)]',

              // Sequence Diagram Participant Header & Arrows
              '[&_svg_.actor]:!fill-[var(--portal-color-surface-alt)] [&_svg_.actor]:!stroke-[var(--portal-color-primary)] [&_svg_.actor]:!stroke-width-[1.5px]',
              '[&_svg_.actor-line]:!stroke-[var(--portal-color-text-tertiary,#9ca3af)] [&_svg_.actor-line]:!stroke-width-[1.5px]',
              '[&_svg_.messageLine0]:!stroke-[var(--portal-color-text)] [&_svg_.messageLine0]:!stroke-width-[1.5px]',
              '[&_svg_.messageLine1]:!stroke-[var(--portal-color-text)] [&_svg_.messageLine1]:!stroke-width-[1.5px]',
              '[&_svg_polygon]:!fill-[var(--portal-color-text)] [&_svg_polygon]:!stroke-[var(--portal-color-text)]',
              '[&_svg_marker_path]:!fill-[var(--portal-color-text)] [&_svg_marker_path]:!stroke-[var(--portal-color-text)]',
            ].join(' ');

            wrapper.innerHTML = svg;
            wrapper.dataset.mermaidProcessed = 'true';
            wrapper.dataset.renderedTheme = themeMode;
            wrapper.dataset.renderVersion = RENDER_VERSION;
            wrapper.setAttribute('data-raw-code', rawCode);

            targetContainer.parentNode?.replaceChild(wrapper, targetContainer);
          } catch (_err) {
            // Silently catch invalid syntax during user typing
            const errorElement = document.getElementById(`d${uniqueId}`);
            if (errorElement) {
              errorElement.remove();
            }
          }
        }
      } catch (err) {
        console.error('Failed to render Mermaid diagrams:', err);
      } finally {
        isRenderingRef.current = false;
      }
    }

    renderMermaidDiagrams();

    const timer = setTimeout(renderMermaidDiagrams, 50);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [pathname, content, selector]);

  return null;
}
