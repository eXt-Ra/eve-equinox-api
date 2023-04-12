import express, { Request, Response } from 'express';
import { EsiProfile } from '../interfaces/EsiProfile';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  const user: EsiProfile | undefined = req.session.passport?.user;
  if (user) {
    res.send({ ...user });
  } else {
    res.sendStatus(401);
  }
});

export default router;
