import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createArticle,
  getArticleById,
  getPublishedArticleBySlug,
  updateArticle,
  deleteArticle,
  isSlugTaken,
  getPublishedArticles,
  getAllArticles,
  getArticlesByCategory,
} from '../src/lib/db/queries';

test('Database Articles CRUD & Filtering Suite', async (t) => {
  const uniqueSuffix = Date.now();
  const testSlug = `test-biography-${uniqueSuffix}`;
  let articleId = '';

  await t.test('creates draft article', () => {
    const created = createArticle({
      title: 'Test Article Title',
      slug: testSlug,
      htmlContent: '<p>Initial content</p>',
      sanitizedContent: '<p>Initial content</p>',
      heroImage: 'https://example.com/hero.jpg',
      heroImageAlt: 'Test Hero Image Alt',
      excerpt: 'Short summary for testing.',
      category: 'Science',
      tags: JSON.stringify(['Test', 'Science']),
      status: 'draft',
    });

    assert.ok(created.id);
    assert.equal(created.slug, testSlug);
    assert.equal(created.status, 'draft');
    articleId = created.id;
  });

  await t.test('detects taken slug accurately', () => {
    assert.equal(isSlugTaken(testSlug), true);
    // When excluding own id during update, should return false
    assert.equal(isSlugTaken(testSlug, articleId), false);
    // Unrelated slug
    assert.equal(isSlugTaken('completely-unused-slug'), false);
  });

  await t.test('draft is excluded from public queries but visible in admin queries', () => {
    const publicArticle = getPublishedArticleBySlug(testSlug);
    assert.equal(publicArticle, null);

    const adminArticle = getArticleById(articleId);
    assert.ok(adminArticle);
    assert.equal(adminArticle.title, 'Test Article Title');

    const publishedList = getPublishedArticles();
    const inPublishedList = publishedList.some((a) => a.id === articleId);
    assert.equal(inPublishedList, false);

    const allList = getAllArticles();
    const inAllList = allList.some((a) => a.id === articleId);
    assert.equal(inAllList, true);
  });

  await t.test('publishes article and verifies public query accessibility', () => {
    const updated = updateArticle(articleId, {
      status: 'published',
      publishedAt: new Date().toISOString(),
    });

    assert.ok(updated);
    assert.equal(updated.status, 'published');
    assert.ok(updated.publishedAt);

    const publicArticle = getPublishedArticleBySlug(testSlug);
    assert.ok(publicArticle);
    assert.equal(publicArticle.slug, testSlug);

    const categoryArticles = getArticlesByCategory('Science');
    const inCategory = categoryArticles.some((a) => a.id === articleId);
    assert.equal(inCategory, true);
  });

  await t.test('deletes article cleanly', () => {
    const deleted = deleteArticle(articleId);
    assert.equal(deleted, true);

    const check = getArticleById(articleId);
    assert.equal(check, null);
    assert.equal(isSlugTaken(testSlug), false);
  });
});
