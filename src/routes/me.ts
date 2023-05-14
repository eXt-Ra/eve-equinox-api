import express, { Request, Response } from 'express';
import { Account } from '../interfaces/Account';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  const account: Account | undefined = req.session.passport?.user;
  if (account) {
    res.send({ ...account });
  } else {
    res.sendStatus(401);
  }
});

export default router;
