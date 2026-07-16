import { NextRequest, NextResponse } from 'next/server';
import { getClient, initDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/api-middleware';
import ytdl from '@distube/ytdl-core';

const requestOptions = {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36' },
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });

  const { id } = await params;
  await initDb();
  const result = await getClient().execute({ sql: 'SELECT * FROM downloads WHERE id = ?', args: [id] });
  if (result.rows.length === 0) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

  const row = result.rows[0] as any;

  try {
    const info = await ytdl.getInfo(row.url, { requestOptions });
    let format: any;
    if (row.format === 'audio') {
      format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });
    } else {
      const formats = info.formats.filter((f: any) => f.hasAudio && f.hasVideo);
      format = formats[0] || info.formats[0];
    }
    if (!format?.url) return NextResponse.json({ success: false, error: 'No stream URL' }, { status: 500 });

    return NextResponse.redirect(format.url);
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to get download URL' }, { status: 500 });
  }
}
