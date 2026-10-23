'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { updateTag, revalidatePath } from 'next/cache';
import { validateSession, deleteSession, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from '@/lib/auth';
import {
  createArticle,
  updateArticle,
  deleteArticle,
  isSlugTaken,
  getArticleById,
} from '@/lib/db/queries';
import { processArticleForStorage } from '@/lib/article-processor';
import { generateSlug, validateSlug } from '@/lib/slug';

export interface ActionResult<T = unknown> {
  success?: boolean;
  error?: string;
  id?: string;
  data?: T;
}

/**
 * Validates admin session from request cookies.
 * Throws an Error if unauthorized.
 */
async function requireAuth(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    throw new Error('Unauthorized: Session not found');
  }

  const userId = await validateSession(token);
  if (!userId) {
    throw new Error('Unauthorized: Session invalid or expired');
  }

  return userId;
}

/**
 * Helper to normalize tag strings into JSON array string format.
 */
function normalizeTags(rawTags: string | null | undefined): string | null {
  if (!rawTags || !rawTags.trim()) return null;

  try {
    // If already valid JSON array
    const parsed = JSON.parse(rawTags);
    if (Array.isArray(parsed)) {
      return JSON.stringify(parsed.map((t) => String(t).trim()).filter(Boolean));
    }
  } catch {
    // Treat as comma-separated string
  }

  const tagList = rawTags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  return tagList.length > 0 ? JSON.stringify(tagList) : null;
}

/**
 * Creates a new article in the database.
 */
export async function createArticleAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    await requireAuth();

    const title = (formData.get('title')?.toString() || '').trim();
    let slug = (formData.get('slug')?.toString() || '').trim();
    const htmlContent = (formData.get('htmlContent')?.toString() || '').trim();
    const heroImage = (formData.get('heroImage')?.toString() || '').trim();
    const heroImageAlt = (formData.get('heroImageAlt')?.toString() || '').trim();
    const heroSubtitle = (formData.get('heroSubtitle')?.toString() || '').trim() || null;
    const excerpt = (formData.get('excerpt')?.toString() || '').trim();
    const imagePosition = (formData.get('imagePosition')?.toString() || '').trim() || 'center';
    const seoTitle = (formData.get('seoTitle')?.toString() || '').trim() || null;
    const seoDescription = (formData.get('seoDescription')?.toString() || '').trim() || null;
    const canonicalUrl = (formData.get('canonicalUrl')?.toString() || '').trim() || null;
    const author = (formData.get('author')?.toString() || '').trim() || 'Admin';
    const category = (formData.get('category')?.toString() || '').trim() || null;
    const rawTags = formData.get('tags')?.toString();
    const tags = normalizeTags(rawTags);
    const featuredRaw = formData.get('featured');
    const featured =
      featuredRaw === 'true' || featuredRaw === '1' || featuredRaw === 'on' ? 1 : 0;
    const rawStatus = (formData.get('status')?.toString() || '').toLowerCase();
    const status = rawStatus === 'published' ? 'published' : 'draft';

    // Required fields validation
    if (!title) {
      return { error: 'Article title is required.' };
    }
    if (!htmlContent) {
      return { error: 'Article HTML content is required.' };
    }
    if (!heroImage) {
      return { error: 'Hero image URL is required.' };
    }
    if (!heroImageAlt) {
      return { error: 'Hero image alt text is required for accessibility.' };
    }
    if (!excerpt) {
      return { error: 'Article excerpt is required.' };
    }

    // Slug validation and uniqueness
    if (!slug) {
      slug = generateSlug(title);
    } else {
      slug = generateSlug(slug);
    }

    if (!validateSlug(slug)) {
      return {
        error:
          'Invalid slug format. Slugs may only contain lowercase letters, numbers, and hyphens.',
      };
    }

    const taken = await isSlugTaken(slug);
    if (taken) {
      return { error: `Slug "${slug}" is already in use by another article.` };
    }

    // Process article HTML (sanitize, generate heading IDs, TOC json, reading time)
    const { sanitizedContent, tocJson, readingTime } = processArticleForStorage(htmlContent);

    const now = new Date().toISOString();
    const created = await createArticle({
      title,
      slug,
      htmlContent,
      sanitizedContent,
      tocJson,
      heroImage,
      heroImageAlt,
      heroSubtitle,
      excerpt,
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || excerpt,
      canonicalUrl,
      author,
      category,
      tags,
      readingTime,
      featured,
      status,
      publishedAt: status === 'published' ? now : null,
      createdAt: now,
      updatedAt: now,
      imagePosition,
    });

    // Invalidate Next.js cache tags and paths
    updateTag('articles');
    revalidatePath('/admin/articles');
    revalidatePath('/');
    if (category) {
      revalidatePath(`/category/${encodeURIComponent(category)}`);
    }

    return { success: true, id: created.id };
  } catch (err: unknown) {
    console.error('Error creating article:', err);
    return {
      error: err instanceof Error ? err.message : 'Failed to create article.',
    };
  }
}

