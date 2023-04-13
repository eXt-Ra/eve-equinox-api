import cors from 'cors';
import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import RedisStore from 'connect-redis';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config';

import setupPassport from './passportSetup';
import errorHandler from './middlewares/errorHandler';
import fourOhFour from './middlewares/fourOhFour';
import { redisClient } from './middlewares/redisClient';

import root from './routes/root';
import auth from './routes/auth';
import me from './routes/me';
import profile from './routes/profile';
import logout from './routes/logout';

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    // @ts-ignore
    origin: config.clientOrigins[config.nodeEnv],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }),
);
app.use(function (req, res, next) {
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use(helmet());
app.use(morgan('tiny'));

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || 'default',
    resave: false,
    saveUninitialized: true,
    name: 'eve-equinox-session'
  }),
);

setupPassport(app);

// Apply routes before error handling
app.use('/', root);
app.use('/auth', auth);
app.use('/logout', logout);
app.use('/me', me);
app.use('/profile', profile);

// Apply error handling last
app.use(fourOhFour);
app.use(errorHandler);

export default app;

