import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  if (req.user) {
    res.send({ ...req.user });
  } else {
    res.sendStatus(401);
  }
});

export default router;
