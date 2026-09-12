import { getAuth, isFirebaseLive } from '../services/firebaseAdmin.js';

/**
 * Authentication & Identity Verification Middleware
 * Validates Firebase ID tokens or provides persistent guest session identities.
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const guestHeader = req.headers['x-guest-uid'];

  // 1. Check for standard Bearer Token
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1];

    if (isFirebaseLive()) {
      try {
        const auth = getAuth();
        const decoded = await auth.verifyIdToken(token);
        req.user = {
          uid: decoded.uid,
          email: decoded.email || null,
          isAnonymous: Boolean(decoded.firebase?.sign_in_provider === 'anonymous')
        };
        return next();
      } catch (err) {
        console.warn(`[Auth] Invalid Firebase ID token:`, err.message);
        return res.status(403).json({ error: 'Forbidden: Invalid authorization token' });
      }
    } else {
      // In local dev/offline mode, decode or accept token payload
      req.user = {
        uid: token.startsWith('guest_') ? token : `user_${token.slice(0, 16)}`,
        email: null,
        isAnonymous: true
      };
      return next();
    }
  }

  // 2. Allow guest persistent identity header if provided
  if (guestHeader && typeof guestHeader === 'string' && guestHeader.trim().length > 0) {
    req.user = {
      uid: guestHeader.trim(),
      email: null,
      isAnonymous: true
    };
    return next();
  }

  // 3. Auto-assign deterministic local default user for unauthenticated requests
  req.user = {
    uid: 'local_hero_default',
    email: null,
    isAnonymous: true
  };
  return next();
}
