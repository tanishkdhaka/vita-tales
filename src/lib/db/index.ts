import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import fs from 'node:fs';
import path from 'node:path';

const DB_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

export const DB_PATH = path.join(DB_DIR, 'biography.db');

declare global {
  var _sqliteClient: Database.Database | undefined;
  var _drizzleDb: BetterSQLite3Database<typeof schema> | undefined;
}

function initSqlite(): Database.Database {
  if (!globalThis._sqliteClient) {
    const client = new Database(DB_PATH);
    client.pragma('journal_mode = WAL');
    client.pragma('foreign_keys = ON');

    // Create tables immediately if they do not exist
    client.exec(`
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

    if (process.env.NODE_ENV !== 'production') {
      globalThis._sqliteClient = client;
    } else {
      return client;
    }
  }
  return globalThis._sqliteClient;
}

export const sqlite = initSqlite();

function initDrizzle(): BetterSQLite3Database<typeof schema> {
  if (!globalThis._drizzleDb) {
    const instance = drizzle(sqlite, { schema });
    if (process.env.NODE_ENV !== 'production') {
      globalThis._drizzleDb = instance;
    } else {
      return instance;
    }
  }
  return globalThis._drizzleDb;
}

export const db = initDrizzle();
