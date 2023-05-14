// eslint-disable-next-line @typescript-eslint/no-unused-vars
import session from 'express-session';
import { Account } from '../interfaces/Account';

declare module 'express-session' {
  interface SessionData {
    passport:
    | {
      user: Account;
    }
    | undefined;
    returnTo: string;
  }
}
