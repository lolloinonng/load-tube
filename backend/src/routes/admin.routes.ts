import { Router } from 'express';
import { login, getStats, getLogs } from '../controllers/admin.controller';
import { apiLimiter } from '../middlewares/rateLimiter';
import { authenticateToken } from '../middlewares/auth';
import { getAllUsers, createUser, deleteUser } from '../services/user.service';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.post('/login', apiLimiter, login);
router.get('/stats', authenticateToken, getStats);
router.get('/logs', authenticateToken, getLogs);

router.get('/users', authenticateToken, async (_req, res, next) => {
  try {
    const users = await getAllUsers();
    res.json({ success: true, data: users });
  } catch (err) { next(err); }
});

router.post('/users', authenticateToken, async (req, res, next) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) {
      res.status(400).json({ success: false, error: 'Username and password required' });
      return;
    }
    const user = await createUser(username, password, role || 'user');
    await prisma.adminLog.create({
      data: { action: 'CREATE_USER', details: `Created user: ${username}`, ip: req.ip },
    });
    res.json({ success: true, data: user });
  } catch (err: any) {
    if (err.message === 'Username already exists') {
      res.status(409).json({ success: false, error: 'Username already exists' });
      return;
    }
    next(err);
  }
});

router.delete('/users/:id', authenticateToken, async (req, res, next) => {
  try {
    await deleteUser(req.params.id);
    await prisma.adminLog.create({
      data: { action: 'DELETE_USER', details: `Deleted user: ${req.params.id}`, ip: req.ip },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
