/**
 * Converts a title to a URL-safe slug:
 * - Normalizes unicode characters
 * - Converts to lowercase
 * - Strips special characters
 * - Replaces whitespace/punctuation with single hyphens
 * - Trims leading and trailing hyphens
 */
export function generateSlug(title: string): string {
  if (!title || typeof title !== 'string') {
    return '';
  }

  return title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Validates whether a slug matches URL-safe format:
 * - Lowercase alphanumeric characters
 * - Separated by single hyphens
 * - No leading or trailing hyphens
 */
export function validateSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') {
    return false;
  }

  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
