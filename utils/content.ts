const TAG_PATTERN = /<[^>]*>/g;
const ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

/** Plain text from an HTML string (rich-text editor output). Not a sanitizer. */
export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>|<\/p>|<\/div>|<\/li>/gi, '\n')
    .replace(TAG_PATTERN, '')
    .replace(/&(?:nbsp|amp|lt|gt|quot|#39);/g, (entity) => ENTITIES[entity] ?? entity)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** True for "", whitespace, `<p><br></p>` and other markup with no text or media. */
export function isEmptyHtml(html: string | null | undefined): boolean {
  if (!html) return true;
  if (/<(img|video|iframe|embed)\b/i.test(html)) return false;
  return stripHtml(html) === '';
}

/** Plain-text excerpt of HTML content, cut at `maxLength` with an ellipsis. */
export function excerpt(html: string, maxLength = 100): string {
  const text = stripHtml(html).replace(/\s+/g, ' ');
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text;
}