/**
 * Updates an existing article in the database.
 */
export async function updateArticleAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    await requireAuth();

    if (!id) {
      return { error: 'Missing article ID for update.' };
    }

    const existing = await getArticleById(id);
    if (!existing) {
      return { error: 'Article not found.' };
    }

    const title = (formData.get('title')?.toString() || '').trim();
    let slug = (formData.get('slug')?.toString() || '').trim();
    const htmlContent = (formData.get('htmlContent')?.toString() || '').trim();
    const heroImage = (formData.get('heroImage')?.toString() || '').trim();
    const heroImageAlt = (formData.get('heroImageAlt')?.toString() || '').trim();
    const heroSubtitle = (formData.get('heroSubtitle')?.toString() || '').trim() || null;
    const excerpt = (formData.get('excerpt')?.toString() || '').trim();
    const imagePosition = (formData.get('imagePosition')?.toString() || '').trim() || 'center';
    const seoTitle = (formData.get('seoTitle')?.toString() || '').trim() || null;
    const seoDescription = (formData.get('seoDescription')?.toString() || '').trim() || null;
    const canonicalUrl = (formData.get('canonicalUrl')?.toString() || '').trim() || null;
    const author = (formData.get('author')?.toString() || '').trim() || 'Admin';
    const category = (formData.get('category')?.toString() || '').trim() || null;
    const rawTags = formData.get('tags')?.toString();
    const tags = normalizeTags(rawTags);
    const featuredRaw = formData.get('featured');
    const featured =
      featuredRaw === 'true' || featuredRaw === '1' || featuredRaw === 'on' ? 1 : 0;
    const rawStatus = (formData.get('status')?.toString() || '').toLowerCase();
    const status = rawStatus === 'published' ? 'published' : 'draft';

    // Required fields validation
    if (!title) {
      return { error: 'Article title is required.' };
    }
    if (!htmlContent) {
      return { error: 'Article HTML content is required.' };
    }
    if (!heroImage) {
      return { error: 'Hero image URL is required.' };
    }
    if (!heroImageAlt) {
      return { error: 'Hero image alt text is required for accessibility.' };
    }
    if (!excerpt) {
      return { error: 'Article excerpt is required.' };
    }

    // Slug validation and uniqueness (excluding current article)
    if (!slug) {
      slug = generateSlug(title);
    } else {
      slug = generateSlug(slug);
    }

    if (!validateSlug(slug)) {
      return {
        error:
          'Invalid slug format. Slugs may only contain lowercase letters, numbers, and hyphens.',
      };
    }

    const taken = await isSlugTaken(slug, id);
    if (taken) {
      return { error: `Slug "${slug}" is already in use by another article.` };
    }

    // Process article HTML
    const { sanitizedContent, tocJson, readingTime } = processArticleForStorage(htmlContent);

    const now = new Date().toISOString();
    let publishedAt = existing.publishedAt;
    if (status === 'published' && !publishedAt) {
      publishedAt = now;
    }

    await updateArticle(id, {
      title,
      slug,
      htmlContent,
      sanitizedContent,
      tocJson,
      heroImage,
      heroImageAlt,
      heroSubtitle,
      excerpt,
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || excerpt,
      canonicalUrl,
      author,
      category,
      tags,
      readingTime,
      featured,
      status,
      publishedAt,
      updatedAt: now,
      imagePosition,
    });

    // Invalidate Next.js cache tags and paths
    updateTag('articles');
    revalidatePath('/admin/articles');
    revalidatePath('/');
    revalidatePath(`/${existing.slug}`);
    if (slug !== existing.slug) {
      revalidatePath(`/${slug}`);
    }
    if (existing.category) {
      revalidatePath(`/category/${encodeURIComponent(existing.category)}`);
    }
    if (category && category !== existing.category) {
      revalidatePath(`/category/${encodeURIComponent(category)}`);
    }

    return { success: true, id };
  } catch (err: unknown) {
    console.error('Error updating article:', err);
    return {
      error: err instanceof Error ? err.message : 'Failed to update article.',
    };
  }
}

