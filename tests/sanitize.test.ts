import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeArticleHtml } from '../src/lib/sanitize';

test('HTML Sanitization Suite', async (t) => {
  await t.test('strips dangerous <script> tags completely', () => {
    const input = '<p>Normal text</p><script>alert("xss")</script>';
    const output = sanitizeArticleHtml(input);
    assert.doesNotMatch(output, /<script/i);
    assert.doesNotMatch(output, /alert\(/);
    assert.match(output, /<p>Normal text<\/p>/);
  });

  await t.test('strips inline event handlers (onerror, onclick, onload)', () => {
    const input = '<img src="invalid.jpg" onerror="alert(1)" onclick="steal()" onload="hack()">';
    const output = sanitizeArticleHtml(input);
    assert.doesNotMatch(output, /onerror/i);
    assert.doesNotMatch(output, /onclick/i);
    assert.doesNotMatch(output, /onload/i);
    assert.match(output, /<img/);
  });

  await t.test('neutralizes javascript: URLs in hyperlinks', () => {
    const input = '<a href="javascript:alert(document.cookie)">Click me</a>';
    const output = sanitizeArticleHtml(input);
    assert.doesNotMatch(output, /javascript:/i);
  });

  await t.test('strips iframes, objects, and embeds', () => {
    const input = '<iframe src="https://attacker.com/evil"></iframe><object data="flash.swf"></object><embed src="bad.mov">';
    const output = sanitizeArticleHtml(input);
    assert.doesNotMatch(output, /<iframe/i);
    assert.doesNotMatch(output, /<object/i);
    assert.doesNotMatch(output, /<embed/i);
  });

  await t.test('preserves valid semantic editorial elements', () => {
    const input = `
      <h2>The Genesis</h2>
      <p>A paragraph with <strong>bold</strong>, <em>italic</em>, and <a href="https://example.com" target="_blank">link</a>.</p>
      <blockquote><p>Quote text</p><cite>Author</cite></blockquote>
      <table>
        <thead><tr><th>Col 1</th><th>Col 2</th></tr></thead>
        <tbody><tr><td>Val 1</td><td>Val 2</td></tr></tbody>
      </table>
      <ul><li>Item A</li><li>Item B</li></ul>
      <pre><code>const x = 42;</code></pre>
    `;
    const output = sanitizeArticleHtml(input);
    assert.match(output, /<h2>The Genesis<\/h2>/);
    assert.match(output, /<strong>bold<\/strong>/);
    assert.match(output, /<em>italic<\/em>/);
    assert.match(output, /<blockquote/);
    assert.match(output, /<cite>Author<\/cite>/);
    assert.match(output, /<table>/);
    assert.match(output, /<th>Col 1<\/th>/);
    assert.match(output, /<td>Val 1<\/td>/);
    assert.match(output, /<ul>/);
    assert.match(output, /<li>Item A<\/li>/);
    assert.match(output, /<pre><code>const x = 42;<\/code><\/pre>/);
    assert.match(output, /rel="noopener noreferrer"/);
  });

  await t.test('allows safe inline styles and removes dangerous properties', () => {
    const input = '<p style="text-align: center; color: #333; background-image: url(javascript:alert(1)); font-weight: bold;">Styled</p>';
    const output = sanitizeArticleHtml(input);
    assert.match(output, /text-align:\s*center/);
    assert.match(output, /font-weight:\s*bold/);
    assert.doesNotMatch(output, /background-image/i);
    assert.doesNotMatch(output, /javascript:/i);
  });
});
