import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import * as cheerio from 'cheerio';
import { db } from '../src/lib/db';
import { articles } from '../src/lib/db/schema';
import { createArticle } from '../src/lib/db/queries';
import { processArticleForStorage } from '../src/lib/article-processor';
import { runMigrations } from '../src/lib/db/migrate';

interface ScrapedFrontmatter {
  title: string;
  slug: string;
  date: string;
  updated: string;
  excerpt: string;
  author: string;
  categories: string[];
  tags: string[];
  coverImage: string;
  coverImageAlt: string;
  seoTitle: string;
  seoDescription: string;
  originalUrl: string;
  wpId?: number;
}

const FEATURED_SLUGS = new Set([
  'aman-gupta',
  'radhika-apte',
  'bhavish-aggarwal',
  'vikrant-massey',
  'shubha-tole',
  'avinash-sable',
  'meena-kandasamy',
  'jignesh-mevani',
  'sejal-kumar',
  'jim-sarbh',
  'aditi-ashok',
  'pallavi-shroff',
]);

function parseFrontmatter(fileContent: string): { frontmatter: ScrapedFrontmatter; body: string } {
  const match = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    throw new Error('Frontmatter not found in file');
  }

  const yamlBlock = match[1];
  const body = match[2].trim();

  const getField = (field: string): string => {
    const regex = new RegExp(`^${field}:\\s*(?:"([\\s\\S]*?)"|'([\\s\\S]*?)'|(.*?))$`, 'm');
    const m = yamlBlock.match(regex);
    if (!m) return '';
    return (m[1] || m[2] || m[3] || '').trim();
  };

  const getArrayField = (field: string): string[] => {
    const regex = new RegExp(`^${field}:\\s*\\[([\\s\\S]*?)\\]`, 'm');
    const m = yamlBlock.match(regex);
    if (!m) return [];
    return m[1]
      .split(',')
      .map((item) => item.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);
  };

  const frontmatter: ScrapedFrontmatter = {
    title: getField('title'),
    slug: getField('slug'),
    date: getField('date'),
    updated: getField('updated') || getField('date'),
    excerpt: getField('excerpt'),
    author: getField('author') || 'Vita Tales Team',
    categories: getArrayField('categories'),
    tags: getArrayField('tags'),
    coverImage: getField('coverImage'),
    coverImageAlt: getField('coverImageAlt') || getField('title'),
    seoTitle: getField('seoTitle') || getField('title'),
    seoDescription: getField('seoDescription') || getField('excerpt'),
    originalUrl: getField('originalUrl'),
  };

  return { frontmatter, body };
}

