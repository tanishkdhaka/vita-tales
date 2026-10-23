import test from 'node:test';
import assert from 'node:assert/strict';
import { processArticleContent } from '../src/lib/toc';

test('Table of Contents Extraction Suite', async (t) => {
  await t.test('extracts h2 and h3 headings with generated slug IDs', () => {
    const html = `
      <h2>Early Life and Foundations</h2>
      <p>Some text</p>
      <h3>The Warsaw Years</h3>
      <p>More text</p>
      <h2>Scientific Discoveries</h2>
    `;
    const { processedHtml, toc } = processArticleContent(html);

    assert.equal(toc.length, 2); // 2 top-level h2s
    assert.equal(toc[0].text, 'Early Life and Foundations');
    assert.equal(toc[0].id, 'early-life-and-foundations');
    assert.equal(toc[0].level, 2);

    // Verify h3 is nested under first h2
    assert.ok(toc[0].children && toc[0].children.length === 1);
    assert.equal(toc[0].children[0].text, 'The Warsaw Years');
    assert.equal(toc[0].children[0].id, 'the-warsaw-years');
    assert.equal(toc[0].children[0].level, 3);

    // Verify processed HTML has matching IDs injected
    assert.match(processedHtml, /id="early-life-and-foundations"/);
    assert.match(processedHtml, /id="the-warsaw-years"/);
    assert.match(processedHtml, /id="scientific-discoveries"/);
  });

  await t.test('preserves existing valid heading IDs', () => {
    const html = '<h2 id="custom-preexisting-id">Custom Heading</h2>';
    const { processedHtml, toc } = processArticleContent(html);

    assert.equal(toc[0].id, 'custom-preexisting-id');
    assert.match(processedHtml, /id="custom-preexisting-id"/);
  });

  await t.test('deterministically handles duplicate heading names', () => {
    const html = `
      <h2>Key Accomplishments</h2>
      <p>Part 1</p>
      <h2>Key Accomplishments</h2>
      <p>Part 2</p>
      <h2>Key Accomplishments</h2>
    `;
    const { processedHtml, toc } = processArticleContent(html);

    assert.equal(toc.length, 3);
    assert.equal(toc[0].id, 'key-accomplishments');
    assert.equal(toc[1].id, 'key-accomplishments-1');
    assert.equal(toc[2].id, 'key-accomplishments-2');

    assert.match(processedHtml, /id="key-accomplishments"/);
    assert.match(processedHtml, /id="key-accomplishments-1"/);
    assert.match(processedHtml, /id="key-accomplishments-2"/);
  });

  await t.test('handles Unicode and non-Latin headings correctly', () => {
    const html = `
      <h2>Uniwersytet Latający (1885)</h2>
      <h2>जीवन और उपलब्धियाँ</h2>
    `;
    const { processedHtml, toc } = processArticleContent(html);

    assert.equal(toc.length, 2);
    assert.ok(toc[0].id.length > 0);
    assert.ok(toc[1].id.length > 0);
    assert.match(processedHtml, new RegExp(`id="${toc[0].id}"`));
    assert.match(processedHtml, new RegExp(`id="${toc[1].id}"`));
  });

  await t.test('handles articles without headings gracefully with empty TOC', () => {
    const html = '<p>Just three paragraphs of continuous prose without any headings.</p><p>Second paragraph.</p>';
    const { processedHtml, toc } = processArticleContent(html);

    assert.equal(toc.length, 0);
    assert.equal(processedHtml.trim(), html.trim());
  });

  await t.test('strips inner HTML markup when generating heading text', () => {
    const html = '<h2><strong>Bolded</strong> and <em>Italicized</em> Heading</h2>';
    const { processedHtml, toc } = processArticleContent(html);

    assert.equal(toc[0].text, 'Bolded and Italicized Heading');
    assert.match(processedHtml, /<strong>Bolded<\/strong>/);
  });
});
