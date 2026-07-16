import type { NextRequest } from 'next/server';
import { verifyToken } from './auth-api';

export function getUserFromRequest(req: NextRequest): { email: string; role: string } | null {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies.get('site_token')?.value;
  return token ? verifyToken(token) : null;
}

export function requireAuth(req: NextRequest): { email: string; role: string } | null {
  return getUserFromRequest(req);
}

export function requireAdmin(user: { email: string; role: string } | null): boolean {
  return user?.role === 'admin';
}
