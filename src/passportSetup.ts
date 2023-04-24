import passport from 'passport';
import { setupEveOnlineStrategy } from './configs/strategies/eveonlineStrategy';
import { Express } from 'express-serve-static-core';
import { User } from './interfaces/User';

function setupPassport(app: Express) {
  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((user: User, done) => {
    done(null, user);
  });
  setupEveOnlineStrategy(passport);
}

export default setupPassport;
