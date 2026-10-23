interface ArticleBodyProps {
  content: string | null | undefined;
  className?: string;
}

/**
 * Ensures any <table> element is wrapped inside a responsive container (.table-wrapper)
 * for horizontal scrolling on mobile viewports.
 */
function wrapTablesInContainers(html: string): string {
  if (!html || !html.includes('<table')) return html;

  // If already wrapped in table-wrapper, don't duplicate
  return html.replace(
    /(<table\b[^>]*>[\s\S]*?<\/table>)/gi,
    (match) => {
      return `<div class="table-wrapper">${match}</div>`;
    }
  );
}

export default function ArticleBody({
  content,
  className = '',
}: ArticleBodyProps) {
  if (!content) return null;

  const html = wrapTablesInContainers(content);

  return (
    <div
      id="article-content"
      className={`article-content max-w-reading mx-auto w-full ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
