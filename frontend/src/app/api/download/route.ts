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

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:v=|youtu\.be\/|\/shorts\/)([\w-]{11})/,
    /^([\w-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });

  await initDb();
  const { url, format, quality } = await req.json();
  if (!url) return NextResponse.json({ success: false, error: 'URL required' }, { status: 400 });

  const videoId = extractVideoId(url);
  if (!videoId) return NextResponse.json({ success: false, error: 'Invalid YouTube URL' }, { status: 400 });

  try {
    const youtube = await getYt();
    const info = await youtube.getInfo(videoId);
    const title = info.basic_info.title;

    let selectedFormat: any;
    if (format === 'audio') {
      const audioFormats = info.streaming_data?.adaptive_formats?.filter((f: any) => f.has_audio && !f.has_video) || [];
      selectedFormat = audioFormats[audioFormats.length - 1];
    } else {
      const videoFormats = info.streaming_data?.formats?.filter((f: any) => f.has_audio && f.has_video) || [];
      if (quality) {
        selectedFormat = videoFormats.find((f: any) => f.quality_label === quality || f.itag == quality);
      }
      selectedFormat = selectedFormat || videoFormats[videoFormats.length - 1];

      if (!selectedFormat) {
        const combined = info.streaming_data?.adaptive_formats?.filter((f: any) => f.has_audio && f.has_video) || [];
        selectedFormat = combined[combined.length - 1];
      }
    }

    if (!selectedFormat) return NextResponse.json({ success: false, error: 'Format not available' }, { status: 400 });

    const downloadUrl = selectedFormat.url || selectedFormat.decipher?.(youtube.session.player);

    if (!downloadUrl) return NextResponse.json({ success: false, error: 'Cannot generate download URL' }, { status: 500 });

    return NextResponse.json({
      success: true,
      data: {
        jobId: videoId,
        title,
        format: selectedFormat.mimeType?.split('/')[1]?.split(';')[0] || 'mp4',
        fileSize: parseInt(selectedFormat.content_length || '0'),
        downloadUrl,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Download failed' }, { status: 500 });
  }
}
