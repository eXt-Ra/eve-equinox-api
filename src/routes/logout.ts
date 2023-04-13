import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  req.logout({}, () => {
    req.session.destroy(() => {
      res.clearCookie('eve-equinox-session');
      res.clearCookie('eve-equinox-isConnected');
      res.redirect('/');
    });
  });
});

export default router;
