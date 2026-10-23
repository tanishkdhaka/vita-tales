import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/auth';
import LoginForm from './LoginForm';

interface LoginPageProps {
  searchParams: Promise<{
    redirect?: string;
  }>;
}

async function LoginContent({ searchParams }: LoginPageProps) {
  await connection();
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (sessionToken) {
    const userId = await validateSession(sessionToken);
    if (userId) {
      redirect('/admin/articles');
    }
  }

  const resolvedSearchParams = await searchParams;

  return <LoginForm redirectUrl={resolvedSearchParams?.redirect} />;
}

export default function AdminLoginPage(props: LoginPageProps) {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-border bg-surface p-8 shadow-sm text-center text-text-muted text-sm">
          Loading login form...
        </div>
      }
    >
      <LoginContent {...props} />
    </Suspense>
  );
}
