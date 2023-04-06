import express from 'express';
import passport from 'passport';

const router = express.Router();

router.get(
  '/login',
  (req, res, next): void => {
    next();
  },
  passport.authenticate('eveonline', {
    failureRedirect: '/auth/forbidden',
    keepSessionInfo: true,
  }),
);

router.get('/callback', passport.authenticate('eveonline', { keepSessionInfo: true }), (req, res) => {
  const returnTo = req.session.returnTo || '/';
  delete req.session.returnTo;
  res.redirect(returnTo);
});

export default router;
