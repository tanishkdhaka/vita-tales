import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateReadingTime } from '../src/lib/reading-time';

test('Reading Time Calculation Suite', async (t) => {
  await t.test('returns minimum 1 minute for short content', () => {
    assert.equal(calculateReadingTime('<p>A brief sentence.</p>'), 1);
    assert.equal(calculateReadingTime(''), 1);
  });

  await t.test('calculates accurate reading time at 200 wpm for longer articles', () => {
    // 600 words should be ~3 minutes
    const words = Array(600).fill('word').join(' ');
    const html = `<p>${words}</p>`;
    assert.equal(calculateReadingTime(html), 3);
  });

  await t.test('ignores HTML tags and attributes in word count', () => {
    const htmlWithHeavyTags = '<div class="large-container" data-id="12345"><p><span style="color:red">One two three four.</span></p></div>';
    assert.equal(calculateReadingTime(htmlWithHeavyTags), 1);
  });
});