/**
 * Deletes an article from the database.
 */
export async function deleteArticleAction(id: string): Promise<ActionResult> {
  try {
    await requireAuth();

    const existing = await getArticleById(id);
    if (!existing) {
      return { error: 'Article not found.' };
    }

    await deleteArticle(id);

    // Invalidate caches
    updateTag('articles');
    revalidatePath('/admin/articles');
    revalidatePath('/');
    revalidatePath(`/${existing.slug}`);
    if (existing.category) {
      revalidatePath(`/category/${encodeURIComponent(existing.category)}`);
    }
  } catch (err: unknown) {
    console.error('Error deleting article:', err);
    return {
      error: err instanceof Error ? err.message : 'Failed to delete article.',
    };
  }

  redirect('/admin/articles');
}

/**
 * Publishes an existing article immediately.
 */
export async function publishArticleAction(id: string): Promise<ActionResult> {
  try {
    await requireAuth();

    const existing = await getArticleById(id);
    if (!existing) {
      return { error: 'Article not found.' };
    }

    const now = new Date().toISOString();
    await updateArticle(id, {
      status: 'published',
      publishedAt: existing.publishedAt || now,
      updatedAt: now,
    });

    updateTag('articles');
    revalidatePath('/admin/articles');
    revalidatePath('/');
    revalidatePath(`/${existing.slug}`);

    return { success: true };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : 'Failed to publish article.',
    };
  }
}

/**
 * Unpublishes an article (reverts to draft).
 */
export async function unpublishArticleAction(id: string): Promise<ActionResult> {
  try {
    await requireAuth();

    const existing = await getArticleById(id);
    if (!existing) {
      return { error: 'Article not found.' };
    }

    const now = new Date().toISOString();
    await updateArticle(id, {
      status: 'draft',
      updatedAt: now,
    });

    updateTag('articles');
    revalidatePath('/admin/articles');
    revalidatePath('/');
    revalidatePath(`/${existing.slug}`);

    return { success: true };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : 'Failed to unpublish article.',
    };
  }
}

/**
 * Checks whether a given slug is available or taken.
 */
export async function checkSlugAction(
  slug: string,
  excludeId?: string
): Promise<{ available: boolean }> {
  try {
    await requireAuth();

    const normalized = generateSlug(slug);
    if (!normalized || !validateSlug(normalized)) {
      return { available: false };
    }

    const taken = await isSlugTaken(normalized, excludeId);
    return { available: !taken };
  } catch {
    return { available: false };
  }
}

/**
 * Logs out the administrator by clearing session and redirecting.
 */
export async function logoutAction(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (token) {
      await deleteSession(token);
    }
    cookieStore.delete(SESSION_COOKIE_OPTIONS.name);
  } catch (err) {
    console.error('Logout error:', err);
  }

  redirect('/admin/login');
}
