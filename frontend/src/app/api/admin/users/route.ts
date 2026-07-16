import { NextRequest, NextResponse } from 'next/server';
import { getClient, initDb } from '@/lib/db';
import { getUserFromRequest, requireAdmin } from '@/lib/api-middleware';
import { getAllWhitelistedUsers, addWhitelistUser, removeWhitelistUser, isFirebaseConfigured } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!requireAdmin(user)) return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });

  if (isFirebaseConfigured()) {
    const users = await getAllWhitelistedUsers();
    return NextResponse.json({ success: true, data: users });
  }

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

  const { email, role } = await req.json();
  if (!email) return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });

  if (isFirebaseConfigured()) {
    try {
      await addWhitelistUser(email, role || 'user');
      return NextResponse.json({ success: true, data: { email: email.toLowerCase(), role: role || 'user' } });
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
  }

  await initDb();
  const client = getClient();
  const existing = await client.execute({ sql: 'SELECT id FROM users WHERE email = ?', args: [email] });
  if (existing.rows.length > 0) return NextResponse.json({ success: false, error: 'Email già presente' }, { status: 409 });

  const id = uuidv4();
  await client.execute({ sql: 'INSERT INTO users (id, email, role) VALUES (?, ?, ?)', args: [id, email, role || 'user'] });
  return NextResponse.json({ success: true, data: { id, email, role: role || 'user' } });
}
