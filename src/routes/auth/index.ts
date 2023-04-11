import express from 'express';
import eveRouter from './eve';

const router = express.Router();

router.use('/eveonline', eveRouter);

export default router;
