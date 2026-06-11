import { Router } from 'express';
import {
  createBot,
  updateBot,
  getBot,
  getUserBots,
  deleteBot,
  toggleBotStatus,
} from '../controllers/bot.controller';
import { verifyToken, authorizeRole } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(verifyToken, authorizeRole([Role.USER, Role.ADMIN]));

router.post('/create', createBot);
router.get('/user', getUserBots);
router.get('/:id', getBot);
router.put('/:id', updateBot);
router.delete('/:id', deleteBot);
router.patch('/:id/status', toggleBotStatus);

export default router;
