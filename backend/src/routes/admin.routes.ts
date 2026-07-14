import { Router } from 'express';
import { getStats, getLogs } from '../controllers/admin.controller';
import { authenticateToken, requireAdmin } from '../middlewares/auth';
import { getAllUsers, createUser, deleteUser } from '../services/user.service';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/stats', authenticateToken, requireAdmin, getStats);
router.get('/logs', authenticateToken, requireAdmin, getLogs);

router.get('/users', authenticateToken, requireAdmin, async (_req, res, next) => {
  try {
    const users = await getAllUsers();
    res.json({ success: true, data: users });
  } catch (err) { next(err); }
});

router.post('/users', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { email, role } = req.body;
    if (!email) {
      res.status(400).json({ success: false, error: 'Email required' });
      return;
    }
    const user = await createUser(email, role || 'user');
    await prisma.adminLog.create({
      data: { action: 'CREATE_USER', details: `Added email: ${email}`, ip: req.ip },
    });
    res.json({ success: true, data: user });
  } catch (err: any) {
    if (err.message === 'Email already exists') {
      res.status(409).json({ success: false, error: 'Email già presente' });
      return;
    }
    next(err);
  }
});

router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const id = req.params.id as string;
    await deleteUser(id);
    await prisma.adminLog.create({
      data: { action: 'DELETE_USER', details: `Deleted user: ${id}`, ip: req.ip },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
