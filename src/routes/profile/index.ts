import express from 'express';
import { getProfile } from '../../controllers/profile/getProfile';

const router = express.Router();

router.get('/', getProfile);

export default router;

