/**
 * Calculates reading time in minutes based on HTML content:
 * - Strips script and style tags
 * - Strips HTML tags
 * - Cleans HTML entities and whitespace
 * - Counts words
 * - Assumes 200 words per minute
 * - Returns at least 1 minute
 */
export function calculateReadingTime(htmlContent: string): number {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return 1;
  }

  const text = htmlContent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-zA-Z0-9#]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) {
    return 1;
  }

  const words = text.split(/\s+/).filter(Boolean).length;
  const wordsPerMinute = 200;
  const minutes = Math.ceil(words / wordsPerMinute);

  return Math.max(1, minutes);
}
