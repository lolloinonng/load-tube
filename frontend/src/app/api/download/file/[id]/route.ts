import { NextRequest, NextResponse } from 'next/server';
import { initDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/api-middleware';

let yt: any = null;

async function getYt() {
  if (!yt) {
    const { Innertube } = await import('youtubei.js');
    yt = await Innertube.create({ lang: 'it', location: 'IT' });
  }
  return yt;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });

  const { id } = await params;
  await initDb();

  try {
    const youtube = await getYt();
    const info = await youtube.getInfo(id);
    const formats = info.streaming_data?.formats?.filter((f: any) => f.has_audio && f.has_video) || [];
    const format = formats[formats.length - 1] || info.streaming_data?.adaptive_formats?.[0];
    const url = format?.url || format?.decipher?.(youtube.session.player);
    if (!url) return NextResponse.json({ success: false, error: 'No URL' }, { status: 500 });
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
