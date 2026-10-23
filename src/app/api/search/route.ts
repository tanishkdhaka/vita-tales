import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { articles } from '@/lib/db/schema';
import { eq, and, or, like } from 'drizzle-orm';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() || '';

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const queryPattern = `%${q}%`;

  try {
    // Single compound SQL query with status filtering and limit at the database engine level (O(1) query)
    const results = db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        category: articles.category,
        readingTime: articles.readingTime,
        publishedAt: articles.publishedAt,
      })
      .from(articles)
      .where(
        and(
          eq(articles.status, 'published'),
          or(
            like(articles.title, queryPattern),
            like(articles.excerpt, queryPattern),
            like(articles.category, queryPattern)
          )
        )
      )
      .limit(8)
      .all();

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ results: [] });
  }
}
