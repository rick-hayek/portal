export interface TocItem {
  id: string;
  text: string;
}

/**
 * Extracts Level 2 headings (## Heading) from raw Markdown text.
 * Strips code blocks and inline markdown formatting.
 */
export function extractTocItems(markdown: string): TocItem[] {
  if (!markdown) return [];

  // Remove code blocks (``` ... ```)
  const contentWithoutCodeBlocks = markdown.replace(/```[\s\S]*?```/g, '');

  const headingRegex = /^##\s+(.+)$/gm;
  const items: TocItem[] = [];

  const matches = contentWithoutCodeBlocks.matchAll(headingRegex);
  for (const match of matches) {
    const rawText = match[1].trim();
    // Strip markdown formatting like bold, italic, code, links
    const cleanText = rawText
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links [text](url) -> text
      .replace(/`([^`]+)`/g, '$1') // inline code `code` -> code
      .replace(/\*\*([^*]+)\*\*/g, '$1') // bold **text** -> text
      .replace(/\*([^*]+)\*/g, '$1') // italic *text* -> text
      .replace(/~~([^~]+)~~/g, '$1'); // strikethrough ~~text~~ -> text

    // Initial fallback slug generator (DOM sync in useEffect will bind exact rehypeSlug id)
    const fallbackId = cleanText
      .toLowerCase()
      .trim()
      .replace(
        /[^\w\u4e00-\u9fa5\u3040-\u30ff\u3400-\u4dbf\u20000-\u2a6df\u2a700-\u2b73f\u2b740-\u2b81f\u2b820-\u2ceaf-]/g,
        '',
      )
      .replace(/\s+/g, '-');

    if (cleanText) {
      items.push({
        id: fallbackId,
        text: cleanText,
      });
    }
  }

  return items;
}
