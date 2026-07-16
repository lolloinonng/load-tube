import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { initDb, getClient } from '@/lib/db';
import { getUserFromRequest } from '@/lib/api-middleware';
import ytdl from '@distube/ytdl-core';

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });

  await initDb();
  const { url, format, quality } = await req.json();
  if (!url) return NextResponse.json({ success: false, error: 'URL required' }, { status: 400 });

  try {
    const info = await ytdl.getInfo(url);
    const formatKey = quality || 'highest';

    let selectedFormat: any;
    if (format === 'audio') {
      selectedFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });
    } else {
      const formats = info.formats.filter((f: any) => f.hasAudio && f.hasVideo);
      selectedFormat = formats.find((f: any) => f.qualityLabel === quality || f.itag == quality) || formats[0];
    }

    if (!selectedFormat) return NextResponse.json({ success: false, error: 'Format not available' }, { status: 400 });

    const jobId = uuidv4();
    const title = info.videoDetails.title;

    await getClient().execute({
      sql: 'INSERT INTO downloads (id, url, title, format, quality, file_size, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [jobId, url, title, format || 'video', quality || 'highest', parseInt(selectedFormat.contentLength || '0'), 'completed'],
    });

    return NextResponse.json({
      success: true,
      data: {
        jobId,
        title,
        format: selectedFormat.container,
        fileSize: parseInt(selectedFormat.contentLength || '0'),
        downloadUrl: selectedFormat.url,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Download failed' }, { status: 500 });
  }
}
