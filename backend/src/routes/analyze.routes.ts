import { Router } from 'express';
import { analyzeUrl } from '../controllers/analyze.controller';
import { validateAnalyzeRequest } from '../middlewares/validate';
import { analyzeLimiter } from '../middlewares/rateLimiter';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.post('/', authenticateToken, analyzeLimiter, validateAnalyzeRequest, analyzeUrl);

export default router;
