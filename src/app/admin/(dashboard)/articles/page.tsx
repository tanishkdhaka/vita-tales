import Link from 'next/link';
import { connection } from 'next/server';
import { getAllArticles } from '@/lib/db/queries';
import DeleteArticleButton from '@/components/admin/DeleteArticleButton';

export const instant = false;

export const metadata = {
  title: 'Articles | Admin Dashboard',
};

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

export default async function AdminArticlesPage() {
  await connection();
  const articlesList = await getAllArticles();

  // Sort by most recently updated (or created)
  const sortedArticles = [...articlesList].sort((a, b) => {
    const timeA = new Date(a.updatedAt || a.createdAt).getTime();
    const timeB = new Date(b.updatedAt || b.createdAt).getTime();
    return timeB - timeA;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="sm:flex sm:items-center sm:justify-between pb-2 border-b border-border">
        <div>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-text-primary">
            Articles
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage all biographies, publication statuses, and editorial content.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            <span>New Article</span>
          </Link>
        </div>
      </div>

      {/* Articles Table or Empty State */}
      {sortedArticles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
          <h3 className="mt-4 text-base font-semibold text-text-primary">
            No articles published yet
          </h3>
          <p className="mt-1 text-sm text-text-secondary">
            Get started by creating your first in-depth biography.
          </p>
          <div className="mt-6">
            <Link
              href="/admin/articles/new"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-900 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              <span>Create First Article</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-xs">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-surface-alt">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-6 pr-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider"
                  >
                    Published Date
                  </th>
                  <th
                    scope="col"
                    className="relative py-3.5 pl-3 pr-6 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {sortedArticles.map((article) => {
                  const isPublished = article.status === 'published';

                  return (
                    <tr
                      key={article.id}
                      className="hover:bg-surface-alt/60 transition-colors"
                    >
                      <td className="py-4 pl-6 pr-3 text-sm">
                        <div className="font-semibold text-text-primary">
                          <Link
                            href={`/admin/articles/${article.id}/edit`}
                            className="hover:text-brand-800 hover:underline"
                          >
                            {article.title}
                          </Link>
                        </div>
                        <div className="mt-0.5 text-xs text-text-muted font-mono truncate max-w-xs sm:max-w-md">
                          /{article.slug}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        {isPublished ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-text-secondary">
                        {article.category ? (
                          <span className="inline-block rounded-md bg-surface-alt px-2 py-0.5 text-xs font-medium text-text-primary border border-border">
                            {article.category}
                          </span>
                        ) : (
                          <span className="text-text-muted text-xs">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-text-secondary">
                        {formatDate(article.publishedAt)}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/articles/${article.id}/edit`}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-brand-800 hover:bg-brand-50 hover:text-brand-900 transition-colors"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                              />
                            </svg>
                            <span>Edit</span>
                          </Link>

                          <Link
                            href={`/admin/articles/${article.id}/preview`}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-text-secondary hover:bg-surface-alt hover:text-text-primary transition-colors"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span>Preview</span>
                          </Link>

                          <DeleteArticleButton
                            articleId={article.id}
                            articleTitle={article.title}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
