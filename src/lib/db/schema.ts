import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const articles = sqliteTable('articles', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  htmlContent: text('htmlContent').notNull(),
  sanitizedContent: text('sanitizedContent'),
  tocJson: text('tocJson'),
  heroImage: text('heroImage').notNull(),
  heroImageAlt: text('heroImageAlt').notNull(),
  heroSubtitle: text('heroSubtitle'),
  excerpt: text('excerpt').notNull(),
  seoTitle: text('seoTitle'),
  seoDescription: text('seoDescription'),
  canonicalUrl: text('canonicalUrl'),
  author: text('author').notNull().default('Admin'),
  category: text('category'),
  tags: text('tags'),
  readingTime: integer('readingTime'),
  featured: integer('featured').notNull().default(0),
  status: text('status', { enum: ['draft', 'published'] }).notNull().default('draft'),
  publishedAt: text('publishedAt'),
  updatedAt: text('updatedAt'),
  createdAt: text('createdAt').notNull(),
  imagePosition: text('imagePosition').notNull().default('center'),
});

export const adminUsers = sqliteTable('admin_users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('passwordHash').notNull(),
  createdAt: text('createdAt').notNull(),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => adminUsers.id, { onDelete: 'cascade' }),
  expiresAt: text('expiresAt').notNull(),
  createdAt: text('createdAt').notNull(),
});

export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
