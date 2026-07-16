import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/db';
import { getUserFromRequest } from '@/lib/api-middleware';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });

  const { id } = await params;
  const result = await getClient().execute({ sql: 'SELECT * FROM downloads WHERE id = ?', args: [id] });
  if (result.rows.length === 0) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

  const row = result.rows[0] as any;
  return NextResponse.json({
    success: true,
    data: {
      id: row.id,
      title: row.title,
      url: row.url,
      format: row.format,
      quality: row.quality,
      fileSize: row.file_size,
      status: row.status,
    },
  });
}
