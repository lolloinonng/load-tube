import { Router } from 'express';
import analyzeRoutes from './analyze.routes';
import downloadRoutes from './download.routes';
import adminRoutes from './admin.routes';
import contactRoutes from './contact.routes';
import convertRoutes from './convert.routes';
import authRoutes from './auth.routes';

const router = Router();

router.use('/analyze', analyzeRoutes);
router.use('/download', downloadRoutes);
router.use('/admin', adminRoutes);
router.use('/contact', contactRoutes);
router.use('/convert', convertRoutes);
router.use('/auth', authRoutes);

export default router;
