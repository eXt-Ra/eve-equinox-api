import { Account } from "../interfaces/Account";
import { Request } from 'express';
export const getAccountFromSession = (req: Request): Account | undefined => {
  return req.session.passport?.user;
}