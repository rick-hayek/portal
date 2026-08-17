import { parseStyleString } from './rehype-sanitize-html-attrs';

/**
 * Standard valid HTML tag names that are safe in MDX if closed or self-closing.
 */
const STANDARD_HTML_TAGS = new Set([
  'a',
  'abbr',
  'address',
  'area',
  'article',
  'aside',
  'audio',
  'b',
  'base',
  'bdi',
  'bdo',
  'blockquote',
  'body',
  'br',
  'button',
  'canvas',
  'caption',
  'center',
  'cite',
  'code',
  'col',
  'colgroup',
  'data',
  'datalist',
  'dd',
  'del',
  'details',
  'dfn',
  'dialog',
  'div',
  'dl',
  'dt',
  'em',
  'embed',
  'fieldset',
  'figcaption',
  'figure',
  'font',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'head',
  'header',
  'hgroup',
  'hr',
  'html',
  'i',
  'iframe',
  'img',
  'input',
  'ins',
  'kbd',
  'label',
  'legend',
  'li',
  'link',
  'main',
  'map',
  'mark',
  'menu',
  'meta',
  'meter',
  'nav',
  'noscript',
  'object',
  'ol',
  'optgroup',
  'option',
  'output',
  'p',
  'picture',
  'pre',
  'progress',
  'q',
  'rp',
  'rt',
  'ruby',
  's',
  'samp',
  'script',
  'section',
  'select',
  'small',
  'source',
  'span',
  'strong',
  'style',
  'sub',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'template',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'time',
  'title',
  'tr',
  'track',
  'u',
  'ul',
  'var',
  'video',
  'wbr',
  'svg',
  'path',
  'g',
  'circle',
  'rect',
  'line',
  'polyline',
  'polygon',
  'text',
  'use',
  'defs',
  'symbol',
]);

/**
 * Sanitizes markdown content so that unescaped angle brackets (e.g. `<RP Name>`, `<IP:Port>`, `a < b`)
 * outside of code blocks/inline code do not trigger MDX JSX compilation errors.
 *
 * @param content Raw markdown string
 * @param knownComponents Whitelisted custom JSX component names (e.g. ['AdSense', 'CustomBlockquote'])
 * @returns Sanitized markdown string safe for MDXRemote compilation
 */
export function sanitizeMdxContent(
  content: string,
  knownComponents: string[] = ['AdSense', 'CustomBlockquote', 'MathRenderer', 'MermaidRenderer'],
): string {
  if (!content) return '';

  const knownSet = new Set(knownComponents);

  // Tokenize string to separate code blocks, inline code, HTML comments, and plain text
  const tokens: Array<{ type: string; value: string }> = [];

  // Regex to match fenced code blocks (``` or ~~~), inline code (`...`), and HTML comments (<!--...-->)
  const blockRegex = /(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`|<!--[\s\S]*?-->)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', value: content.slice(lastIndex, match.index) });
    }
    const tokenVal = match[0];
    if (tokenVal.startsWith('<!--')) {
      tokens.push({ type: 'html_comment', value: tokenVal });
    } else if (tokenVal.startsWith('`')) {
      tokens.push({ type: 'inline_code', value: tokenVal });
    } else {
      tokens.push({ type: 'fenced_code', value: tokenVal });
    }
    lastIndex = blockRegex.lastIndex;
  }

  if (lastIndex < content.length) {
    tokens.push({ type: 'text', value: content.slice(lastIndex) });
  }

  // Process text tokens to normalize HTML tags and escape unhandled `<`
  const sanitizedTokens = tokens.map((token) => {
    if (token.type !== 'text') {
      return token.value;
    }

    let text = token.value;

    if (!text.includes('<')) {
      return text;
    }

    // 1. Normalize unquoted attribute values on HTML tags (e.g. <font color=blue> -> <font color="blue">)
    text = text.replace(
      /(<[a-zA-Z0-9_-]+\s+[^>]*?)([a-zA-Z0-9_-]+)=([^\s"'`=<>/]+)([\s/>]|$)/g,
      '$1$2="$3"$4',
    );

    // Replace `<` that is not a valid known component or valid HTML tag
    text = text.replace(/<([^>\n]*)(>|$)/g, (fullMatch, tagInner, closingBracket) => {
      if (!closingBracket) {
        return '&lt;' + tagInner;
      }

      const trimmedInner = tagInner.trim();

      if (trimmedInner.startsWith('/')) {
        const rawTagName = trimmedInner.slice(1).trim().split(/\s+/)[0] || '';
        const tagName = rawTagName.replace(/\/+$/, '');
        if (tagName && (knownSet.has(tagName) || STANDARD_HTML_TAGS.has(tagName.toLowerCase()))) {
          return fullMatch;
        }
        return `&lt;${tagInner}&gt;`;
      }

      const rawTagName = trimmedInner.split(/\s+/)[0] || '';
      const tagName = rawTagName.replace(/\/+$/, '');

      if (!tagName) {
        return `&lt;${tagInner}&gt;`;
      }

      if (knownSet.has(tagName)) {
        return fullMatch;
      }

      const lowerTagName = tagName.toLowerCase();
      if (STANDARD_HTML_TAGS.has(lowerTagName)) {
        const isSelfClosing =
          trimmedInner.endsWith('/') ||
          ['br', 'hr', 'img', 'input', 'meta', 'link'].includes(lowerTagName);
        if (isSelfClosing) {
          return fullMatch;
        }

        const closingTagRegex = new RegExp(`</\\s*${lowerTagName}\\s*>`, 'i');
        if (closingTagRegex.test(text)) {
          return fullMatch;
        }
      }

      return `&lt;${tagInner}&gt;`;
    });

    return text;
  });

  return sanitizedTokens.join('');
}
