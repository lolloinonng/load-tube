import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getClient } from '@/lib/db';
import { getUserFromRequest, requireAdmin } from '@/lib/api-middleware';
import { getAllWhitelistedUsers, removeWhitelistUser, isFirebaseConfigured } from '@/lib/firebase';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!requireAdmin(user)) return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });

  const { id } = await params;

  if (isFirebaseConfigured()) {
    await removeWhitelistUser(id);
    return NextResponse.json({ success: true });
  }

  const client = getClient();
  const existing = await client.execute({ sql: 'SELECT email FROM users WHERE id = ?', args: [id] });
  if (existing.rows.length > 0) {
    const email = (existing.rows[0] as any).email;
    const logId = uuidv4();
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    await client.execute({
      sql: 'INSERT INTO admin_logs (id, action, details, ip) VALUES (?, ?, ?, ?)',
      args: [logId, 'DELETE_USER', `Deleted user: ${email}`, ip],
    });
  }

  await client.execute({ sql: 'DELETE FROM users WHERE id = ?', args: [id] });
  return NextResponse.json({ success: true });
}
