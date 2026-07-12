import { Router } from 'express';
import { startDownload, getDownloadStatus, getDownloadFile } from '../controllers/download.controller';
import { validateDownloadRequest } from '../middlewares/validate';
import { downloadLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.post('/', downloadLimiter, validateDownloadRequest, startDownload);
router.get('/status/:id', getDownloadStatus);
router.get('/file/:id', getDownloadFile);

export default router;
