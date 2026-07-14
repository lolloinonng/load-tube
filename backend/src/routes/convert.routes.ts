import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { config } from '../config';
import { convertFile, downloadConverted } from '../controllers/convert.controller';
import { authenticateToken } from '../middlewares/auth';

const upload = multer({
  dest: path.join(config.tempDir, 'uploads'),
  limits: { fileSize: config.maxFileSize },
});

const router = Router();
router.post('/', authenticateToken, upload.single('file'), convertFile);
router.get('/download/:fileName', authenticateToken, downloadConverted);

export default router;
