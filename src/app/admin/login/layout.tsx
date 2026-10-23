import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Admin Login',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteName = process.env.SITE_NAME || 'Biography Stories';

  return (
    <div className="min-h-screen bg-surface-alt flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link
          href="/"
          className="inline-block font-serif text-3xl font-bold tracking-tight text-text-primary hover:text-brand-800 transition-colors"
        >
          {siteName}
        </Link>
        <p className="mt-2 text-sm text-text-secondary uppercase tracking-widest font-mono text-xs font-semibold">
          Editorial Control Center
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        {children}
      </div>
    </div>
  );
}
