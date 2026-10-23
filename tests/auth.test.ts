import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, createSession, validateSession, deleteSession } from '../src/lib/auth';
import { db } from '../src/lib/db';
import { adminUsers, sessions } from '../src/lib/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';

test('Authentication & Session Suite', async (t) => {
  const testUserId = uuidv4();
  const testUsername = `testuser_${Date.now()}`;
  const testPassword = 'SecurePassword!123';

  // Setup test user
  const hashedPassword = await hashPassword(testPassword);
  db.insert(adminUsers).values({
    id: testUserId,
    username: testUsername,
    passwordHash: hashedPassword,
    createdAt: new Date().toISOString(),
  }).run();

  await t.test('verifies correct password against hash', async () => {
    const isValid = await verifyPassword(testPassword, hashedPassword);
    assert.equal(isValid, true);
  });

  await t.test('rejects incorrect password against hash', async () => {
    const isValid = await verifyPassword('WrongPassword', hashedPassword);
    assert.equal(isValid, false);
  });

  let sessionToken = '';
  await t.test('creates and validates a session', async () => {
    sessionToken = await createSession(testUserId);
    assert.ok(sessionToken);

    const validUserId = await validateSession(sessionToken);
    assert.equal(validUserId, testUserId);
  });

  await t.test('returns null for nonexistent session token', async () => {
    const nonExistent = await validateSession('non-existent-uuid-token');
    assert.equal(nonExistent, null);
  });

  await t.test('rejects expired session and purges it from database', async () => {
    const expiredToken = uuidv4();
    const pastDate = new Date(Date.now() - 1000 * 60 * 60).toISOString();
    db.insert(sessions).values({
      id: expiredToken,
      userId: testUserId,
      expiresAt: pastDate,
      createdAt: new Date().toISOString(),
    }).run();

    const result = await validateSession(expiredToken);
    assert.equal(result, null);

    // Verify session row was removed
    const remaining = db.select().from(sessions).where(eq(sessions.id, expiredToken)).all();
    assert.equal(remaining.length, 0);
  });

  await t.test('deletes session on logout', async () => {
    await deleteSession(sessionToken);
    const result = await validateSession(sessionToken);
    assert.equal(result, null);
  });

  // Cleanup test user
  db.delete(adminUsers).where(eq(adminUsers.id, testUserId)).run();
});
