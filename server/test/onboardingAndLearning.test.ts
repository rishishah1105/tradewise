/**
 * Automated Test Suite for TradeWise & FinTrack
 * First-Time User Onboarding, Persistent Learning Progress,
 * Identity Isolation & Returning User Restoration
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../src/prisma.js';
import { authService } from '../src/services/authService.js';
import { completeQuiz, getLearningProgress } from '../src/controllers/learningController.js';
import { claimDailyStreak, resetAllProgress } from '../src/controllers/userController.js';

describe('First-Time User Onboarding & Persistent Learning Progress Tests', () => {
  const testSub1 = `test-google-sub-first-${Date.now()}`;
  const testEmail1 = `first.user.${Date.now()}@example.com`;

  const testSubAlpha = `test-google-sub-alpha-${Date.now()}`;
  const testEmailAlpha = `alpha.user.${Date.now()}@example.com`;

  const testSubBeta = `test-google-sub-beta-${Date.now()}`;
  const testEmailBeta = `beta.user.${Date.now()}@example.com`;

  let user1: any;
  let userAlpha: any;
  let userBeta: any;
  let sessionToken1: string;

  after(async () => {
    // Cleanup test users and their related cascade records
    const ids = [user1?.id, userAlpha?.id, userBeta?.id].filter(Boolean);
    for (const id of ids) {
      try {
        await prisma.session.deleteMany({ where: { userId: id } });
        await prisma.masteredConcept.deleteMany({ where: { userId: id } });
        await prisma.userBadge.deleteMany({ where: { userId: id } });
        await prisma.activityLog.deleteMany({ where: { userId: id } });
        await prisma.learningChallengeProgress.deleteMany({ where: { userId: id } });
        await prisma.user.delete({ where: { id } }).catch(() => {});
      } catch (e) {
        console.warn('Cleanup error:', e);
      }
    }
  });

  // --------------------------------------------------------------------------
  // Scenario 1: First-ever Google sign-in creates one account with zero XP, zero completed chapters,
  // zero roadmap progress, and no learning history
  // --------------------------------------------------------------------------
  test('Scenario 1: First-ever Google sign-in initializes clean state with 0 XP and no fake progress', async () => {
    user1 = await authService.findOrCreateGoogleUser({
      sub: testSub1,
      email: testEmail1,
      name: 'Pooja Learner',
      emailVerified: true,
    });

    assert.ok(user1.id, 'User must have a generated ID');
    assert.equal(user1.xp, 0, 'First-time user must have exactly 0 XP');
    assert.equal(user1.streak, 0, 'First-time user must have streak 0');
    assert.equal(user1.level, 1, 'First-time user starts on level 1');
    assert.equal(user1.onboardingCompleted, false, 'Onboarding must be incomplete');

    const badges = await prisma.userBadge.findMany({ where: { userId: user1.id } });
    assert.equal(badges.length, 0, 'First-time user must have 0 badges');

    const mastered = await prisma.masteredConcept.findMany({ where: { userId: user1.id } });
    assert.equal(mastered.length, 0, 'First-time user must have 0 mastered concepts');

    const activity = await prisma.activityLog.findMany({ where: { userId: user1.id } });
    assert.equal(activity.length, 0, 'First-time user must have empty activity history');
  });

  // --------------------------------------------------------------------------
  // Scenario 2: The first-time dashboard does not display "Continue Learning" or a resume lesson
  // --------------------------------------------------------------------------
  test('Scenario 2: First-time learning progress API reports zero progress, no resume lesson, and hasActivity=false', async () => {
    const sessionData = await authService.createSession(user1.id);
    sessionToken1 = sessionData.token;

    let jsonResult: any = null;
    let statusCode = 200;

    const mockReq = {
      headers: { authorization: `Bearer ${sessionToken1}` },
    } as any;

    const mockRes = {
      json: (data: any) => { jsonResult = data; },
      status: (code: number) => { statusCode = code; return mockRes; },
    } as any;

    await getLearningProgress(mockReq, mockRes);

    assert.equal(statusCode, 200);
    assert.equal(jsonResult.success, true);
    assert.equal(jsonResult.data.totalXp, 0);
    assert.equal(jsonResult.data.roadmapProgress, 0);
    assert.equal(jsonResult.data.completedLessons, 0);
    assert.equal(jsonResult.data.completedChapters, 0);
    assert.equal(jsonResult.data.lastLearnedConceptId, null, 'No last learned lesson for new user');
    assert.equal(jsonResult.data.hasActivity, false, 'hasActivity must be false so Continue Learning is hidden');
  });

  // --------------------------------------------------------------------------
  // Scenario 3: A second login by that same user preserves their account and initial state without creating duplicates
  // --------------------------------------------------------------------------
  test('Scenario 3: Repeated login by existing user preserves account without duplicate creation', async () => {
    const secondLogin = await authService.findOrCreateGoogleUser({
      sub: testSub1,
      email: testEmail1,
      name: 'Pooja Learner (Name update)',
      emailVerified: true,
    });

    assert.equal(secondLogin.id, user1.id, 'Must resolve to existing internal user ID');
    assert.equal(secondLogin.xp, 0, 'Must preserve 0 XP');
    assert.equal(secondLogin.streak, 0, 'Must preserve streak');

    const count = await prisma.user.count({ where: { googleId: testSub1 } });
    assert.equal(count, 1, 'Exactly one user record must exist in DB');
  });

  // --------------------------------------------------------------------------
  // Scenario 4: A user who completes a lesson, earns XP, and signs out retains that progress after signing back in
  // --------------------------------------------------------------------------
  test('Scenario 4: User completes lesson quiz, earns XP genuinely, signs out, and retains progress on sign back in', async () => {
    let quizResult: any = null;
    const quizReq = {
      headers: { authorization: `Bearer ${sessionToken1}` },
      body: { conceptId: 'what-is-a-stock', scorePercent: 100, xpReward: 100 },
    } as any;

    const quizRes = {
      json: (data: any) => { quizResult = data; },
      status: () => quizRes,
    } as any;

    await completeQuiz(quizReq, quizRes);

    assert.equal(quizResult.success, true);
    assert.equal(quizResult.data.earnedXP, 150, 'Earns 100 base + 50 perfect quiz bonus');
    assert.equal(quizResult.data.newXP, 150);
    assert.ok(quizResult.data.newBadgesUnlocked.includes('first-step'), 'Unlocks first-step badge genuinely');
    assert.ok(quizResult.data.newBadgesUnlocked.includes('quiz-perfectionist'), 'Unlocks quiz perfectionist');

    // Sign out (revoke session)
    await authService.revokeSession(sessionToken1);

    // Sign back in (simulates next day Google OAuth login)
    const signedBackIn = await authService.findOrCreateGoogleUser({
      sub: testSub1,
      email: testEmail1,
      name: 'Pooja Learner',
      emailVerified: true,
    });

    assert.equal(signedBackIn.id, user1.id);
    assert.equal(signedBackIn.xp, 150, 'Progress must be preserved after signing back in');
  });

  // --------------------------------------------------------------------------
  // Scenario 5: A returning user sees their actual completed chapters, XP, and valid resume lesson
  // --------------------------------------------------------------------------
  test('Scenario 5: Returning user profile endpoint returns actual saved progress and valid resume point', async () => {
    const newSession = await authService.createSession(user1.id);

    let progressResult: any = null;
    const req = { headers: { authorization: `Bearer ${newSession.token}` } } as any;
    const res = { json: (d: any) => { progressResult = d; }, status: () => res } as any;

    await getLearningProgress(req, res);

    assert.equal(progressResult.data.totalXp, 150);
    assert.equal(progressResult.data.completedLessons, 1);
    assert.equal(progressResult.data.lastLearnedConceptId, 'what-is-a-stock');
    assert.equal(progressResult.data.hasActivity, true, 'hasActivity must be true for returning user');
    assert.equal(progressResult.data.onboardingCompleted, true);

    await authService.revokeSession(newSession.token);
  });

  // --------------------------------------------------------------------------
  // Scenario 6: An existing account with no learning activity does not get fabricated progress
  // --------------------------------------------------------------------------
  test('Scenario 6: Existing account with zero activity returns unpolluted zero metrics', async () => {
    const idleSub = `test-idle-sub-${Date.now()}`;
    const idleUser = await authService.findOrCreateGoogleUser({
      sub: idleSub,
      email: `idle.${Date.now()}@test.com`,
      name: 'Idle Trader',
      emailVerified: true,
    });

    const idleSession = await authService.createSession(idleUser.id);
    const validated = await authService.validateSession(idleSession.token);

    assert.equal(validated?.user.xp, 0);
    assert.equal(validated?.user.streak, 0);
    assert.equal(validated?.user.masteredConcepts.length, 0);
    assert.equal(validated?.user.badges.length, 0);

    // Cleanup idle user
    await prisma.session.deleteMany({ where: { userId: idleUser.id } });
    await prisma.user.delete({ where: { id: idleUser.id } });
  });

  // --------------------------------------------------------------------------
  // Scenario 7: A missing progress record is initialized safely without overwriting other existing account data
  // --------------------------------------------------------------------------
  test('Scenario 7: Safe idempotent progress handling preserves cash balance and user profile', async () => {
    const userInDb = await prisma.user.findUnique({ where: { id: user1.id } });
    assert.equal(userInDb?.cashBalance, 100000.0, 'Cash balance must remain intact');
    assert.equal(userInDb?.email, testEmail1);
    assert.equal(userInDb?.xp, 150, 'Existing earned XP must not be altered');
  });

  // --------------------------------------------------------------------------
  // Scenario 8: Two different Google identities receive isolated accounts and progress
  // --------------------------------------------------------------------------
  test('Scenario 8: Two distinct Google identities receive strictly isolated accounts and progress', async () => {
    userAlpha = await authService.findOrCreateGoogleUser({
      sub: testSubAlpha,
      email: testEmailAlpha,
      name: 'Alpha Trader',
      emailVerified: true,
    });

    userBeta = await authService.findOrCreateGoogleUser({
      sub: testSubBeta,
      email: testEmailBeta,
      name: 'Beta Trader',
      emailVerified: true,
    });

    assert.notEqual(userAlpha.id, userBeta.id, 'Users must have different IDs');

    // User Alpha completes a quiz and earns 100 XP
    const sAlpha = await authService.createSession(userAlpha.id);
    await completeQuiz({
      headers: { authorization: `Bearer ${sAlpha.token}` },
      body: { conceptId: 'what-is-a-stock', scorePercent: 80, xpReward: 100 },
    } as any, { json: () => {}, status: () => ({ json: () => {} }) } as any);

    // Verify User Alpha has 100 XP and 1 mastered concept
    const alphaInDb = await prisma.user.findUnique({
      where: { id: userAlpha.id },
      include: { masteredConcepts: true },
    });
    assert.equal(alphaInDb?.xp, 100);
    assert.equal(alphaInDb?.masteredConcepts.length, 1);

    // Verify User Beta is completely untouched (0 XP, 0 concepts)
    const betaInDb = await prisma.user.findUnique({
      where: { id: userBeta.id },
      include: { masteredConcepts: true },
    });
    assert.equal(betaInDb?.xp, 0);
    assert.equal(betaInDb?.masteredConcepts.length, 0);

    await authService.revokeSession(sAlpha.token);
  });

  // --------------------------------------------------------------------------
  // Scenario 9: Switching accounts never leaks the previous user's progress
  // --------------------------------------------------------------------------
  test('Scenario 9: Switching sessions loads newly authenticated user progress with zero leakage', async () => {
    const sBeta = await authService.createSession(userBeta.id);

    let betaProgress: any = null;
    const reqB = { headers: { authorization: `Bearer ${sBeta.token}` } } as any;
    const resB = { json: (d: any) => { betaProgress = d; }, status: () => resB } as any;

    await getLearningProgress(reqB, resB);

    assert.equal(betaProgress.data.totalXp, 0, 'User Beta must have 0 XP');
    assert.equal(betaProgress.data.completedLessons, 0, 'User Beta must not see User Alpha lessons');
    assert.equal(betaProgress.data.hasActivity, false);

    await authService.revokeSession(sBeta.token);
  });

  // --------------------------------------------------------------------------
  // Scenario 10: A page refresh or repeated OAuth callback does not reset progress
  // --------------------------------------------------------------------------
  test('Scenario 10: Repeated login or OAuth refresh retains existing user progress', async () => {
    const refreshedAlpha = await authService.findOrCreateGoogleUser({
      sub: testSubAlpha,
      email: testEmailAlpha,
      name: 'Alpha Trader',
      emailVerified: true,
    });

    assert.equal(refreshedAlpha.id, userAlpha.id);
    assert.equal(refreshedAlpha.xp, 100, 'Retains previously earned 100 XP');

    const concepts = await prisma.masteredConcept.findMany({ where: { userId: userAlpha.id } });
    assert.equal(concepts.length, 1);
  });

  // --------------------------------------------------------------------------
  // Scenario 11: API responses and session lookups do not substitute hardcoded demo metrics for real progress
  // --------------------------------------------------------------------------
  test('Scenario 11: Session validation strictly returns persisted database values', async () => {
    const sAlpha = await authService.createSession(userAlpha.id);
    const validated = await authService.validateSession(sAlpha.token);

    assert.ok(validated);
    assert.equal(validated.user.xp, 100);
    assert.equal(validated.user.masteredConcepts.length, 1);
    assert.equal(validated.user.masteredConcepts[0].conceptId, 'what-is-a-stock');

    await authService.revokeSession(sAlpha.token);
  });

  // --------------------------------------------------------------------------
  // Scenario 12: Progress persistence on page reload/session validation even with 0 mastered concepts
  // (Direct regression test for the reload reset bug)
  // --------------------------------------------------------------------------
  test('Scenario 12: User earning XP/streak without mastered concepts retains progress on reload and session validation', async () => {
    const streakUserSub = `test-streak-user-${Date.now()}`;
    const streakUserEmail = `streak.${Date.now()}@example.com`;
    const streakUser = await authService.findOrCreateGoogleUser({
      sub: streakUserSub,
      email: streakUserEmail,
      name: 'Streak Learner',
      emailVerified: true,
    });

    const session = await authService.createSession(streakUser.id);

    // Claim daily streak (+50 XP, streak 1)
    let streakResult: any = null;
    const todayKey = new Date().toISOString().split('T')[0];
    const claimReq = {
      headers: { authorization: `Bearer ${session.token}` },
      body: { todayKey },
    } as any;
    const claimRes = {
      json: (d: any) => { streakResult = d; },
      status: () => claimRes,
    } as any;

    await claimDailyStreak(claimReq, claimRes);
    assert.equal(streakResult.success, true);
    assert.equal(streakResult.data.xp, 50);
    assert.equal(streakResult.data.streak, 1);

    // Simulating page reload: validateSession is called on mount
    const validated1 = await authService.validateSession(session.token);
    assert.ok(validated1);
    assert.equal(validated1.user.xp, 50, 'Page reload must preserve earned 50 XP even if mastered concepts is 0');
    assert.equal(validated1.user.streak, 1, 'Page reload must preserve streak 1 even if mastered concepts is 0');

    // Repeated reload / session check
    const validated2 = await authService.validateSession(session.token);
    assert.equal(validated2?.user.xp, 50, 'Repeated reload must never reset XP');
    assert.equal(validated2?.user.streak, 1, 'Repeated reload must never reset streak');

    // Cleanup
    await authService.revokeSession(session.token);
    await prisma.activityLog.deleteMany({ where: { userId: streakUser.id } });
    await prisma.session.deleteMany({ where: { userId: streakUser.id } });
    await prisma.user.delete({ where: { id: streakUser.id } });
  });

  // --------------------------------------------------------------------------
  // Scenario 13: Daily streak claiming is idempotent
  // --------------------------------------------------------------------------
  test('Scenario 13: Duplicate streak claim on same day does not award double XP or streak', async () => {
    const sAlpha = await authService.createSession(userAlpha.id);
    const todayKey = '2026-10-20';

    // First claim
    let res1: any = null;
    await claimDailyStreak({
      headers: { authorization: `Bearer ${sAlpha.token}` },
      body: { todayKey },
    } as any, { json: (d: any) => { res1 = d; }, status: () => ({ json: () => {} }) } as any);

    assert.equal(res1.success, true);
    const xpAfterFirstClaim = res1.data.xp;

    // Second claim on same date
    let res2: any = null;
    await claimDailyStreak({
      headers: { authorization: `Bearer ${sAlpha.token}` },
      body: { todayKey },
    } as any, { json: (d: any) => { res2 = d; }, status: () => ({ json: () => {} }) } as any);

    assert.equal(res2.success, true);
    assert.equal(res2.alreadyClaimed, true, 'Second claim must indicate alreadyClaimed');
    assert.equal(res2.data.xp, xpAfterFirstClaim, 'XP must not increase on duplicate claim');

    await authService.revokeSession(sAlpha.token);
  });

  // --------------------------------------------------------------------------
  // Scenario 14: Confirmed explicit reset resets only the requesting user
  // --------------------------------------------------------------------------
  test('Scenario 14: Confirmed explicit reset clears only requesting user progress', async () => {
    const sAlpha = await authService.createSession(userAlpha.id);

    // Verify userAlpha has XP before reset
    const beforeAlpha = await prisma.user.findUnique({ where: { id: userAlpha.id } });
    assert.ok((beforeAlpha?.xp || 0) > 0, 'User Alpha should have XP before reset');

    // Execute reset
    let resetRes: any = null;
    await resetAllProgress({
      headers: { authorization: `Bearer ${sAlpha.token}` },
    } as any, { json: (d: any) => { resetRes = d; }, status: () => ({ json: () => {} }) } as any);

    assert.equal(resetRes.success, true);

    // Check userAlpha after reset
    const afterAlpha = await prisma.user.findUnique({ where: { id: userAlpha.id } });
    assert.equal(afterAlpha?.xp, 0);
    assert.equal(afterAlpha?.streak, 0);
    assert.equal(afterAlpha?.level, 1);

    const alphaConcepts = await prisma.masteredConcept.findMany({ where: { userId: userAlpha.id } });
    assert.equal(alphaConcepts.length, 0);

    // Verify user1 is completely unaffected
    const user1InDb = await prisma.user.findUnique({ where: { id: user1.id } });
    assert.equal(user1InDb?.xp, 150, 'User 1 progress must remain intact and unaffected by Alpha reset');

    await authService.revokeSession(sAlpha.token);
  });
});
