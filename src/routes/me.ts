import express, { Request, Response } from 'express';
import { User } from '../interfaces/User';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  const user: User | undefined = req.session.passport?.user;
  if (user) {
    res.send({ ...user });
  } else {
    res.sendStatus(401);
  }
});

export default router;
