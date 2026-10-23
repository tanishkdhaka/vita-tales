import { hashPassword, verifyPassword, createSession, validateSession, deleteSession } from './src/lib/auth';
import { sqlite } from './src/lib/db';
import { generateSlug, validateSlug } from './src/lib/slug';
import { calculateReadingTime } from './src/lib/reading-time';
import {
  createArticle,
  getArticleById,
  getPublishedArticles,
  getPublishedArticleBySlug,
  getFeaturedArticles,
  getArticlesByCategory,
  getRelatedArticles,
  getAllCategories,
  getAllArticles,
  getArticlesByTag,
  isSlugTaken,
  getPublishedArticleSlugs,
  getPublishedArticleCount,
  updateArticle,
  deleteArticle,
} from './src/lib/db/queries';
import assert from 'node:assert';

async function main() {
  console.log('--- Testing Auth ---');
  const password = 'mySecretPassword123';
  const hash = await hashPassword(password);
  assert(await verifyPassword(password, hash), 'Password verify should succeed');
  assert(!(await verifyPassword('wrong', hash)), 'Wrong password should fail');

  const admin = sqlite.prepare('SELECT id FROM admin_users LIMIT 1').get() as { id: string };
  const token = await createSession(admin.id);
  assert(token, 'Session token should be generated');
  const userId = await validateSession(token);
  assert.strictEqual(userId, admin.id, 'Valid session should return userId');
  await deleteSession(token);
  assert.strictEqual(await validateSession(token), null, 'Deleted session should return null');
  console.log('✓ Auth tests passed');

  console.log('--- Testing Slug ---');
  const slug = generateSlug('Marie Curie: A Pioneer in Physics & Chemistry!');
  assert.strictEqual(slug, 'marie-curie-a-pioneer-in-physics-chemistry');
  assert(validateSlug(slug), 'Generated slug should be valid');
  assert(!validateSlug('invalid--slug'), 'Double hyphens should be invalid');
  assert(!validateSlug('-invalid'), 'Leading hyphen should be invalid');
  console.log('✓ Slug tests passed');

  console.log('--- Testing Reading Time ---');
  assert.strictEqual(calculateReadingTime(''), 1, 'Empty content min 1 min');
  assert.strictEqual(calculateReadingTime('<p>Short intro</p>'), 1, 'Short content min 1 min');
  const longText = '<p>' + new Array(420).fill('word').join(' ') + '</p>';
  assert.strictEqual(calculateReadingTime(longText), 3, '420 words should be 3 mins at 200 wpm');
  console.log('✓ Reading time tests passed');

  console.log('--- Testing Queries ---');
  const testSlug = 'albert-einstein-test-' + Date.now();
  const article = await createArticle({
    title: 'Albert Einstein',
    slug: testSlug,
    htmlContent: '<p>Albert Einstein was a theoretical physicist.</p>',
    heroImage: '/uploads/einstein.jpg',
    heroImageAlt: 'Albert Einstein photo',
    heroSubtitle: 'Father of modern physics',
    excerpt: 'Einstein revolutionized physics with relativity.',
    category: 'Physics',
    tags: JSON.stringify(['physicist', 'nobel', 'relativity']),
    status: 'published',
    featured: 1,
    readingTime: 5,
  });

  assert(article.id, 'Article should have an id');
  assert.strictEqual(article.title, 'Albert Einstein');
  assert.strictEqual(article.status, 'published');
  assert(article.publishedAt, 'Published article should have publishedAt set');

  const byId = await getArticleById(article.id);
  assert(byId, 'Should fetch article by ID');
  assert.strictEqual(byId.id, article.id);

  const bySlug = await getPublishedArticleBySlug(testSlug);
  assert(bySlug, 'Should fetch article by slug');
  assert.strictEqual(bySlug.slug, testSlug);

  const published = await getPublishedArticles(10);
  assert(published.length >= 1, 'Should return at least 1 published article');

  const featured = await getFeaturedArticles(5);
  assert(featured.some((a) => a.id === article.id), 'Should include our featured article');

  const inCategory = await getArticlesByCategory('Physics');
  assert(inCategory.some((a) => a.id === article.id), 'Should include article in Physics');

  const categories = await getAllCategories();
  assert(categories.includes('Physics'), 'Physics should be in all categories');

  const byTag = await getArticlesByTag('relativity');
  assert(byTag.some((a) => a.id === article.id), 'Should find article by tag');

  const taken = await isSlugTaken(testSlug);
  assert(taken, 'Slug should be marked as taken');
  const takenExcludeSelf = await isSlugTaken(testSlug, article.id);
  assert(!takenExcludeSelf, 'Slug should not be taken when excluding self');

  const slugs = await getPublishedArticleSlugs();
  assert(slugs.some((s) => s.slug === testSlug), 'Slug should be in published slugs');

  const count = await getPublishedArticleCount();
  assert(count >= 1, 'Published count should be >= 1');

  const updated = await updateArticle(article.id, {
    title: 'Albert Einstein (Updated)',
  });
  assert.strictEqual(updated?.title, 'Albert Einstein (Updated)');

  const related = await getRelatedArticles(article.id, 'Physics');
  assert(!related.some((a) => a.id === article.id), 'Related should not contain current article');

  const deleted = await deleteArticle(article.id);
  assert(deleted, 'Delete article should return true');
  assert.strictEqual(await getArticleById(article.id), null, 'Article should no longer exist');

  console.log('✓ All database query tests passed successfully!');
}

main().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
