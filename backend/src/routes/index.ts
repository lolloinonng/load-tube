import { Router } from 'express';
import analyzeRoutes from './analyze.routes';
import downloadRoutes from './download.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/analyze', analyzeRoutes);
router.use('/download', downloadRoutes);
router.use('/admin', adminRoutes);

export default router;
