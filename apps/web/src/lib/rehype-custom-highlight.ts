import { createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml'; // html
import python from 'highlight.js/lib/languages/python';
import rust from 'highlight.js/lib/languages/rust';
import go from 'highlight.js/lib/languages/go';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import yaml from 'highlight.js/lib/languages/yaml';
import sql from 'highlight.js/lib/languages/sql';
import csharp from 'highlight.js/lib/languages/csharp';

// Statically register only the necessary languages to keep server bundle size under 3MB
const lowlight = createLowlight({
  js: javascript,
  javascript,
  ts: typescript,
  typescript,
  css,
  xml,
  html: xml,
  py: python,
  python,
  rs: rust,
  rust,
  go,
  bash,
  sh: bash,
  json,
  md: markdown,
  markdown,
  yaml,
  yml: yaml,
  sql,
  cs: csharp,
  csharp,
});

// Helper function to recursively walk the HAST tree
function walk(node: any, callback: (node: any, parent: any) => void, parent?: any) {
  callback(node, parent);
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      walk(child, callback, node);
    }
  }
}

// Helper function to extract text content from a HAST element node
function nodeToText(node: any): string {
  if (node.type === 'text') return node.value || '';
  if (node.children && Array.isArray(node.children)) {
    return node.children.map(nodeToText).join('');
  }
  return '';
}

/**
 * A lightweight rehype plugin that applies syntax highlighting to code blocks.
 * It statically registers a custom subset of languages to avoid bundling the entire Highlight.js set.
 */
export default function rehypeCustomHighlight() {
  return function (tree: any) {
    walk(tree, (node: any, parent: any) => {
      if (
        node.tagName !== 'code' ||
        !parent ||
        parent.type !== 'element' ||
        parent.tagName !== 'pre'
      ) {
        return;
      }

      // Extract language from className property (e.g. "language-javascript")
      const className = node.properties?.className;
      if (!Array.isArray(className)) return;

      let lang: string | null = null;
      for (const cls of className) {
        if (typeof cls === 'string') {
          if (cls.startsWith('language-')) {
            lang = cls.slice(9);
            break;
          } else if (cls.startsWith('lang-')) {
            lang = cls.slice(5);
            break;
          }
        }
      }

      if (!lang) return;

      const text = nodeToText(node);

      try {
        const result = lowlight.highlight(lang, text, { prefix: 'hljs-' });
        if (result.children && result.children.length > 0) {
          node.children = result.children;
        }

        // Add the standard "hljs" class to style the block
        if (!node.properties.className.includes('hljs')) {
          node.properties.className.unshift('hljs');
        }
      } catch (error) {
        // Ignore parsing errors for unknown/unregistered languages
      }
    });
  };
}
