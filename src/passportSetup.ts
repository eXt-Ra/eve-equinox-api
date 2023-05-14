import passport from 'passport';
import { setupEveOnlineStrategy } from './configs/strategies/eveonlineStrategy';
import { Express } from 'express-serve-static-core';
import { Account } from './interfaces/Account';

function setupPassport(app: Express) {
  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser((account, done) => {
    done(null, account);
  });
  passport.deserializeUser((account: Account, done) => {
    done(null, account);
  });
  setupEveOnlineStrategy(passport);
}

export default setupPassport;