function cleanAndTransformHtml(rawHtml: string): string {
  const $ = cheerio.load(rawHtml, null, false);

  // 1. Clean bold/italic tags inside headings
  $('h1, h2, h3, h4').each((_, el) => {
    const $h = $(el);
    const innerStrong = $h.find('strong, b, em, i');
    if (innerStrong.length > 0) {
      $h.text($h.text().trim());
    }
  });

  // 2. Enhance tables and callout boxes
  $('table').each((_, el) => {
    const $table = $(el);
    const rows = $table.find('tr');
    const cells = $table.find('td');

    // Single-cell promo boxes from WordPress (e.g. "Also read: [link]")
    if (rows.length === 1 && cells.length === 1) {
      const cellHtml = cells.html() || '';
      if (
        cellHtml.includes('Also read') ||
        cellHtml.includes('Explore the') ||
        cellHtml.includes('href=') ||
        cellHtml.includes('Instagram')
      ) {
        $table.replaceWith(
          `<div class="editorial-callout not-prose my-6 p-4 rounded-2xl border border-brass-500/30 bg-brass-500/10 text-text-primary text-sm flex items-center gap-3">${cellHtml}</div>`
        );
        return;
      }
    }

    // Strip inline pastel background styles (dae2ed, fff2cc, etc.)
    $table.removeAttr('style');
    $table.find('td, th, tr, tbody, thead').removeAttr('style');
    $table.addClass('quick-view-table');
  });

  // 3. Remove inline mark styling and unwrap garish colors
  $('mark').each((_, el) => {
    const $mark = $(el);
    $mark.removeAttr('style');
    $mark.removeAttr('class');
  });

  // 4. Unwrap bullet list items that only contain images into top-level images
  $('ul, ol').each((_, listEl) => {
    const $list = $(listEl);
    $list.find('li').each((_, liEl) => {
      const $li = $(liEl);
      const $children = $li.children();
      if ($children.length === 1 && $children.is('img')) {
        const imgHtml = $.html($children[0]);
        $li.remove();
        $list.after(imgHtml);
      }
    });
    if ($list.children().length === 0) {
      $list.remove();
    }
  });

  // 5. Intelligent Photo Arrangement:
  // - Adjacent consecutive photos are automatically grouped into balanced 2-column or 3-column galleries
  // - Single photos are framed into elegant centered archival photo cards
  // - NO mismatched alt-text captions are printed below the images
  const children = $.root().children().toArray();
  let i = 0;

  while (i < children.length) {
    const el = children[i];
    const $el = $(el);

    const isImgContainer = () => {
      if ($el.is('img')) return true;
      if ($el.is('p')) {
        const imgs = $el.find('img');
        return imgs.length === 1 && $el.text().trim() === '';
      }
      return false;
    };

    if (isImgContainer()) {
      const group: { el: cheerio.Cheerio<any>; imgs: { src: string; alt: string }[] }[] = [];

      const getImgs = ($target: cheerio.Cheerio<any>) => {
        const res: { src: string; alt: string }[] = [];
        if ($target.is('img')) {
          res.push({ src: $target.attr('src') || '', alt: $target.attr('alt') || '' });
        } else {
          $target.find('img').each((_, img) => {
            res.push({ src: $(img).attr('src') || '', alt: $(img).attr('alt') || '' });
          });
        }
        return res;
      };

      group.push({ el: $el, imgs: getImgs($el) });

      let j = i + 1;
      while (j < children.length) {
        const nextEl = children[j];
        const $nextEl = $(nextEl);

        const isNextImg = () => {
          if ($nextEl.is('img')) return true;
          if ($nextEl.is('p')) {
            const imgs = $nextEl.find('img');
            return imgs.length === 1 && $nextEl.text().trim() === '';
          }
          return false;
        };

        if (isNextImg()) {
          group.push({ el: $nextEl, imgs: getImgs($nextEl) });
          j++;
        } else {
          break;
        }
      }

      const allImgs = group.flatMap((g) => g.imgs).filter((img) => img.src);

      if (allImgs.length === 1) {
        // Single image: centered, framed archival card (zero mismatched text)
        const { src, alt } = allImgs[0];
        const singleHtml = `<div class="editorial-photo-single my-8 sm:my-10 mx-auto text-center"><div class="inline-block overflow-hidden rounded-2xl border border-border/80 shadow-md bg-surface-alt/20 transition-all duration-300 hover:shadow-xl"><img src="${src}" alt="${alt}" loading="lazy" class="max-h-[500px] w-auto max-w-full object-contain mx-auto rounded-2xl block" /></div></div>`;
        group[0].el.replaceWith(singleHtml);
        for (let k = 1; k < group.length; k++) {
          group[k].el.remove();
        }
      } else if (allImgs.length === 2) {
        // 2 consecutive photos: 2-column diptych gallery
        const cards = allImgs
          .map(
            ({ src, alt }) =>
              `<div class="photo-card overflow-hidden rounded-2xl border border-border/80 shadow-md bg-surface-alt/30 transition-all duration-300 hover:shadow-xl hover:border-brass-500/40 aspect-[4/3] flex items-center justify-center p-1 sm:p-1.5"><img src="${src}" alt="${alt}" loading="lazy" class="w-full h-full object-cover rounded-xl block transition-transform duration-300 hover:scale-[1.02]" /></div>`
          )
          .join('');
        const galleryHtml = `<div class="editorial-gallery grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 my-8 sm:my-10">${cards}</div>`;
        group[0].el.replaceWith(galleryHtml);
        for (let k = 1; k < group.length; k++) {
          group[k].el.remove();
        }
      } else {
        // 3 or more consecutive photos: responsive grid
        const cols = allImgs.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2';
        const cards = allImgs
          .map(
            ({ src, alt }) =>
              `<div class="photo-card overflow-hidden rounded-2xl border border-border/80 shadow-md bg-surface-alt/30 transition-all duration-300 hover:shadow-xl hover:border-brass-500/40 aspect-[4/3] flex items-center justify-center p-1 sm:p-1.5"><img src="${src}" alt="${alt}" loading="lazy" class="w-full h-full object-cover rounded-xl block transition-transform duration-300 hover:scale-[1.02]" /></div>`
          )
          .join('');
        const galleryHtml = `<div class="editorial-gallery grid grid-cols-1 ${cols} gap-3.5 sm:gap-4 my-8 sm:my-10">${cards}</div>`;
        group[0].el.replaceWith(galleryHtml);
        for (let k = 1; k < group.length; k++) {
          group[k].el.remove();
        }
      }

      i = j;
    } else {
      i++;
    }
  }

  // 6. Ensure any remaining standalone images have loading="lazy"
  $('img').each((_, imgEl) => {
    const $img = $(imgEl);
    $img.attr('loading', 'lazy');
  });

  return $.html();
}

