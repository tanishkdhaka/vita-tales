import { sanitizeArticleHtml, type SanitizeOptions } from './sanitize';
import { processArticleContent, type TOCItem } from './toc';
import { calculateReadingTime } from './reading-time';

export interface ProcessedArticle {
  sanitizedContent: string;
  tocJson: string;
  readingTime: number;
}

export type ProcessArticleOptions = SanitizeOptions;

/**
 * Prepares article HTML content for persistent database storage:
 * 1. Sanitizes dirty HTML to eliminate XSS vectors and strip disallowed tags/attributes.
 * 2. Processes headings (h2, h3) to ensure unique, slug-based IDs and extracts a hierarchical TOC.
 * 3. Calculates estimated reading time in minutes.
 * 4. Serializes the TOC array to JSON string for database storage.
 *
 * This function is intended to be called on article save/storage, not on every page view.
 *
 * @param rawHtml - Raw HTML string (e.g. from rich-text editor or API input)
 * @param options - Optional configuration options (e.g. baseUrl for resolving relative image URLs)
 * @returns Object containing sanitizedContent (processed HTML with heading IDs), tocJson (serialized TOC), and readingTime
 */
export function processArticleForStorage(
  rawHtml: string,
  options?: ProcessArticleOptions
): ProcessedArticle {
  const sanitized = sanitizeArticleHtml(rawHtml, options);
  const { processedHtml, toc } = processArticleContent(sanitized);
  const readingTime = calculateReadingTime(sanitized);

  return {
    sanitizedContent: processedHtml,
    tocJson: JSON.stringify(toc),
    readingTime,
  };
}

export type { TOCItem };
