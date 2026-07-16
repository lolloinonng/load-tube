import { NextRequest, NextResponse } from 'next/server';
import { getClient, initDb } from '@/lib/db';
import { getUserFromRequest, requireAdmin } from '@/lib/api-middleware';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!requireAdmin(user)) return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });

  await initDb();
  const client = getClient();
  const today = new Date().toISOString().slice(0, 10);

  const totalResult = await client.execute('SELECT COUNT(*) as count FROM downloads');
  const todayResult = await client.execute({ sql: "SELECT COUNT(*) as count FROM downloads WHERE date(created_at) = ?", args: [today] });
  const formatsResult = await client.execute('SELECT format, COUNT(*) as count FROM downloads GROUP BY format ORDER BY count DESC LIMIT 5');

  return NextResponse.json({
    success: true,
    data: {
      downloadsToday: Number((todayResult.rows[0] as any)?.count || 0),
      totalDownloads: Number((totalResult.rows[0] as any)?.count || 0),
      popularFormats: formatsResult.rows.map((r: any) => ({ format: r.format, count: Number(r.count) })),
      serverStatus: { uptime: process.uptime(), memoryUsage: 'N/A' },
      cache: { keys: 0 },
    },
  });
}
