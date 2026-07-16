import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getClient, initDb } from '@/lib/db';
import { getUserFromRequest, requireAdmin } from '@/lib/api-middleware';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!requireAdmin(user)) return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });

  await initDb();
  const result = await getClient().execute('SELECT * FROM users ORDER BY created_at ASC');
  return NextResponse.json({
    success: true,
    data: result.rows.map((r: any) => ({ id: r.id, email: r.email, role: r.role, createdAt: r.created_at })),
  });
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!requireAdmin(user)) return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });

  await initDb();
  const { email, role } = await req.json();
  if (!email) return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });

  const client = getClient();
  const existing = await client.execute({ sql: 'SELECT id FROM users WHERE email = ?', args: [email] });
  if (existing.rows.length > 0) return NextResponse.json({ success: false, error: 'Email già presente' }, { status: 409 });

  const id = uuidv4();
  await client.execute({
    sql: 'INSERT INTO users (id, email, role) VALUES (?, ?, ?)',
    args: [id, email, role || 'user'],
  });
  await logAdmin(user!.email, `Added email: ${email}`, req);

  return NextResponse.json({ success: true, data: { id, email, role: role || 'user' } });
}

async function logAdmin(actionUser: string, details: string, req: NextRequest) {
  const id = uuidv4();
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  await getClient().execute({
    sql: 'INSERT INTO admin_logs (id, action, details, ip) VALUES (?, ?, ?, ?)',
    args: [id, 'CREATE_USER', details, ip],
  });
}
