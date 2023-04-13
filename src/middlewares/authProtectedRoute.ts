import { Request, Response, NextFunction } from 'express';

function authProtectedRoute(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/auth/eveonline/login');
  }
}

export default authProtectedRoute;
