/**
 * Deterministically hashes a string (e.g. comment ID) into a short base36 hash string
 * using 32-bit FNV-1a algorithm to avoid exposing database IDs in URLs/anchors.
 */
export function hashCommentId(id: string): string {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

/**
 * Returns the HTML anchor ID string for a comment, e.g. "comment-k8f2a9"
 */
export function getCommentAnchor(id: string): string {
  return hashCommentId(id);
}

/**
 * Formats a comment timestamp into relative/human-friendly dates:
 * - Today (<1 hour): "1 小时内" / "Within 1 hour"
 * - Today (>=1 hour): "x 小时前" / "x hours ago"
 * - Yesterday: "昨天" / "Yesterday"
 * - Day before yesterday: "前天" / "2 days ago"
 * - Older: Full date string e.g. "2026年8月21日" / "Aug 21, 2026"
 */
export function formatCommentDate(dateInput: Date | string, locale = 'zh'): string {
  const d = new Date(dateInput);
  const now = new Date();

  // Reset hours to compare calendar days accurately
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfCommentDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

  const dayDiff = Math.round((startOfToday - startOfCommentDay) / (1000 * 60 * 60 * 24));
  const isZh = locale === 'zh';

  if (dayDiff === 0) {
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
      return isZh ? '1 小时内' : 'Within 1 hour';
    }
    return isZh ? `${diffHours} 小时前` : `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  }

  if (dayDiff === 1) {
    return isZh ? '昨天' : 'Yesterday';
  }

  if (dayDiff === 2) {
    return isZh ? '前天' : '2 days ago';
  }

  return d.toLocaleDateString(isZh ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
