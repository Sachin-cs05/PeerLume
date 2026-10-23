import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import {
  handleCreateResource,
  handleListResources,
  handleGetSessionResources,
  handleGetResourceById,
  handleDownloadFile,
  handleUpdateResource,
  handleDeleteResource,
} from '../controllers/resource.controller.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB maximum
  },
});

const router = Router();

router.use(requireAuth);

router.post('/', upload.single('file'), handleCreateResource);
router.get('/', handleListResources);
router.get('/session/:sessionId', handleGetSessionResources);
router.get('/:resourceId', handleGetResourceById);
router.get('/:resourceId/download', handleDownloadFile);
router.patch('/:resourceId', handleUpdateResource);
router.delete('/:resourceId', handleDeleteResource);

export const resourceRoutes = router;
