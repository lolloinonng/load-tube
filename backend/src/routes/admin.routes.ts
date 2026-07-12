import { Router } from 'express';
import { login, getStats, getLogs } from '../controllers/admin.controller';
import { apiLimiter } from '../middlewares/rateLimiter';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.post('/login', apiLimiter, login);
router.get('/stats', authenticateToken, getStats);
router.get('/logs', authenticateToken, getLogs);

export default router;
