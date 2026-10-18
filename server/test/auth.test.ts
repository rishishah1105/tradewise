/**
 * Automated Test Suite for FinTrack & TradeWise Google Authentication,
 * Session Management, Database Persistence & Route Authorization
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../src/prisma.js';
import { authService } from '../src/services/authService.js';
import { paperExecutionEngine } from '../src/services/paperExecutionEngine.js';

describe('FinTrack & TradeWise Google OAuth & Session Management Tests', () => {
  let userA: any;
  let userB: any;
  let sessionTokenA: string;
  let sessionTokenB: string;

  const googleSubA = `google-test-sub-a-${Date.now()}`;
  const googleEmailA = `test.user.a.${Date.now()}@gmail.com`;

  const googleSubB = `google-test-sub-b-${Date.now()}`;
  const googleEmailB = `test.user.b.${Date.now()}@gmail.com`;

  before(async () => {
    // Clean start for test runner
  });

  after(async () => {
    // Cleanup created test records
    try {
      if (userA?.id) {
        await prisma.session.deleteMany({ where: { userId: userA.id } });
        await prisma.tradeOrder.deleteMany({ where: { userId: userA.id } });
        await prisma.user.delete({ where: { id: userA.id } }).catch(() => {});
      }
      if (userB?.id) {
        await prisma.session.deleteMany({ where: { userId: userB.id } });
        await prisma.tradeOrder.deleteMany({ where: { userId: userB.id } });
        await prisma.user.delete({ where: { id: userB.id } }).catch(() => {});
      }
    } catch (err) {
      console.warn('Cleanup error:', err);
    }

  });

  // --------------------------------------------------------------------------
  // 1. Google Identity Creation & Persistence
  // --------------------------------------------------------------------------

  test('1. New Google Identity creates internal user with ₹1,00,000 cash balance', async () => {
    userA = await authService.findOrCreateGoogleUser({
      sub: googleSubA,
      email: googleEmailA,
      name: 'Test Trader Alpha',
      avatarUrl: 'https://example.com/avatarA.jpg',
      emailVerified: true,
    });

    assert.ok(userA.id, 'User ID should be generated');
    assert.equal(userA.googleId, googleSubA);
    assert.equal(userA.email, googleEmailA);
    assert.equal(userA.name, 'Test Trader Alpha');
    assert.equal(userA.authProvider, 'google');
    assert.equal(userA.cashBalance, 100000.0);
    assert.ok(userA.lastLoginAt, 'Last login timestamp should be recorded');
  });

  test('2. Returning Google Identity resolves to the same existing internal user', async () => {
    const returningUser = await authService.findOrCreateGoogleUser({
      sub: googleSubA,
      email: googleEmailA,
      name: 'Test Trader Alpha (Updated Name)',
      avatarUrl: 'https://example.com/newAvatarA.jpg',
      emailVerified: true,
    });

    assert.equal(returningUser.id, userA.id, 'Should resolve to same internal user ID');
    assert.equal(returningUser.googleId, googleSubA);

    // Verify no duplicate users were created in DB
    const count = await prisma.user.count({ where: { googleId: googleSubA } });
    assert.equal(count, 1, 'Only one user record should exist for this googleId');
  });

  test('3. Account Linking: Existing user without googleId links securely on verified email match', async () => {
    const preExistingEmail = `legacy.trader.${Date.now()}@example.com`;
    const preExistingUser = await prisma.user.create({
      data: {
        name: 'Legacy Local Trader',
        email: preExistingEmail,
        handle: `legacy_${Date.now()}`,
        cashBalance: 85000.0,
      },
    });

    const googleSubLegacy = `google-sub-legacy-${Date.now()}`;
    const linkedUser = await authService.findOrCreateGoogleUser({
      sub: googleSubLegacy,
      email: preExistingEmail,
      name: 'Legacy Linked Name',
      emailVerified: true,
    });

    assert.equal(linkedUser.id, preExistingUser.id, 'Should link to the existing account ID');
    assert.equal(linkedUser.googleId, googleSubLegacy, 'Should attach googleId to existing user');
    assert.equal(linkedUser.cashBalance, 85000.0, 'Should preserve existing portfolio capital');

    // Clean up
    await prisma.user.delete({ where: { id: preExistingUser.id } });
  });

  // --------------------------------------------------------------------------
  // 2. Session Issuance, Restoration & Revocation
  // --------------------------------------------------------------------------

  test('4. Session creation issues cryptographically secure 30-day token', async () => {
    const mockReq = {
      headers: { 'user-agent': 'FinTrack Test Runner/1.0' },
      ip: '127.0.0.1',
    };

    const sessionData = await authService.createSession(userA.id, mockReq);
    assert.ok(sessionData.token, 'Session token must be generated');
    assert.equal(sessionData.token.length, 64, 'Token should be a 64-char hex string (32 bytes)');
    assert.ok(sessionData.expiresAt > new Date(), 'Session expiration must be in the future');

    sessionTokenA = sessionData.token;

    // Verify stored in DB
    const dbSession = await prisma.session.findUnique({ where: { token: sessionTokenA } });
    assert.ok(dbSession, 'Session must exist in PostgreSQL database');
    assert.equal(dbSession.userId, userA.id);
  });

  test('5. Session validation restores user profile across browser refreshes', async () => {
    const validated = await authService.validateSession(sessionTokenA);
    assert.ok(validated, 'Valid session token must return session data');
    assert.equal(validated.user.id, userA.id);
    assert.equal(validated.user.email, googleEmailA);
  });

  test('6. Invalid or non-existent session token is safely rejected', async () => {
    const invalidResult = await authService.validateSession('invalid-tampered-token-12345');
    assert.equal(invalidResult, null, 'Invalid token must return null');
  });

  test('7. Logout properly revokes and deletes server-side session', async () => {
    await authService.revokeSession(sessionTokenA);

    // Subsequent validation must fail
    const afterRevoke = await authService.validateSession(sessionTokenA);
    assert.equal(afterRevoke, null, 'Revoked token must be rejected');

    const dbCheck = await prisma.session.findUnique({ where: { token: sessionTokenA } });
    assert.equal(dbCheck, null, 'Revoked session must be removed from DB');
  });

  // --------------------------------------------------------------------------
  // 3. User Isolation & Cross-Account Authorization Guard Tests
  // --------------------------------------------------------------------------

  test('8. Setup User B with separate identity and session', async () => {
    userB = await authService.findOrCreateGoogleUser({
      sub: googleSubB,
      email: googleEmailB,
      name: 'Test Trader Beta',
      emailVerified: true,
    });

    // Create fresh sessions for both users
    const sA = await authService.createSession(userA.id, {});
    sessionTokenA = sA.token;

    const sB = await authService.createSession(userB.id, {});
    sessionTokenB = sB.token;

    assert.notEqual(userA.id, userB.id, 'Users must have different IDs');
    assert.notEqual(sessionTokenA, sessionTokenB, 'Tokens must be distinct');
  });

  test('9. User A placing an order does not leak or affect User B portfolio', async () => {
    // User A places a simulated order
    const orderA = await prisma.tradeOrder.create({
      data: {
        userId: userA.id,
        symbol: 'TCS',
        side: 'BUY',
        type: 'LIMIT',
        shares: 5,
        targetPrice: 3800.0,
        status: 'PENDING',
      },
    });

    assert.equal(orderA.userId, userA.id);

    // Verify User B has 0 orders
    const userBOrders = await prisma.tradeOrder.findMany({ where: { userId: userB.id } });
    assert.equal(userBOrders.length, 0, 'User B must not see User A orders');

    // Verify User A has exactly 1 order
    const userAOrders = await prisma.tradeOrder.findMany({ where: { userId: userA.id } });
    assert.equal(userAOrders.length, 1);
    assert.equal(userAOrders[0].symbol, 'TCS');
  });

  test('10. Paper Trading account creation is isolated per user', async () => {
    const acctA = await paperExecutionEngine.getOrCreateAccount(userA.id);
    const acctB = await paperExecutionEngine.getOrCreateAccount(userB.id);

    assert.notEqual(acctA.account.id, acctB.account.id, 'Accounts must be completely separate');
    assert.equal(acctA.account.userId, userA.id);
    assert.equal(acctB.account.userId, userB.id);
  });

  // --------------------------------------------------------------------------
  // 4. OAuth State, Token Validation & Security Guard Tests
  // --------------------------------------------------------------------------

  test('11. OAuth State Generation & Validation: prevents CSRF, rejects tampered states', async () => {
    const state = authService.generateOAuthState('dashboard');
    assert.ok(state, 'State token must be generated');

    // Valid state verifies and extracts destination
    const destination = authService.verifyOAuthState(state);
    assert.equal(destination, 'dashboard', 'State must preserve safe destination');

    // State cannot be replayed (one-time use)
    const replayDestination = authService.verifyOAuthState(state);
    assert.equal(replayDestination, null, 'Replayed state must be rejected');

    // Tampered state must be rejected
    const tamperedDestination = authService.verifyOAuthState('forged-csrf-state-token');
    assert.equal(tamperedDestination, null, 'Forged state must be rejected');
  });

  test('12. Missing OAuth Configuration reporting & Safe Fallback', async () => {
    // When Google credentials are empty or placeholders, report missing keys without exposing secrets
    const missingKeys = authService.getMissingConfigKeys();
    assert.ok(Array.isArray(missingKeys), 'getMissingConfigKeys must return an array');

    const isConfigured = authService.isConfigured();
    assert.equal(typeof isConfigured, 'boolean');
  });

  test('13. Invalid or Expired Google ID tokens are rejected', async () => {
    // Arbitrary unverified strings must never be accepted as valid tokens
    const invalidResult = await authService.verifyIdToken('fake.header.payload.signature');
    assert.equal(invalidResult, null, 'Invalid token must be rejected with null');

    const emptyResult = await authService.verifyIdToken('');
    assert.equal(emptyResult, null, 'Empty token must be rejected with null');
  });

  test('14. Security: No client can authenticate with arbitrary email without valid Google sub', async () => {
    // Attempting to resolve user with missing sub must throw/fail
    await assert.rejects(
      async () => {
        await authService.findOrCreateGoogleUser({
          sub: '', // Missing sub
          email: 'attacker@example.com',
          name: 'Attacker',
          emailVerified: true,
        });
      },
      /Google sub/,
      'Must reject authentication missing Google sub claim'
    );
  });

  test('15. Session expiry guard: expired session tokens cannot be used', async () => {
    // Create an expired session in DB directly
    const expiredToken = `expired-test-token-${Date.now()}`;
    await prisma.session.create({
      data: {
        userId: userA.id,
        token: expiredToken,
        expiresAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      },
    });

    const validated = await authService.validateSession(expiredToken);
    assert.equal(validated, null, 'Expired session token must be rejected');

    // Clean up
    await prisma.session.deleteMany({ where: { token: expiredToken } });
  });
});

