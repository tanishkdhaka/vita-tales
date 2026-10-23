import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-text-primary font-sans mb-4">
          404
        </h1>
        <h2 className="text-2xl font-serif text-text-secondary mb-6">
          Page Not Found
        </h2>
        <p className="text-text-muted mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-brand-700 text-white px-6 py-3 rounded-lg hover:bg-brand-800 transition-colors font-sans text-sm font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
