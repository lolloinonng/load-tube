import { Router } from 'express';
import analyzeRoutes from './analyze.routes';
import downloadRoutes from './download.routes';
import adminRoutes from './admin.routes';
import contactRoutes from './contact.routes';

const router = Router();

router.use('/analyze', analyzeRoutes);
router.use('/download', downloadRoutes);
router.use('/admin', adminRoutes);
router.use('/contact', contactRoutes);

export default router;
