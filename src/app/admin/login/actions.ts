'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { adminUsers } from '@/lib/db/schema';
import {
  verifyPassword,
  createSession,
  SESSION_COOKIE_OPTIONS,
} from '@/lib/auth';

export type LoginState = {
  error?: string;
  success?: boolean;
};

// In-memory rate limiting tracker: 5 failed attempts within 15 minutes window
interface RateLimitRecord {
  count: number;
  lockedUntil: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(key: string): { allowed: boolean; waitMinutes?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record) {
    return { allowed: true };
  }

  if (record.lockedUntil > now) {
    const waitMinutes = Math.ceil((record.lockedUntil - now) / 60000);
    return { allowed: false, waitMinutes };
  }

  if (record.lockedUntil <= now && record.count >= MAX_FAILED_ATTEMPTS) {
    rateLimitMap.delete(key);
    return { allowed: true };
  }

  return { allowed: true };
}

function recordFailedAttempt(key: string): void {
  const now = Date.now();
  const record = rateLimitMap.get(key) || { count: 0, lockedUntil: 0 };
  record.count += 1;

  if (record.count >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
  }

  rateLimitMap.set(key, record);
}

function clearRateLimit(key: string): void {
  rateLimitMap.delete(key);
}

export async function loginAction(
  prevState: LoginState | FormData | null | undefined,
  formDataPayload?: FormData
): Promise<LoginState> {
  const formData =
    formDataPayload instanceof FormData
      ? formDataPayload
      : prevState instanceof FormData
      ? prevState
      : null;

  if (!formData) {
    return { error: 'Invalid submission data.' };
  }

  const username = (formData.get('username')?.toString() || '').trim();
  const password = formData.get('password')?.toString() || '';
  const redirectParam = formData.get('redirect')?.toString();

  if (!username || !password) {
    return { error: 'Please enter both username and password.' };
  }

  // Derive client identifier for rate-limiting (IP or username fallback)
  const headersList = await headers();
  const clientIp =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip') ||
    'local';
  const rateLimitKey = `${clientIp}:${username.toLowerCase()}`;

  const rateCheck = checkRateLimit(rateLimitKey);
  if (!rateCheck.allowed) {
    return {
      error: `Too many failed login attempts. Please try again in ${rateCheck.waitMinutes} minute(s).`,
    };
  }

  // Look up user in database
  const [user] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.username, username))
    .limit(1);

  if (!user) {
    recordFailedAttempt(rateLimitKey);
    return { error: 'Invalid username or password.' };
  }

  // Verify bcrypt password hash
  const isMatch = await verifyPassword(password, user.passwordHash);
  if (!isMatch) {
    recordFailedAttempt(rateLimitKey);
    return { error: 'Invalid username or password.' };
  }

  // Successful authentication - reset rate limit
  clearRateLimit(rateLimitKey);

  // Create session and set HTTP-only cookie
  const token = await createSession(user.id);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_OPTIONS.name, token, SESSION_COOKIE_OPTIONS);

  // Target redirect destination
  const safeRedirect =
    redirectParam &&
    redirectParam.startsWith('/admin') &&
    !redirectParam.startsWith('/admin/login')
      ? redirectParam
      : '/admin/articles';

  redirect(safeRedirect);
}
