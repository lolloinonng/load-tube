import { Router } from 'express';
import { startDownload, getDownloadStatus, getDownloadFile } from '../controllers/download.controller';
import { validateDownloadRequest } from '../middlewares/validate';
import { downloadLimiter } from '../middlewares/rateLimiter';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.post('/', authenticateToken, downloadLimiter, validateDownloadRequest, startDownload);
router.get('/status/:id', authenticateToken, getDownloadStatus);
router.get('/file/:id', authenticateToken, getDownloadFile);

export default router;
