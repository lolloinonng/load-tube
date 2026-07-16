import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-api';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const token = body.token || req.cookies.get('site_token')?.value;
  if (!token) return NextResponse.json({ success: false, error: 'No token' }, { status: 401 });

  const decoded = verifyToken(token);
  if (!decoded) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });

  return NextResponse.json({ success: true, data: decoded });
}
