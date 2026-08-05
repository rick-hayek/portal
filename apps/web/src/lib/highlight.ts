import hljs from 'highlight.js';

export { hljs };

export function highlightCode(code: string, lang?: string): string {
  const language = (lang || '').trim().split(/\s+/)[0].toLowerCase();
  if (language && hljs.getLanguage(language)) {
    try {
      return hljs.highlight(code, { language }).value;
    } catch {
      // Fallback
    }
  }
  try {
    return hljs.highlightAuto(code).value;
  } catch {
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
