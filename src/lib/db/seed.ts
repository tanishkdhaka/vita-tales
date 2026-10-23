import { runMigrations } from './migrate';
import { importAllScrapedArticles } from '../../../scripts/import-scraped-articles';

export function seedDatabase() {
  runMigrations();
  console.log('[seed] Seeding Vita Tales archival biography platform...');
  importAllScrapedArticles();
  console.log('[seed] Seeding completed successfully.');
}

if (require.main === module || process.argv[1]?.endsWith('seed.ts')) {
  seedDatabase();
}
