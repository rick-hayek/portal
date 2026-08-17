import { MDXRemote, type MDXRemoteProps } from 'next-mdx-remote/rsc';
import type React from 'react';
import { CodeBlock } from '@/components/blog/CodeBlock';
import { sanitizeMdxContent } from '@/lib/mdx-sanitizer';

import rehypeSanitizeHtmlAttrs from '@/lib/rehype-sanitize-html-attrs';

interface SafeMDXRemoteProps extends MDXRemoteProps {
  knownComponents?: string[];
}

/**
 * Fault-tolerant wrapper around next-mdx-remote's MDXRemote.
 * Ensures blog posts with malformed MDX or plain-text angle brackets (e.g. <RP Name>)
 * never crash the server or return a 500 status code.
 */
export async function SafeMDXRemote({
  source,
  components = {},
  options = {},
  knownComponents = [],
}: SafeMDXRemoteProps) {
  const componentKeys = components && typeof components === 'object' ? Object.keys(components) : [];
  const activeComponents = [
    ...componentKeys,
    ...knownComponents,
    'AdSense',
    'CustomBlockquote',
    'MathRenderer',
    'MermaidRenderer',
  ];

  const sourceStr = typeof source === 'string' ? source : String(source ?? '');

  // Tier 1: Intelligent sanitization before MDX compilation
  const sanitizedSource = sanitizeMdxContent(sourceStr, activeComponents);

  const defaultComponents = {
    pre: CodeBlock,
    a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
      const isExternal = href?.startsWith('http://') || href?.startsWith('https://');
      if (isExternal) {
        return (
          <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
            {children}
          </a>
        );
      }
      return (
        <a href={href} {...props}>
          {children}
        </a>
      );
    },
  };

  const mergedComponents = {
    ...defaultComponents,
    ...components,
  };

  const userRehypePlugins = options?.mdxOptions?.rehypePlugins || [];
  const mdxOptions = {
    ...options?.mdxOptions,
    rehypePlugins: [rehypeSanitizeHtmlAttrs, ...userRehypePlugins],
  };
  const finalOptions = {
    ...options,
    mdxOptions,
  };

  try {
    return await MDXRemote({
      source: sanitizedSource,
      components: mergedComponents,
      options: finalOptions,
    });
  } catch (err) {
    console.error('[SafeMDXRemote] MDX compilation error:', err);

    // Tier 2 Fallback: Aggressive escaping of any non-whitelisted angle bracket
    try {
      const aggressiveSource = sanitizedSource.replace(/<([^>\s/]+)/g, (match, tagName) => {
        if (activeComponents.includes(tagName)) return match;
        return `&lt;${tagName}`;
      });

      return await MDXRemote({
        source: aggressiveSource,
        components: mergedComponents,
        options,
      });
    } catch (fallbackErr) {
      console.error('[SafeMDXRemote] Aggressive fallback failed:', fallbackErr);

      // Tier 3 Fallback: Safe text rendering guarantee (0% chance of 500 error)
      return (
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 text-[var(--portal-color-text)] dark:border-amber-900/50 dark:bg-amber-950/20">
          <p className="mb-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
            内容容错预览 (MDX 语法降级模式)
          </p>
          <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-[var(--portal-color-text)]">
            {sourceStr}
          </pre>
        </div>
      );
    }
  }
}
