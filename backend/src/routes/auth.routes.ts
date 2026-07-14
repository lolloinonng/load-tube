import { Router, Request, Response } from 'express';
import { findUserByUsername, verifyPassword } from '../services/user.service';
import { config } from '../config';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ success: false, error: 'Username and password required' });
    return;
  }
  const user = await findUserByUsername(username);
  if (!user || !(await verifyPassword(password, user.password))) {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
    return;
  }
  const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
  res.json({ success: true, data: { token, username: user.username, role: user.role } });
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
