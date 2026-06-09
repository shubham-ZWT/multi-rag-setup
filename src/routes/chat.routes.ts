import { Router } from 'express';
import { chat, getMessages } from '../controllers/chat.controller';
import { verifyToken, authorizeRole } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.post('/:botId', chat);
router.get(
  '/conversations/:id/messages',
  verifyToken,
  authorizeRole([Role.USER, Role.ADMIN]),
  getMessages,
);

export default router;
