import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSlug, validateSlug } from '../src/lib/slug';

test('Slug Generation & Validation Suite', async (t) => {
  await t.test('generates lowercase URL-safe slug from title', () => {
    assert.equal(generateSlug('Marie Curie: Pioneer of Radioactivity'), 'marie-curie-pioneer-of-radioactivity');
  });

  await t.test('strips special characters and collapses multiple hyphens', () => {
    assert.equal(generateSlug('Satya Nadella — Architect of Microsoft’s Renaissance!'), 'satya-nadella-architect-of-microsoft-s-renaissance');
  });

  await t.test('validates valid slugs', () => {
    assert.equal(validateSlug('valid-slug-123'), true);
    assert.equal(validateSlug('katherine-johnson-nasa'), true);
  });

  await t.test('rejects invalid slugs with uppercase, spaces, or illegal symbols', () => {
    assert.equal(validateSlug('Invalid Slug'), false);
    assert.equal(validateSlug('slug_with_underscores'), false);
    assert.equal(validateSlug('-leading-hyphen'), false);
    assert.equal(validateSlug('trailing-hyphen-'), false);
    assert.equal(validateSlug('slug--double-hyphen'), false);
  });
});