export function importAllScrapedArticles() {
  runMigrations();

  const postsDir = path.join(process.cwd(), 'your-next-app/content/posts');
  if (!fs.existsSync(postsDir)) {
    throw new Error(`Posts directory not found at: ${postsDir}`);
  }

  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.md'));
  console.log(`[import] Found ${files.length} scraped markdown articles to import.`);

  // 1. Remove all old demo articles
  console.log('[import] Removing previous demo articles from database...');
  db.delete(articles).run();
  console.log('[import] Database cleared of demo articles.');

  let importedCount = 0;

  for (const file of files) {
    const fullPath = path.join(postsDir, file);
    const content = fs.readFileSync(fullPath, 'utf8');

    try {
      const { frontmatter, body } = parseFrontmatter(content);

      // Determine clean primary category
      let primaryCategory = 'Biography';
      if (frontmatter.categories && frontmatter.categories.length > 0) {
        if (frontmatter.categories.includes('Actors')) {
          primaryCategory = 'Actors';
        } else if (frontmatter.categories.includes('Actresses')) {
          primaryCategory = 'Actresses';
        } else if (frontmatter.categories.includes('Social Media Influencer')) {
          primaryCategory = 'Social Media Influencer';
        } else {
          primaryCategory = frontmatter.categories[0];
        }
      }

      // Consolidate all tags + categories for comprehensive searchability
      const allTags = Array.from(
        new Set([
          ...frontmatter.categories,
          ...frontmatter.tags,
        ])
      );

      // Convert Markdown to clean HTML with intelligent photo arrangement
      const rawHtml = marked.parse(body) as string;
      const transformedHtml = cleanAndTransformHtml(rawHtml);

      // Process for storage (XSS sanitization, TOC extraction, reading time calculation)
      const { sanitizedContent, tocJson, readingTime } = processArticleForStorage(
        transformedHtml
      );

      const isFeatured = FEATURED_SLUGS.has(frontmatter.slug) ? 1 : 0;

      createArticle({
        title: frontmatter.title,
        slug: frontmatter.slug,
        htmlContent: transformedHtml,
        sanitizedContent,
        tocJson,
        heroImage: frontmatter.coverImage,
        heroImageAlt: frontmatter.coverImageAlt || frontmatter.title,
        heroSubtitle: frontmatter.excerpt,
        excerpt: frontmatter.excerpt,
        seoTitle: frontmatter.seoTitle || frontmatter.title,
        seoDescription: frontmatter.seoDescription || frontmatter.excerpt,
        canonicalUrl: frontmatter.originalUrl || `https://vitatales.com/${frontmatter.slug}`,
        author: frontmatter.author || 'Vita Tales Team',
        category: primaryCategory,
        tags: JSON.stringify(allTags),
        readingTime,
        featured: isFeatured,
        status: 'published',
        publishedAt: frontmatter.date || new Date().toISOString(),
        updatedAt: frontmatter.updated || frontmatter.date || new Date().toISOString(),
        createdAt: frontmatter.date || new Date().toISOString(),
        imagePosition: 'center',
      });

      importedCount++;
      console.log(
        `[import] (${importedCount}/${files.length}) Imported: "${frontmatter.title}" [${primaryCategory}] (featured: ${isFeatured}, ${readingTime}m)`
      );
    } catch (err) {
      console.error(`[import] Error processing ${file}:`, err);
    }
  }

  console.log(`\n[import] Successfully imported all ${importedCount} articles into Vita Tales database.`);
}

if (require.main === module || process.argv[1]?.endsWith('import-scraped-articles.ts')) {
  importAllScrapedArticles();
}
