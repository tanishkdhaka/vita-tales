import type { Metadata } from 'next';
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/auth';
import AdminShell from '@/components/admin/AdminShell';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  robots: {
    index: false,
    follow: false,
  },
};

async function AuthGate({ children }: { children: React.ReactNode }) {
  await connection();
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    redirect('/admin/login');
  }

  const userId = await validateSession(sessionToken);
  if (!userId) {
    redirect('/admin/login');
  }

  return <AdminShell>{children}</AdminShell>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center p-8 text-text-muted font-sans text-sm">
          Loading editorial dashboard...
        </div>
      }
    >
      <AuthGate>{children}</AuthGate>
    </Suspense>
  );
}
