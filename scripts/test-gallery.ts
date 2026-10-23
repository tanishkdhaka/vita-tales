import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import * as cheerio from 'cheerio';

const postsDir = path.join(process.cwd(), 'your-next-app/content/posts');
const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.md'));

let totalGalleries = 0;
let totalSingles = 0;

for (const file of files) {
  const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
  const body = content.replace(/^---[\s\S]*?---/, '').trim();
  const html = marked.parse(body) as string;
  const $ = cheerio.load(html, null, false);

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
      if ($el.is('ul, ol')) {
        const lis = $el.find('li');
        const imgs = $el.find('img');
        return lis.length > 0 && lis.length === imgs.length;
      }
      return false;
    };

    if (isImgContainer()) {
      let count = 1;
      let j = i + 1;
      while (j < children.length) {
        const nextEl = children[j];
        const $nextEl = $(nextEl);
        const isNext = () => {
          if ($nextEl.is('img')) return true;
          if ($nextEl.is('p')) {
            const imgs = $nextEl.find('img');
            return imgs.length === 1 && $nextEl.text().trim() === '';
          }
          if ($nextEl.is('ul, ol')) {
            const lis = $nextEl.find('li');
            const imgs = $nextEl.find('img');
            return lis.length > 0 && lis.length === imgs.length;
          }
          return false;
        };
        if (isNext()) {
          count++;
          j++;
        } else {
          break;
        }
      }
      if (count > 1) totalGalleries++;
      else totalSingles++;
      i = j;
    } else {
      i++;
    }
  }
}

console.log('Total galleries formed across all 47 posts:', totalGalleries);
console.log('Total standalone single photos framed:', totalSingles);
