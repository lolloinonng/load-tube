import type { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { config } from '../config';
import { CacheService } from '../services/cache.service';

const prisma = new PrismaClient();
const cacheService = new CacheService();

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username, password } = req.body;

    if (username === config.adminUsername && password === config.adminPassword) {
      const jwt = await import('jsonwebtoken');
      const token = jwt.default.sign(
        { username, role: 'admin' },
        config.jwtSecret,
        { expiresIn: '24h' }
      );

      await prisma.adminLog.create({
        data: { action: 'LOGIN', details: 'Admin logged in', ip: req.ip },
      });

      res.json({ success: true, data: { token } });
    } else {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  } catch (err) {
    next(err);
  }
}

export async function getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [downloadsToday, totalDownloads, popularFormats] = await Promise.all([
      prisma.download.count({ where: { createdAt: { gte: today } } }),
      prisma.download.count(),
      prisma.download.groupBy({
        by: ['format'],
        _count: { format: true },
        orderBy: { _count: { format: 'desc' } },
        take: 5,
      }),
    ]);

    const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const uptime = process.uptime();

    res.json({
      success: true,
      data: {
        downloadsToday,
        totalDownloads,
        popularFormats: popularFormats.map((f) => ({
          format: f.format,
          count: f._count.format,
        })),
        serverStatus: {
          uptime: Math.floor(uptime),
          memoryUsage: `${memoryUsage} MB`,
          cpuUsage: `${(process.cpuUsage().user / 1000000).toFixed(2)}s`,
        },
        cache: cacheService.getStats(),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const logs = await prisma.adminLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
}
