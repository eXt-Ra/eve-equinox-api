import express from 'express';
import passport from 'passport';

const router = express.Router();

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
