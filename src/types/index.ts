import type {
  Article,
  NewArticle,
  AdminUser,
  NewAdminUser,
  Session,
  NewSession,
} from '@/lib/db/schema';

export type { Article, NewArticle, AdminUser, NewAdminUser, Session, NewSession };

export type ArticleStatus = 'draft' | 'published';

export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export interface ArticleFormData {
  title: string;
  slug?: string;
  htmlContent: string;
  heroImage: string;
  heroImageAlt: string;
  heroSubtitle?: string;
  excerpt: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  author?: string;
  category?: string;
  tags?: string[] | string;
  readingTime?: number;
  featured?: boolean | number;
  status?: ArticleStatus;
  publishedAt?: string;
  imagePosition?: string;
}
