// eslint-disable-next-line @typescript-eslint/no-unused-vars
import session from 'express-session';
import { EsiProfile } from './../interfaces/EsiProfile';

declare module 'express-session' {
  interface SessionData {
    passport:
    | {
      user: EsiProfile;
    }
    | undefined;
    returnTo: string;
  }
}
