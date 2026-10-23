import sanitizeHtml from 'sanitize-html';

export interface SanitizeOptions {
  /**
   * Base URL to resolve relative image src attributes to absolute URLs.
   * If omitted, process.env.NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_APP_URL is used if set.
   */
  baseUrl?: string;
}

/**
 * Explicit allowlist of HTML tags permitted in article content.
 */
export const ALLOWED_TAGS: string[] = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'div',
  'span',
  'section',
  'article',
  'ul',
  'ol',
  'li',
  'blockquote',
  'cite',
  'strong',
  'em',
  'b',
  'i',
  'u',
  'a',
  'table',
  'thead',
  'tbody',
  'tfoot',
  'tr',
  'th',
  'td',
  'figure',
  'figcaption',
  'img',
  'hr',
  'pre',
  'code',
  'br',
  'sup',
  'sub',
  'mark',
  'abbr',
  'details',
  'summary',
  'time',
  'address',
  'dl',
  'dt',
  'dd',
  'caption',
  'colgroup',
  'col',
];

/**
 * Allowed HTML attributes per tag and globally ('*').
 */
export const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  '*': ['class', 'id', 'style', 'lang', 'dir', 'title'],
  a: ['href', 'target', 'rel'],
  img: ['src', 'alt', 'width', 'height', 'loading'],
  td: ['colspan', 'rowspan', 'scope'],
  th: ['colspan', 'rowspan', 'scope'],
  blockquote: ['cite'],
  time: ['datetime'],
  ol: ['start', 'type', 'reversed'],
  li: ['value'],
  col: ['span'],
  colgroup: ['span'],
  details: ['open'],
};

// Safe style value patterns
const safeColorRegex =
  /^(#(?:[0-9a-f]{3,4}){1,2}|(?:rgb|hsl)a?\(\s*[\d.%\s,/+-]+\s*\)|[a-z]+)$/i;
const safeTextAlignRegex = /^(left|right|center|justify|start|end)$/i;
const safeFontWeightRegex = /^(normal|bold|bolder|lighter|[1-9]00)$/i;
const safeFontStyleRegex = /^(normal|italic|oblique)$/i;
const safeTextDecorationRegex =
  /^(none|underline|line-through|overline)(?:\s+(?:solid|double|dotted|dashed|wavy))?(?:\s+(?:#(?:[0-9a-f]{3,4}){1,2}|[a-z]+))?$/i;
const safeMultiDimensionRegex =
  /^(?:(?:\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|ch|pt)?|auto|0)\s*){1,4}$/i;
const safeDimensionRegex =
  /^(?:\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|ch|pt)?|auto|fit-content|max-content|min-content|0|none)$/i;
const safeBorderRegex =
  /^(none|hidden|0|(?:\d+(?:\.\d+)?(?:px|em|rem|pt)?\s+)?(solid|dashed|dotted|double|groove|ridge|inset|outset)(?:\s+(?:#(?:[0-9a-f]{3,4}){1,2}|(?:rgb|hsl)a?\([^)]+\)|[a-z]+))?)$/i;

/**
 * Safe inline CSS style properties allowlist.
 */
export const ALLOWED_STYLES: sanitizeHtml.IOptions['allowedStyles'] = {
  '*': {
    color: [safeColorRegex],
    'background-color': [safeColorRegex],
    'text-align': [safeTextAlignRegex],
    'font-weight': [safeFontWeightRegex],
    'font-style': [safeFontStyleRegex],
    'text-decoration': [safeTextDecorationRegex],
    margin: [safeMultiDimensionRegex],
    padding: [safeMultiDimensionRegex],
    border: [safeBorderRegex],
    width: [safeDimensionRegex],
    'max-width': [safeDimensionRegex],
    height: [safeDimensionRegex],
  },
};

/**
 * Resolves an image URL:
 * - Keeps safe http/https URLs and data:image URLs
 * - Transforms protocol-relative URLs (//) to https://
 * - Converts relative paths to absolute URLs if baseUrl is provided
 * - Strips dangerous protocols (e.g. javascript:, data:text/html)
 */
function resolveImageSrc(src: string, baseUrl?: string): string | undefined {
  const trimmed = src.trim();
  if (!trimmed) {
    return undefined;
  }

  // Reject javascript: or other script protocols
  if (/^javascript:/i.test(trimmed)) {
    return undefined;
  }

  // Handle data: URIs - allow data:image/ only
  if (/^data:/i.test(trimmed)) {
    if (
      /^data:image\/(?:png|jpeg|jpg|webp|gif|svg\+xml|avif|bmp);base64,/i.test(
        trimmed
      )
    ) {
      return trimmed;
    }
    return undefined;
  }

  // Protocol-relative URLs: enforce https
  if (trimmed.startsWith('//')) {
    return 'https:' + trimmed;
  }

  // Absolute http/https URLs
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Relative URLs: transform to absolute if baseUrl is available
  if (baseUrl) {
    try {
      return new URL(trimmed, baseUrl).toString();
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}

/**
 * Sanitizes article HTML using sanitize-html with strict allowlists.
 * - Strips all script tags, event handlers (on*), and javascript: URLs
 * - Strips iframes, object, embed, form, and input tags
 * - Allows only safe inline styles
 * - Transforms relative img srcs to absolute if a base URL is available
 *
 * @param rawHtml - Dirty HTML string
 * @param options - Optional sanitization options (baseUrl)
 * @returns Clean, safe HTML string
 */
export function sanitizeArticleHtml(
  rawHtml: string,
  options?: SanitizeOptions
): string {
  if (!rawHtml || typeof rawHtml !== 'string') {
    return '';
  }

  if (!rawHtml.trim()) {
    return '';
  }

  const effectiveBaseUrl =
    options?.baseUrl ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.SITE_URL;

  return sanitizeHtml(rawHtml, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedStyles: ALLOWED_STYLES,
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: {
      img: ['http', 'https', 'data'],
      blockquote: ['http', 'https'],
    },
    allowedSchemesAppliedToAttributes: ['href', 'src', 'cite'],
    allowProtocolRelative: false,
    nonTextTags: [
      'script',
      'style',
      'textarea',
      'option',
      'noscript',
      'iframe',
      'object',
      'embed',
      'template',
    ],
    disallowedTagsMode: 'discard',
    transformTags: {
      img: (tagName, attribs) => {
        if (attribs.src) {
          const resolvedSrc = resolveImageSrc(attribs.src, effectiveBaseUrl);
          if (resolvedSrc) {
            attribs.src = resolvedSrc;
          } else {
            delete attribs.src;
          }
        }
        return { tagName, attribs };
      },
      a: (tagName, attribs) => {
        if (attribs.target === '_blank') {
          const relTokens = new Set(
            (attribs.rel || '').split(/\s+/).filter(Boolean)
          );
          relTokens.add('noopener');
          relTokens.add('noreferrer');
          attribs.rel = Array.from(relTokens).join(' ');
        }
        return { tagName, attribs };
      },
    },
  });
}
