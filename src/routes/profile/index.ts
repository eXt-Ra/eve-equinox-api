import express from 'express';
import authProtectedRoute from '../../middlewares/authProtectedRoute';
import { getProfile } from '../../controllers/profile/getProfile';

const router = express.Router();

router.get('/', authProtectedRoute, getProfile());

export default router;

