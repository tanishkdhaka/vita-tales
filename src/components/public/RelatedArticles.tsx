import type { Article } from '@/types';
import ArticleCard from './ArticleCard';

interface RelatedArticlesProps {
  articles: Article[];
}

export default function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (!articles || articles.length === 0) {
    return null;
  }

  const displayArticles = articles.slice(0, 3);

  return (
    <section
      aria-labelledby="related-stories-heading"
      className="w-full border-t border-border mt-16 pt-16"
    >
      <div className="mx-auto max-w-wide px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-8 gap-2">
          <h2
            id="related-stories-heading"
            className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-text-primary"
          >
            Related Stories
          </h2>
          <span className="text-xs uppercase tracking-widest text-text-muted font-sans font-semibold">
            Continue Reading
          </span>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {displayArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}
