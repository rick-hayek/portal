export interface TocItem {
  id: string;
  text: string;
}

/**
 * Extracts Level 2 headings (## Heading) from raw Markdown text.
 * Strips code blocks and inline markdown formatting.
 * Deduplicates heading IDs with -1, -2 suffixes matching github-slugger / rehype-slug.
 */
export function extractTocItems(markdown: string): TocItem[] {
  if (!markdown) return [];

  // Remove code blocks (``` ... ```)
  const contentWithoutCodeBlocks = markdown.replace(/```[\s\S]*?```/g, '');

  const headingRegex = /^##\s+(.+)$/gm;
  const items: TocItem[] = [];
  const slugCounts = new Map<string, number>();

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

    let baseSlug = cleanText
      .toLowerCase()
      .trim()
      .replace(/[\s\p{P}\p{S}]+/gu, '-')
      .replace(/^-+|-+$/g, '');

    if (!baseSlug) baseSlug = 'heading';

    const count = slugCounts.get(baseSlug) || 0;
    slugCounts.set(baseSlug, count + 1);

    const finalId = count === 0 ? baseSlug : `${baseSlug}-${count}`;

    if (cleanText) {
      items.push({
        id: finalId,
        text: cleanText,
      });
    }
  }

  return items;
}
