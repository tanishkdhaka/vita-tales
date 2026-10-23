import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  variant?: 'light' | 'dark';
}

export default function Breadcrumbs({
  items,
  className = '',
  variant = 'light',
}: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => {
      const fullUrl = item.href
        ? item.href.startsWith('http')
          ? item.href
          : `${siteUrl}${item.href}`
        : undefined;

      return {
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
        ...(fullUrl ? { item: fullUrl } : {}),
      };
    }),
  };

  const isDark = variant === 'dark';
  const textColor = isDark ? 'text-white/70' : 'text-text-muted';
  const activeColor = isDark ? 'text-white font-medium' : 'text-text-primary font-medium';
  const hoverColor = isDark ? 'hover:text-white' : 'hover:text-brass-700 dark:hover:text-brass-300';
  const sepColor = isDark ? 'text-white/40' : 'text-text-muted/60';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center text-xs tracking-wide ${className}`}
      >
        <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={`${item.label}-${index}`} className="flex items-center gap-1.5 sm:gap-2">
                {index > 0 && (
                  <span className={`select-none ${sepColor}`} aria-hidden="true">
                    /
                  </span>
                )}
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className={`transition-colors underline-offset-2 hover:underline ${textColor} ${hoverColor}`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={`truncate max-w-[200px] sm:max-w-xs ${activeColor}`}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
