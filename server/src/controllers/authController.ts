import { Request, Response } from 'express';
import crypto from 'node:crypto';
import { authService } from '../services/authService.js';
import { extractSessionToken, AuthenticatedRequest } from '../middleware/authMiddleware.js';



export const getGoogleAuthUrl = async (req: Request, res: Response) => {
  try {
    const rawDestination = typeof req.query.destination === 'string' ? req.query.destination : 'dashboard';
    const safeTabs = ['dashboard', 'simulator', 'roadmap', 'profile', 'leaderboard'];
    const destination = safeTabs.includes(rawDestination) ? rawDestination : 'dashboard';

    const isConfigured = authService.isConfigured();
    if (!isConfigured) {
      res.json({
        success: false,
        isConfigured: false,
        code: 'OAUTH_NOT_CONFIGURED',
        message: 'Google OAuth is pending configuration. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to server/.env',
        missing: authService.getMissingConfigKeys(),
      });
      return;
    }

    const state = authService.generateOAuthState(destination);
    const url = authService.generateAuthorizationUrl(state);
    res.json({
      success: true,
      isConfigured: true,
      url,
      state,
    });
  } catch (err) {
    console.error('[AuthController] getGoogleAuthUrl error:', err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Could not generate Google Auth URL',
    });
  }
};

export const handleGoogleCallback = async (req: Request, res: Response) => {
  const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

  try {
    const { code, state, error } = req.query;

    if (error) {
      console.warn('[AuthController] Google returned error:', error);
      res.redirect(`${clientOrigin}/#landing?auth_error=${encodeURIComponent(String(error))}`);
      return;
    }

    if (!code || typeof code !== 'string') {
      res.redirect(`${clientOrigin}/#landing?auth_error=missing_code`);
      return;
    }

    // Verify state
    if (!state || typeof state !== 'string') {
      res.redirect(`${clientOrigin}/#landing?auth_error=missing_state`);
      return;
    }

    const verifiedDestination = authService.verifyOAuthState(state);
    if (!verifiedDestination) {
      res.redirect(`${clientOrigin}/#landing?auth_error=invalid_state`);
      return;
    }
    const destination = verifiedDestination;

    // Exchange code for verified user claims via google-auth-library
    const googleUser = await authService.exchangeCodeForUser(code);

    // Find or create in PostgreSQL database
    const user = await authService.findOrCreateGoogleUser(googleUser);

    // Create session in PostgreSQL
    const { token, expiresAt } = await authService.createSession(user.id, req);

    // Set secure HttpOnly cookie
    res.cookie('tradewise_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    // Redirect to authenticated app experience with success indicator
    res.redirect(`${clientOrigin}/#${encodeURIComponent(destination)}?auth_success=true`);
  } catch (err) {
    console.error('[AuthController] handleGoogleCallback error:', err);
    res.redirect(`${clientOrigin}/#landing?auth_error=verification_failed`);
  }
};

export const verifyGoogleCredential = async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;

    if (!credential || typeof credential !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Google ID token (credential) is required',
      });
      return;
    }

    if (!authService.isConfigured()) {
      res.status(503).json({
        success: false,
        error: 'Google OAuth is not configured on the server. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in server/.env.',
      });
      return;
    }

    const googleUser = await authService.verifyIdToken(credential);
    if (!googleUser) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired Google identity credential',
      });
      return;
    }

    // Map to User in Neon PostgreSQL
    const user = await authService.findOrCreateGoogleUser(googleUser);

    // Create session in PostgreSQL
    const { token, expiresAt } = await authService.createSession(user.id, req);

    // Set secure HttpOnly cookie
    res.cookie('tradewise_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    res.json({
      success: true,
      token,
      data: user,
    });
  } catch (err) {
    console.error('[AuthController] verifyGoogleCredential error:', err);
    res.status(401).json({
      success: false,
      error: err instanceof Error ? err.message : 'Google authentication verification failed',
    });
  }
};


export const getSession = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const token = extractSessionToken(req);
    if (!token) {
      res.status(401).json({
        success: false,
        authenticated: false,
        message: 'No active session token found',
      });
      return;
    }

    const validated = await authService.validateSession(token);
    if (!validated) {
      res.clearCookie('tradewise_session');
      res.status(401).json({
        success: false,
        authenticated: false,
        message: 'Session has expired or was revoked',
      });
      return;
    }

    res.json({
      success: true,
      authenticated: true,
      data: validated.user,
      session: {
        id: validated.session.id,
        expiresAt: validated.session.expiresAt,
      },
    });
  } catch (err) {
    console.error('[AuthController] getSession error:', err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to query session',
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const token = extractSessionToken(req);
    if (token) {
      await authService.revokeSession(token);
    }

    res.clearCookie('tradewise_session', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    res.json({
      success: true,
      message: 'Logged out successfully. Session invalidated.',
    });
  } catch (err) {
    console.error('[AuthController] logout error:', err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Error logging out',
    });
  }
};

export const getAuthConfig = async (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      isConfigured: authService.isConfigured(),
      clientId: authService.getClientId(),
      redirectUri: authService.getRedirectUri(),
      missing: authService.getMissingConfigKeys(),
    },
  });
};

