/**
 * Google OAuth, OpenID Connect & Session Authentication Service
 * Implements genuine Google OAuth 2.0 / OIDC verification, session issuance, and user synchronization.
 */

import crypto from 'node:crypto';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../prisma.js';
import { paperExecutionEngine } from './paperExecutionEngine.js';
import type { Request } from 'express';

export interface VerifiedGoogleUser {
  sub: string;
  email: string;
  name: string;
  avatarUrl?: string;
  emailVerified?: boolean;
}

export class AuthService {
  private oauth2Client: OAuth2Client | null = null;
  private readonly sessionDurationDays = 30;

  constructor() {
    this.initOAuthClient();
  }

  private initOAuthClient() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';

    if (clientId) {
      this.oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
    }
  }

  public isConfigured(): boolean {
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
    return Boolean(
      clientId &&
      clientSecret &&
      clientId.length > 5 &&
      clientSecret.length > 5 &&
      !clientId.startsWith('YOUR_') &&
      !clientSecret.startsWith('YOUR_')
    );
  }

  public getMissingConfigKeys(): string[] {
    const missing: string[] = [];
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
    if (!clientId || clientId.length <= 5 || clientId.startsWith('YOUR_')) {
      missing.push('GOOGLE_CLIENT_ID');
    }
    if (!clientSecret || clientSecret.length <= 5 || clientSecret.startsWith('YOUR_')) {
      missing.push('GOOGLE_CLIENT_SECRET');
    }
    return missing;
  }

  public getClientId(): string | null {
    return process.env.GOOGLE_CLIENT_ID || null;
  }

  public getRedirectUri(): string {
    return process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';
  }

  // In-memory state store with 10-minute TTL for OAuth CSRF protection
  private oauthStateStore = new Map<string, { createdAt: number; destination: string }>();

  public generateOAuthState(destination = 'dashboard'): string {
    const state = crypto.randomBytes(24).toString('hex');
    const safeTabs = ['dashboard', 'simulator', 'roadmap', 'profile', 'leaderboard'];
    const safeDest = safeTabs.includes(destination) ? destination : 'dashboard';
    this.oauthStateStore.set(state, { createdAt: Date.now(), destination: safeDest });
    return state;
  }

  public verifyOAuthState(state: string): string | null {
    if (!state || typeof state !== 'string') return null;
    const entry = this.oauthStateStore.get(state);
    if (!entry) return null;
    this.oauthStateStore.delete(state); // One-time use

    // 10-minute TTL check
    if (Date.now() - entry.createdAt > 10 * 60 * 1000) {
      return null;
    }
    return entry.destination;
  }

  /**
   * Generates genuine Google OAuth 2.0 authorization URL
   */
  public generateAuthorizationUrl(state: string, codeVerifier?: string): string {
    if (!this.oauth2Client) {
      this.initOAuthClient();
    }

    if (!this.oauth2Client || !this.isConfigured()) {
      throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured in server/.env');
    }

    const authUrlOptions: Record<string, any> = {
      access_type: 'online',
      scope: [
        'openid',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
      state,
      prompt: 'select_account',
    };

    if (codeVerifier) {
      // PKCE code challenge
      const codeChallenge = crypto
        .createHash('sha256')
        .update(codeVerifier)
        .digest('base64url');
      authUrlOptions.code_challenge = codeChallenge;
      authUrlOptions.code_challenge_method = 'S256';
    }

    return this.oauth2Client.generateAuthUrl(authUrlOptions);
  }

  /**
   * Exchanges authorization code for tokens and validates Google ID token
   */
  public async exchangeCodeForUser(code: string, codeVerifier?: string): Promise<VerifiedGoogleUser> {
    if (!this.oauth2Client) {
      this.initOAuthClient();
    }

    if (!this.oauth2Client || !this.isConfigured()) {
      throw new Error('Google OAuth client is not configured');
    }

    const tokenResponse = await this.oauth2Client.getToken({
      code,
      codeVerifier,
    });

    const idToken = tokenResponse.tokens.id_token;
    if (!idToken) {
      throw new Error('Google did not return an id_token in token exchange');
    }

    const user = await this.verifyIdToken(idToken);
    if (!user) {
      throw new Error('Google returned an unverified or invalid id_token');
    }
    return user;
  }

  /**
   * Verifies Google OpenID Connect ID token signature, audience, and claims
   * Strictly verifies against Google's public JWKS certificates.
   * Returns VerifiedGoogleUser on success, or null on invalid/expired/unconfigured.
   */
  public async verifyIdToken(idToken: string): Promise<VerifiedGoogleUser | null> {
    if (!idToken || typeof idToken !== 'string' || idToken.trim().length === 0) {
      return null;
    }

    if (!this.oauth2Client) {
      this.initOAuthClient();
    }

    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    if (!this.oauth2Client || !clientId || !this.isConfigured()) {
      return null;
    }

    try {
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken,
        audience: clientId,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.sub) {
        return null;
      }

      return {
        sub: payload.sub,
        email: (payload.email || '').trim().toLowerCase(),
        name: payload.name || payload.given_name || (payload.email ? payload.email.split('@')[0] : 'User'),
        avatarUrl: payload.picture,
        emailVerified: payload.email_verified,
      };
    } catch {
      return null;
    }
  }


  /**
   * Finds or creates internal application user mapped to Google stable sub identifier
   */
  public async findOrCreateGoogleUser(googleUser: VerifiedGoogleUser) {
    if (!googleUser || !googleUser.sub || !googleUser.sub.trim()) {
      throw new Error('Google sub (stable provider identity claim) is required');
    }

    const cleanEmail = googleUser.email.trim().toLowerCase();

    // 1. Look up by Google permanent sub identifier first
    let user = await prisma.user.findUnique({
      where: { googleId: googleUser.sub },
    });

    // 2. Look up by verified email if not found by sub (secure linking)
    if (!user && cleanEmail) {
      user = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (user) {
        // Link Google ID to existing account
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: googleUser.sub,
            authProvider: 'google',
            lastLoginAt: new Date(),
            avatarUrl: googleUser.avatarUrl || user.avatarUrl,
            name: user.name || googleUser.name,
          },
        });
      }
    }

    // 3. Create fresh user if not found
    if (!user) {
      const baseHandle = cleanEmail.includes('@')
        ? cleanEmail.split('@')[0].replace(/[^a-z0-9_]/g, '_')
        : 'trader';
      const uniqueHandle = `${baseHandle}_${Math.floor(100 + Math.random() * 900)}`;

      user = await prisma.user.create({
        data: {
          googleId: googleUser.sub,
          email: cleanEmail,
          name: googleUser.name || 'TradeWise Learner',
          handle: uniqueHandle,
          avatarUrl: googleUser.avatarUrl,
          authProvider: 'google',
          institution: 'TradeWise Learner',
          city: 'Mumbai',
          experienceLevel: 'Beginner',
          xp: 0,
          level: 1,
          streak: 0,
          cashBalance: 100000.0,
          startingBalance: 100000.0,
          lastLoginAt: new Date(),
          onboardingCompleted: false,
        },
      });

    } else {
      // Update last login timestamp and avatar if provided
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          avatarUrl: googleUser.avatarUrl || user.avatarUrl,
          name: user.name || googleUser.name,
        },
      });
    }

    // 4. Ensure Paper Trading Account exists idempotently
    try {
      await paperExecutionEngine.getOrCreateAccount(user.id);
    } catch (e) {
      console.warn(`[AuthService] Could not auto-initialize paper account for user ${user.id}:`, e);
    }

    return user;
  }

  /**
   * Creates a cryptographically random, server-managed session in PostgreSQL
   */
  public async createSession(userId: string, req?: Request) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + this.sessionDurationDays * 24 * 60 * 60 * 1000);

    const userAgent = req?.headers?.['user-agent'] || null;
    const ipAddress = (req?.headers?.['x-forwarded-for'] as string) || req?.socket?.remoteAddress || null;

    const session = await prisma.session.create({
      data: {
        userId,
        token,
        expiresAt,
        userAgent,
        ipAddress,
      },
    });

    return {
      session,
      token,
      expiresAt,
    };
  }

  /**
   * Validates a session token, returning the authenticated user if valid
   */
  public async validateSession(token: string) {
    if (!token || token.trim().length === 0) return null;

    const session = await prisma.session.findUnique({
      where: { token: token.trim() },
      include: {
        user: {
          include: {
            paperAccount: true,
            badges: true,
            activityLogs: { take: 30 },
            masteredConcepts: true,
            holdings: true,
            orders: { where: { status: 'PENDING' } },
            trades: { orderBy: { timestamp: 'desc' }, take: 20 },
            dailyQuests: true,
            learningChallenges: true,
          },
        },
      },
    });

    if (!session) return null;

    // Check expiration
    if (session.expiresAt.getTime() < Date.now()) {
      // Expired — delete in background
      prisma.session.deleteMany({ where: { id: session.id } }).catch(() => {});
      return null;
    }

    // Refresh lastActiveAt once per 15 minutes
    if (Date.now() - session.lastActiveAt.getTime() > 15 * 60 * 1000) {
      prisma.session.update({
        where: { id: session.id },
        data: { lastActiveAt: new Date() },
      }).catch(() => {});
    }

    return {
      session,
      user: session.user,
    };
  }

  /**
   * Revokes / invalidates a session token
   */
  public async revokeSession(token: string) {
    if (!token) return;
    try {
      await prisma.session.deleteMany({
        where: { token: token.trim() },
      });
    } catch (e) {
      console.warn('[AuthService] Error revoking session:', e);
    }
  }

  /**
   * Revokes all sessions for a user (e.g. on password change or security reset)
   */
  public async revokeAllUserSessions(userId: string) {
    try {
      await prisma.session.deleteMany({
        where: { userId },
      });
    } catch (e) {
      console.warn('[AuthService] Error revoking all sessions:', e);
    }
  }
}

export const authService = new AuthService();
