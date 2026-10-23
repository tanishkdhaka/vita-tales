import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { eq, and, gt, lte, sql } from 'drizzle-orm';
import { db } from './db';
import { sessions } from './db/schema';

import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from './constants';

export { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS };

export const SESSION_COOKIE_OPTIONS = {
  name: SESSION_COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_MAX_AGE_SECONDS,
};

/**
 * Hashes a plaintext password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verifies a plaintext password against a bcrypt hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Creates a new session in the database for the given user ID.
 * Returns the session token.
 */
export async function createSession(userId: string): Promise<string> {
  const token = uuidv4();
  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + SESSION_MAX_AGE_SECONDS * 1000
  ).toISOString();

  await db.insert(sessions).values({
    id: token,
    userId,
    expiresAt,
    createdAt: now.toISOString(),
  });

  return token;
}

/**
 * Validates a session token. Returns userId if valid, or null if invalid or expired.
 * Automatically deletes expired sessions.
 * 
 * Uses database-level timestamp comparison to eliminate unstable Date evaluation during prerendering.
 */
export async function validateSession(token: string): Promise<string | null> {
  if (!token) return null;

  const [session] = await db
    .select({ userId: sessions.userId })
    .from(sessions)
    .where(
      and(
        eq(sessions.id, token),
        gt(sessions.expiresAt, sql`strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`)
      )
    )
    .limit(1);

  if (!session) {
    // If a session exists with this token but is expired, purge it from the database
    await db
      .delete(sessions)
      .where(
        and(
          eq(sessions.id, token),
          lte(sessions.expiresAt, sql`strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`)
        )
      );
    return null;
  }

  return session.userId;
}

/**
 * Deletes a session token from the database (logout)
 */
export async function deleteSession(token: string): Promise<void> {
  if (!token) return;
  await db.delete(sessions).where(eq(sessions.id, token));
}
