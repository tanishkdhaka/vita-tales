import { eq, and, ne, desc, asc, isNotNull, sql, count } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from './index';
import { articles } from './schema';
import type { Article, NewArticle } from './schema';

export type { Article } from './schema';

export type CreateArticleInput = {
  id?: string;
  title: string;
  slug: string;
  htmlContent: string;
  sanitizedContent?: string | null;
  tocJson?: string | null;
  heroImage: string;
  heroImageAlt: string;
  heroSubtitle?: string | null;
  excerpt: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  author?: string;
  category?: string | null;
  tags?: string | null;
  readingTime?: number | null;
  featured?: number;
  status?: 'draft' | 'published';
  publishedAt?: string | null;
  updatedAt?: string | null;
  createdAt?: string;
  imagePosition?: string;
};

export type UpdateArticleInput = Partial<CreateArticleInput>;

export type PublishedArticleSlugItem = {
  slug: string;
  updatedAt: string | null;
  publishedAt: string | null;
  createdAt: string;
};

/**
 * Returns published articles ordered by publishedAt descending.
 * Supports pagination via limit and offset.
 */
export function getPublishedArticles(
  limit?: number,
  offset?: number
): Article[] {
  let query = db
    .select()
    .from(articles)
    .where(eq(articles.status, 'published'))
    .orderBy(desc(articles.publishedAt), desc(articles.createdAt))
    .$dynamic();

  if (typeof limit === 'number') {
    query = query.limit(limit);
  }
  if (typeof offset === 'number') {
    query = query.offset(offset);
  }

  return query.all();
}

/**
 * Returns a single published article matching the given slug, or null.
 */
export function getPublishedArticleBySlug(slug: string): Article | null {
  const result = db
    .select()
    .from(articles)
    .where(and(eq(articles.slug, slug), eq(articles.status, 'published')))
    .limit(1)
    .all();

  return result[0] ?? null;
}

/**
 * Returns featured published articles ordered by publishedAt descending.
 */
export function getFeaturedArticles(limit: number = 6): Article[] {
  return db
    .select()
    .from(articles)
    .where(and(eq(articles.status, 'published'), eq(articles.featured, 1)))
    .orderBy(desc(articles.publishedAt), desc(articles.createdAt))
    .limit(limit)
    .all();
}

/**
 * Returns published articles in a specific category ordered by publishedAt descending.
 * Supports pagination via limit and offset.
 */
export function getArticlesByCategory(
  category: string,
  limit?: number,
  offset?: number
): Article[] {
  let query = db
    .select()
    .from(articles)
    .where(and(eq(articles.status, 'published'), eq(articles.category, category)))
    .orderBy(desc(articles.publishedAt), desc(articles.createdAt))
    .$dynamic();

  if (typeof limit === 'number') {
    query = query.limit(limit);
  }
  if (typeof offset === 'number') {
    query = query.offset(offset);
  }

  return query.all();
}

/**
 * Returns related published articles in the same category, excluding the current article.
 */
export function getRelatedArticles(
  articleId: string,
  category?: string | null,
  limit: number = 4
): Article[] {
  const conditions = [
    eq(articles.status, 'published'),
    ne(articles.id, articleId),
  ];

  if (category) {
    conditions.push(eq(articles.category, category));
  }

  return db
    .select()
    .from(articles)
    .where(and(...conditions))
    .orderBy(desc(articles.publishedAt), desc(articles.createdAt))
    .limit(limit)
    .all();
}

/**
 * Returns distinct category names from all published articles.
 */
export function getAllCategories(): string[] {
  const result = db
    .selectDistinct({ category: articles.category })
    .from(articles)
    .where(and(eq(articles.status, 'published'), isNotNull(articles.category)))
    .orderBy(asc(articles.category))
    .all();

  return result
    .map((item) => item.category)
    .filter((cat): cat is string => Boolean(cat && cat.trim().length > 0));
}

/**
 * Returns all articles for admin view, ordered by createdAt descending.
 */
export function getAllArticles(): Article[] {
  return db
    .select()
    .from(articles)
    .orderBy(desc(articles.createdAt))
    .all();
}

/**
 * Returns a single article by ID (used for admin editing), or null.
 */
export function getArticleById(id: string): Article | null {
  const result = db
    .select()
    .from(articles)
    .where(eq(articles.id, id))
    .limit(1)
    .all();

  return result[0] ?? null;
}

/**
 * Inserts a new article into the database.
 */
