import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { sqlite } from './index';

// Attempt to load .env.local or .env when running as standalone script
if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile('.env.local');
  } catch {
    try {
      process.loadEnvFile('.env');
    } catch {
      // Ignore if files do not exist
    }
  }
}

export function runMigrations(): { success: boolean; adminCreated: boolean } {
  // 1. Create tables and indexes if they don't exist
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      htmlContent TEXT NOT NULL,
      sanitizedContent TEXT,
      tocJson TEXT,
      heroImage TEXT NOT NULL,
      heroImageAlt TEXT NOT NULL,
      heroSubtitle TEXT,
      excerpt TEXT NOT NULL,
      seoTitle TEXT,
      seoDescription TEXT,
      canonicalUrl TEXT,
      author TEXT NOT NULL DEFAULT 'Admin',
      category TEXT,
      tags TEXT,
      readingTime INTEGER,
      featured INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'draft',
      publishedAt TEXT,
      updatedAt TEXT,
      createdAt TEXT NOT NULL,
      imagePosition TEXT NOT NULL DEFAULT 'center'
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY NOT NULL,
      username TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY NOT NULL,
      userId TEXT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
      expiresAt TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
    CREATE INDEX IF NOT EXISTS idx_articles_status_publishedAt ON articles(status, publishedAt);
    CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
    CREATE INDEX IF NOT EXISTS idx_sessions_userId ON sessions(userId);
    CREATE INDEX IF NOT EXISTS idx_sessions_expiresAt ON sessions(expiresAt);
  `);

  // 2. Create the initial admin user idempotently
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'changeme123';

  const existing = sqlite
    .prepare('SELECT id, username FROM admin_users WHERE username = ?')
    .get(username) as { id: string; username: string } | undefined;

  let adminCreated = false;
  if (!existing) {
    const passwordHash = bcrypt.hashSync(password, 10);
    const id = uuidv4();
    const createdAt = new Date().toISOString();

    sqlite
      .prepare(
        'INSERT INTO admin_users (id, username, passwordHash, createdAt) VALUES (?, ?, ?, ?)'
      )
      .run(id, username, passwordHash, createdAt);

    console.log(`[migrate] Admin user '${username}' created successfully.`);
    adminCreated = true;
  } else {
    console.log(`[migrate] Admin user '${username}' already exists. Skipping creation.`);
  }

  console.log('[migrate] Database migration and initialization completed.');
  return { success: true, adminCreated };
}

// Auto-run if executed directly via CLI
if (
  process.argv[1] &&
  (process.argv[1].endsWith('migrate.ts') || process.argv[1].endsWith('migrate.js'))
) {
  try {
    runMigrations();
    process.exit(0);
  } catch (error) {
    console.error('[migrate] Migration failed:', error);
    process.exit(1);
  }
}
