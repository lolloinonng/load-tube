import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { config } from '../config';
import { verifyGoogleToken } from '../services/user.service';

const prisma = new PrismaClient();

const router = Router();

router.post('/google', async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      res.status(400).json({ success: false, error: 'Credential required' });
      return;
    }
    const { email, googleId } = await verifyGoogleToken(credential, config.googleClientId);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(403).json({ success: false, error: 'Accesso non autorizzato' });
      return;
    }
    if (!user.googleId) {
      await prisma.user.update({ where: { email }, data: { googleId } });
    }
    const token = jwt.sign({ email: user.email, role: user.role }, config.jwtSecret, { expiresIn: '24h' });
    res.json({ success: true, data: { token, email: user.email, role: user.role } });
  } catch (err: any) {
    res.status(401).json({ success: false, error: err.message || 'Google auth failed' });
  }
});

router.post('/verify', (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) {
    res.status(401).json({ success: false, error: 'No token' });
    return;
  }
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    res.json({ success: true, data: decoded });
  } catch {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

export default router;
