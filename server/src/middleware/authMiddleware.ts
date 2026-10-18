import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: any;
}

/**
 * Extracts session token from cookie, Authorization header, or x-session-token header
 */
export function extractSessionToken(req: Request): string | null {
  // 1. HttpOnly Cookie
  if (req.cookies && typeof req.cookies.tradewise_session === 'string') {
    return req.cookies.tradewise_session.trim();
  }

  // 2. Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // 3. Custom Header
  const customHeader = req.headers['x-session-token'];
  if (typeof customHeader === 'string' && customHeader.trim().length > 0) {
    return customHeader.trim();
  }

  return null;
}

/**
 * Strict authentication guard middleware.
 * Rejects unauthenticated requests with 401 Unauthorized.
 */
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const token = extractSessionToken(req);

    if (!token) {
      res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Authentication session required. Please sign in with Google.',
      });
      return;
    }

    const validated = await authService.validateSession(token);
    if (!validated) {
      // Clear invalid cookie
      res.clearCookie('tradewise_session');
      res.status(401).json({
        success: false,
        code: 'SESSION_EXPIRED',
        message: 'Your session has expired. Please sign in again.',
      });
      return;
    }

    req.userId = validated.user.id;
    req.user = validated.user;
    next();
  } catch (err) {
    console.error('[AuthMiddleware] Error:', err);
    res.status(500).json({
      success: false,
      code: 'AUTH_ERROR',
      message: 'Failed to authenticate session',
    });
  }
}

import { prisma } from '../prisma.js';

/**
 * Optional authentication middleware for endpoints accessible publicly
 * but enriched if an active session exists.
 */
export async function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  try {
    const token = extractSessionToken(req);
    if (token) {
      const validated = await authService.validateSession(token);
      if (validated) {
        req.userId = validated.user.id;
        req.user = validated.user;
      }
    }
  } catch {
    // Non-blocking
  }
  next();
}

/**
 * Safely resolves the internal User ID for the request.
 * Prioritizes authenticated session token, then req.userId,
 * then x-user-id header in test environments.
 */
export async function resolveUserId(req: AuthenticatedRequest): Promise<string | null> {
  if (req.userId) return req.userId;

  const sessionToken = extractSessionToken(req);
  if (sessionToken) {
    const validated = await authService.validateSession(sessionToken);
    if (validated) return validated.user.id;
  }

  // Allow internal header spoofing strictly during automated test runs
  if (process.env.NODE_ENV === 'test') {
    const headerUserId = req.headers['x-user-id'] as string;
    if (headerUserId && headerUserId.trim().length > 0) {
      const user = await prisma.user.findUnique({ where: { id: headerUserId.trim() } });
      if (user) return user.id;
    }
    const firstUser = await prisma.user.findFirst();
    return firstUser ? firstUser.id : null;
  }

  return null;
}
