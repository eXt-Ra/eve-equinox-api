/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Endpoints for user authentication
 */

import express from 'express';
import passport from 'passport';

const router = express.Router();

/**
 * @swagger
 * /auth/eve/login:
 *   get:
 *     summary: Redirect to Eve Online authentication page
 *     description: Redirect the user to the Eve Online OAuth2 provider for authentication
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: query
 *         name: returnTo
 *         schema:
 *           type: string
 *         description: The URL to redirect to after successful authentication
 *     responses:
 *       302:
 *         description: Redirect to the Eve Online authentication page
 *       401:
 *         description: Unauthorized
 */
router.get(`/login`, (req, res, next) => {
  const { returnTo } = req.query;
  const state = returnTo
    ? Buffer.from(JSON.stringify({ returnTo })).toString('base64')
    : undefined

  const authenticator = passport.authenticate('eveonline', {
    failureRedirect: '/auth/forbidden',
    keepSessionInfo: true,
    state
  })

  authenticator(req, res, next)
})

/**
 * @swagger
 * /auth/eve/callback:
 *   get:
 *     summary: Eve Online authentication callback
 *     description: Handle the callback from the Eve Online OAuth2 provider
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: The state parameter passed during authentication
 *     responses:
 *       302:
 *         description: Redirect to the returnTo URL specified during authentication
 *       401:
 *         description: Unauthorized
 */
router.get('/callback', passport.authenticate('eveonline', { keepSessionInfo: true }), (req, res) => {
  const { state } = req.query;
  const decodedState = typeof state === 'string' ? JSON.parse(Buffer.from(state, 'base64').toString('utf-8')) : {};
  const { returnTo } = decodedState;
  if (typeof returnTo === 'string' && returnTo.startsWith('/')) {

    const baseURL = {
      development: process.env.DEV_ORIGIN ?? 'http://localhost:3000',
      production: process.env.PROD_ORIGIN ?? '',
    };

    const redirectURL = baseURL[process.env.NODE_ENV as keyof typeof baseURL] + returnTo;

    res.cookie('eve-equinox-isConnected', true);
    return res.redirect(redirectURL);
  }

  res.redirect('/');
});

export default router;
