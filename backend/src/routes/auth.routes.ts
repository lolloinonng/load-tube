import { Router, Request, Response } from 'express';
import { config } from '../config';

const router = Router();

router.post('/login', (req: Request, res: Response) => {
  const { password } = req.body;
  if (!password || password !== config.sitePassword) {
    res.status(401).json({ success: false, error: 'Invalid password' });
    return;
  }
  const token = Buffer.from(`site:${Date.now()}`).toString('base64');
  res.json({ success: true, data: { token } });
});

router.post('/verify', (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) {
    res.status(401).json({ success: false, error: 'No token' });
    return;
  }
  res.json({ success: true });
});

export default router;
