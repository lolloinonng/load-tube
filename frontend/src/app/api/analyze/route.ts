import { NextRequest, NextResponse } from 'next/server';
import { initDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/api-middleware';
import ytdl from '@distube/ytdl-core';

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });

  await initDb();
  const { url, ...rest } = await req.json();
  const videoUrl = url || rest.videoUrl;
  if (!videoUrl) return NextResponse.json({ success: false, error: 'URL required' }, { status: 400 });

  try {
    const info = await ytdl.getInfo(videoUrl);
    const formats = info.formats
      .filter((f: any) => f.hasAudio && f.hasVideo)
      .map((f: any) => ({
        itag: f.itag,
        quality: f.qualityLabel || f.quality,
        container: f.container,
        contentLength: f.contentLength,
        hasAudio: f.hasAudio,
        hasVideo: f.hasVideo,
      }));

    return NextResponse.json({
      success: true,
      data: {
        title: info.videoDetails.title,
        duration: info.videoDetails.lengthSeconds,
        thumbnail: info.videoDetails.thumbnails?.at(-1)?.url,
        author: info.videoDetails.author?.name,
        formats,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Analysis failed' }, { status: 500 });
  }
}
