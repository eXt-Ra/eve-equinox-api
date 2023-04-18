import { Request, Response, NextFunction } from 'express';

function authProtectedRoute(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.cookie('eve-equinox-isConnected', false, { httpOnly: true });
    res.sendStatus(401);
  }
}

export default authProtectedRoute;