export function createArticle(data: CreateArticleInput): Article {
  const now = new Date().toISOString();
  const id = data.id || uuidv4();
  const createdAt = data.createdAt || now;
  const updatedAt = data.updatedAt || now;
  const publishedAt =
    data.status === 'published' && !data.publishedAt ? now : data.publishedAt;

  const insertValues: NewArticle = {
    id,
    title: data.title,
    slug: data.slug,
    htmlContent: data.htmlContent,
    sanitizedContent: data.sanitizedContent ?? null,
    tocJson: data.tocJson ?? null,
    heroImage: data.heroImage,
    heroImageAlt: data.heroImageAlt,
    heroSubtitle: data.heroSubtitle ?? null,
    excerpt: data.excerpt,
    seoTitle: data.seoTitle ?? null,
    seoDescription: data.seoDescription ?? null,
    canonicalUrl: data.canonicalUrl ?? null,
    author: data.author || 'Admin',
    category: data.category ?? null,
    tags: data.tags ?? null,
    readingTime: data.readingTime ?? null,
    featured: data.featured ?? 0,
    status: data.status || 'draft',
    publishedAt: publishedAt ?? null,
    updatedAt,
    createdAt,
    imagePosition: data.imagePosition || 'center',
  };

  const [created] = db.insert(articles).values(insertValues).returning().all();
  return created;
}

/**
 * Updates an article by ID. Returns the updated article or null if not found.
 */
export function updateArticle(
  id: string,
  data: UpdateArticleInput
): Article | null {
  const now = new Date().toISOString();
  const updateValues: Partial<NewArticle> = {
    ...data,
    updatedAt: data.updatedAt || now,
  };

  // If status is updated to published and publishedAt is not yet set, set it now
  if (data.status === 'published' && data.publishedAt === undefined) {
    const existing = getArticleById(id);
    if (existing && !existing.publishedAt) {
      updateValues.publishedAt = now;
    }
  }

  const [updated] = db
    .update(articles)
    .set(updateValues)
    .where(eq(articles.id, id))
    .returning()
    .all();

  return updated ?? null;
}

/**
 * Deletes an article by ID. Returns true if deleted, false otherwise.
 */
export function deleteArticle(id: string): boolean {
  const [deleted] = db
    .delete(articles)
    .where(eq(articles.id, id))
    .returning({ id: articles.id })
    .all();

  return Boolean(deleted);
}

/**
 * Checks if a slug is already taken by another article.
 * Optional excludeId avoids false positives when updating an existing article.
 */
export function isSlugTaken(slug: string, excludeId?: string): boolean {
  const conditions = [eq(articles.slug, slug)];
  if (excludeId) {
    conditions.push(ne(articles.id, excludeId));
  }

  const result = db
    .select({ id: articles.id })
    .from(articles)
    .where(and(...conditions))
    .limit(1)
    .all();

  return result.length > 0;
}

/**
 * Returns slugs, timestamps, and metadata of all published articles for sitemap generation.
 */
export function getPublishedArticleSlugs(): PublishedArticleSlugItem[] {
  return db
    .select({
      slug: articles.slug,
      updatedAt: articles.updatedAt,
      publishedAt: articles.publishedAt,
      createdAt: articles.createdAt,
    })
    .from(articles)
    .where(eq(articles.status, 'published'))
    .orderBy(desc(articles.publishedAt))
    .all();
}

/**
 * Returns the total count of published articles.
 */
export function getPublishedArticleCount(): number {
  const result = db
    .select({ total: count() })
    .from(articles)
    .where(eq(articles.status, 'published'))
    .all();

  return result[0]?.total ?? 0;
}

/**
 * Returns published articles matching a tag inside the JSON array string.
 * Supports pagination via limit and offset.
 */
export function getArticlesByTag(
  tag: string,
  limit?: number,
  offset?: number
): Article[] {
  const normalizedTag = tag.trim().toLowerCase();

  // Check using SQLite json_each when valid JSON array, with LIKE fallback
  const tagCondition = sql`(
    (${articles.tags} IS NOT NULL AND json_valid(${articles.tags}) = 1 AND EXISTS (
      SELECT 1 FROM json_each(${articles.tags}) WHERE LOWER(value) = ${normalizedTag}
    ))
    OR LOWER(${articles.tags}) LIKE ${`%"${normalizedTag}"%`}
  )`;

  let query = db
    .select()
    .from(articles)
    .where(and(eq(articles.status, 'published'), tagCondition))
    .orderBy(desc(articles.publishedAt), desc(articles.createdAt))
    .$dynamic();

  if (typeof limit === 'number') {
    query = query.limit(limit);
  }
  if (typeof offset === 'number') {
    query = query.offset(offset);
  }

  return query.all();
}
