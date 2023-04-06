import passport from 'passport';
import { setupEveOnlineStrategy } from './configs/strategies/eveonlineStrategy';
import { EsiProfile } from './interfaces/EsiProfile';
import { Express } from 'express-serve-static-core';

function setupPassport(app: Express) {
  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((user: EsiProfile, done) => {
    done(null, user);
  });
  setupEveOnlineStrategy(passport);
}

export default setupPassport;
