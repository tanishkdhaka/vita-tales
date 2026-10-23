import ArticleForm from '@/components/admin/ArticleForm';

export const metadata = {
  title: 'New Article | Admin Dashboard',
};

export default function NewArticlePage() {
  return <ArticleForm action="create" />;
}
