import { NextRequest, NextResponse } from 'next/server';
import { getClient, initDb } from '@/lib/db';
import { getUserFromRequest, requireAdmin } from '@/lib/api-middleware';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!requireAdmin(user)) return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });

  await initDb();

  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50', 10);
  const result = await getClient().execute({ sql: 'SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT ?', args: [limit] });

  return NextResponse.json({
    success: true,
    data: result.rows.map((r: any) => ({
      id: r.id, action: r.action, details: r.details, ip: r.ip, createdAt: r.created_at,
    })),
  });
}
