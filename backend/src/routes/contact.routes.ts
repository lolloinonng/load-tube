import { Router } from 'express';
import { sendContactMessage } from '../controllers/contact.controller';
import { contactLimiter } from '../middlewares/rateLimiter';

const router = Router();
router.post('/', contactLimiter, sendContactMessage);
export default router;
