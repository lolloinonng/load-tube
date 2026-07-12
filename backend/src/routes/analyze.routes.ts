import { Router } from 'express';
import { analyzeUrl } from '../controllers/analyze.controller';
import { validateAnalyzeRequest } from '../middlewares/validate';
import { analyzeLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.post('/', analyzeLimiter, validateAnalyzeRequest, analyzeUrl);

export default router;
