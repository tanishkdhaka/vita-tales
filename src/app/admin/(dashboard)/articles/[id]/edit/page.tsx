import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { getArticleById } from '@/lib/db/queries';
import ArticleForm from '@/components/admin/ArticleForm';

interface EditArticlePageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: EditArticlePageProps) {
  const { id } = await params;
  const article = await getArticleById(id);

  return {
    title: article ? `Edit: ${article.title} | Admin Dashboard` : 'Article Not Found',
  };
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  await connection();
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) {
    notFound();
  }

  return <ArticleForm article={article} action="edit" />;
}
