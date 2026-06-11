import { Router } from 'express';
import {
  getBotAnalytics,
  getOverview,
  getUserOverview,
} from '../controllers/analytics.controller';
import { verifyToken, authorizeRole } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(verifyToken, authorizeRole([Role.USER, Role.ADMIN]));

router.get('/overview', getOverview);
router.get('/bots/:id', getBotAnalytics);
router.get('/user', getUserOverview);

export default router;
