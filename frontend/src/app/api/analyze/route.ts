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
  const { url, ...rest } = await req.json();
  const videoUrl = url || rest.videoUrl;
  if (!videoUrl) return NextResponse.json({ success: false, error: 'URL required' }, { status: 400 });

  const videoId = extractVideoId(videoUrl);
  if (!videoId) return NextResponse.json({ success: false, error: 'Invalid YouTube URL' }, { status: 400 });

  try {
    const youtube = await getYt();
    const info = await youtube.getInfo(videoId);
    const basic = info.basic_info;
    const formats = (info.streaming_data?.formats || [])
      .filter((f: any) => f.mimeType?.includes('mp4') && f.has_audio && f.has_video)
      .map((f: any) => ({
        itag: f.itag,
        quality: f.quality_label || f.quality,
        container: 'mp4',
        contentLength: f.content_length?.toString(),
        hasAudio: f.has_audio,
        hasVideo: f.has_video,
      }));

    return NextResponse.json({
      success: true,
      data: {
        title: basic.title,
        duration: basic.duration || 0,
        thumbnail: basic.thumbnail?.at(-1)?.url || basic.thumbnail?.[0]?.url,
        author: basic.author?.name || basic.channel?.name,
        formats: formats.length > 0 ? formats : (info.streaming_data?.adaptive_formats || []).map((f: any) => ({
          itag: f.itag,
          quality: f.quality_label || f.quality,
          container: f.mimeType?.split('/')[1]?.split(';')[0] || 'mp4',
          contentLength: f.content_length?.toString(),
          hasAudio: f.has_audio,
          hasVideo: f.has_video,
        })),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Analysis failed' }, { status: 500 });
  }
}
