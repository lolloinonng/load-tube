import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    (req as any).user = decoded;
    next();
  } catch {
    res.status(403).json({ success: false, error: 'Invalid or expired token' });
  }
}

export function basicAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  try {
    const base64 = authHeader.split(' ')[1];
    const decoded = Buffer.from(base64, 'base64').toString('utf-8');
    const [username, password] = decoded.split(':');

    if (username === config.adminUsername && password === config.adminPassword) {
      const token = jwt.sign({ username, role: 'admin' }, config.jwtSecret, { expiresIn: '24h' });
      (req as any).adminToken = token;
      next();
    } else {
      res.status(403).json({ success: false, error: 'Invalid credentials' });
    }
  } catch {
    res.status(401).json({ success: false, error: 'Invalid authorization header' });
  }
}
