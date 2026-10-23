import * as cheerio from 'cheerio';

export interface TOCItem {
  id: string;
  text: string;
  level: number;
  children?: TOCItem[];
}

export interface ProcessArticleContentResult {
  processedHtml: string;
  toc: TOCItem[];
}

/**
 * Generates a URL-safe, deterministic slug from heading text:
 * - Preserves Unicode letters, numbers, and combining marks across all languages
 * - Converts to lowercase
 * - Strips punctuation and symbols
 * - Converts whitespace and underscores to single hyphens
 * - Collapses consecutive hyphens and trims leading/trailing hyphens
 * - Caps maximum length to 100 characters at clean boundaries
 */
export function slugifyHeading(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  let slug = text
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}\s-]/gu, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (slug.length > 100) {
    slug = slug.substring(0, 100).replace(/-+$/, '');
  }

  return slug;
}

/**
 * Checks whether an existing id attribute is valid (non-empty and contains no whitespace).
 */
function isValidId(id: unknown): id is string {
  if (typeof id !== 'string') {
    return false;
  }
  const trimmed = id.trim();
  return trimmed.length > 0 && !/\s/.test(trimmed);
}

/**
 * Ensures deterministic, unique IDs by appending -1, -2, etc. when collisions occur.
 */
function getUniqueId(baseId: string, usedIds: Set<string>): string {
  if (!usedIds.has(baseId)) {
    usedIds.add(baseId);
    return baseId;
  }

  let counter = 1;
  while (usedIds.has(`${baseId}-${counter}`)) {
    counter++;
  }

  const uniqueId = `${baseId}-${counter}`;
  usedIds.add(uniqueId);
  return uniqueId;
}

/**
 * Processes article HTML content to extract a Table of Contents (TOC) and ensure all headings have unique IDs.
 *
 * - Finds all h2 and h3 elements in document order
 * - Preserves existing valid id attributes
 * - Generates slug-based IDs for headings without IDs
 * - Handles duplicate IDs by appending -1, -2, etc.
 * - Supports Unicode text, punctuation, and embedded HTML tags inside headings
 * - Builds a hierarchical TOC structure nesting h3s under preceding h2s
 * - Handles edge cases: empty HTML, no headings, only h3s, whitespace-only headings
 *
 * @param sanitizedHtml - The sanitized article HTML string
 * @returns Object with processed HTML (IDs added) and hierarchical TOC array
 */
export function processArticleContent(
  sanitizedHtml: string
): ProcessArticleContentResult {
  if (
    !sanitizedHtml ||
    typeof sanitizedHtml !== 'string' ||
    !sanitizedHtml.trim()
  ) {
    return {
      processedHtml: sanitizedHtml || '',
      toc: [],
    };
  }

  const $ = cheerio.load(sanitizedHtml, null, false);
  const headings = $('h2, h3');

  if (headings.length === 0) {
    return {
      processedHtml: sanitizedHtml,
      toc: [],
    };
  }

  const usedIds = new Set<string>();
  const toc: TOCItem[] = [];
  let currentH2: TOCItem | null = null;

  headings.each((_, el) => {
    const $el = $(el);
    const tagName = el.tagName ? el.tagName.toLowerCase() : 'h2';
    const level = tagName === 'h3' ? 3 : 2;

    const rawText = $el.text();
    let cleanText = rawText.trim().replace(/\s+/g, ' ');

    if (!cleanText) {
      const imgAlt = $el.find('img[alt]').first().attr('alt')?.trim();
      if (imgAlt) {
        cleanText = imgAlt;
      }
    }

    const existingId = $el.attr('id');
    let baseId: string;

    if (isValidId(existingId)) {
      baseId = existingId.trim();
    } else {
      baseId = slugifyHeading(cleanText) || 'heading';
    }

    const uniqueId = getUniqueId(baseId, usedIds);
    $el.attr('id', uniqueId);

    const item: TOCItem = {
      id: uniqueId,
      text: cleanText,
      level,
    };

    if (level === 2) {
      toc.push(item);
      currentH2 = item;
    } else if (level === 3) {
      if (currentH2) {
        if (!currentH2.children) {
          currentH2.children = [];
        }
        currentH2.children.push(item);
      } else {
        // Orphan h3 with no preceding h2 (or heading list with only h3s)
        toc.push(item);
      }
    }
  });

  return {
    processedHtml: $.html(),
    toc,
  };
}
