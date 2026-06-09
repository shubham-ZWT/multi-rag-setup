import { Router } from 'express';
import { upload } from '../middleware/upload.middleware';
import {
  uploadFile,
  addText,
  addUrl,
  listSources,
  getSource,
  deleteSource,
  reindexSource,
} from '../controllers/knowledge.controller';
import { verifyToken, authorizeRole } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(verifyToken, authorizeRole([Role.USER, Role.ADMIN]));

router.post('/upload', upload.single('file'), uploadFile);
router.post('/text', addText);
router.post('/url', addUrl);
router.get('/', listSources);
router.get('/:id', getSource);
router.delete('/:id', deleteSource);
router.post('/:id/reindex', reindexSource);

export default router;
