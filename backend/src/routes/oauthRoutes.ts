import { Router, RequestHandler } from 'express';
import passport from '../config/passport';
import { env } from '../config/env';
import { signToken } from '../utils/jwt';
import type { AuthRequest } from '../types';

const router = Router();

const notConfigured: RequestHandler = (_req, res) => {
  res.status(503).json({ message: 'Google OAuth not configured on this server' });
};

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

  router.get(
    '/google/callback',
    passport.authenticate('google', {
      session: false,
      failureRedirect: `${env.FRONTEND_URL}/login?error=oauth_failed`,
    }),
    ((req: AuthRequest, res) => {
      const token = req.user ? signToken(req.user) : '';
      // Set httpOnly cookie instead of putting token in URL
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      res.redirect(`${env.FRONTEND_URL}/auth/callback`);
    }) as RequestHandler,
  );
} else {
  router.get('/google', notConfigured);
  router.get('/google/callback', notConfigured);
}

export default router;
