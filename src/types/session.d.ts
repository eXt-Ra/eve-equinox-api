// eslint-disable-next-line @typescript-eslint/no-unused-vars
import session from 'express-session';
import { User } from './../interfaces/User';

declare module 'express-session' {
  interface SessionData {
    passport:
    | {
      user: User;
    }
    | undefined;
    returnTo: string;
  }
}
