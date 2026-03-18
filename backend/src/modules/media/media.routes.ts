import { Router } from 'express';
import multer from 'multer';

import { authenticate, requireRoles } from '@middlewares/auth';
import { uploadProductMedia } from './media.controller';

const mediaRouter = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per image
    files: 6,
  },
});

mediaRouter.use(authenticate);

mediaRouter.post(
  '/products',
  requireRoles('ADMIN'),
  upload.array('files', 6),
  uploadProductMedia
);

export { mediaRouter };
