/**
 * Archival image shimmer placeholder utility for Vita Tales.
 * Generates lightweight base64 SVG blur placeholders for Next.js Image components,
 * eliminating visual pop-in while high-resolution assets load progressively.
 */

const shimmerSvg = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#1c1917" offset="20%" />
      <stop stop-color="#2c2724" offset="50%" />
      <stop stop-color="#1c1917" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#1c1917" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1.2s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

/**
 * Returns a data URI for an animated SVG shimmer of specified dimensions.
 */
export function getShimmerDataUrl(width = 700, height = 475): string {
  return `data:image/svg+xml;base64,${toBase64(shimmerSvg(width, height))}`;
}

/**
 * Pre-computed default blur data URL suitable for cards, hero images, and portraits.
 */
export const ARCHIVAL_BLUR_DATA_URL = getShimmerDataUrl(700, 475);
