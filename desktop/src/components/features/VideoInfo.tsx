import type { VideoMetadata } from '@/types';

interface VideoInfoProps {
  metadata: VideoMetadata;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts = [m.toString().padStart(2, '0'), s.toString().padStart(2, '0')];
  if (h) parts.unshift(h.toString().padStart(2, '0'));
  return parts.join(':');
}

export function VideoInfo({ metadata }: VideoInfoProps) {
  return (
    <div className="w-full glass-panel-premium rounded-2xl p-6 light-bleed">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 aspect-video rounded-lg overflow-hidden shadow-md relative bg-surface-container-highest">
          <img
            src={metadata.thumbnail}
            alt={metadata.title}
            className="object-cover w-full h-full"
          />
          <div className="absolute bottom-2 right-2 bg-inverse-surface/80 text-inverse-on-surface text-[11px] font-bold px-2 py-1 rounded backdrop-blur-md tracking-wider">
            {formatDuration(metadata.duration)}
          </div>
        </div>
        <div className="w-full md:w-2/3 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold text-on-surface mb-1 truncate">
              {metadata.title}
            </h2>
            <p className="text-sm text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined hand-drawn-icon" style={{ fontSize: '14px' }}>
                person
              </span>
              {metadata.author}
            </p>
            <div className="flex gap-3 mt-3">
              <span className="text-xs text-on-surface-variant/60 flex items-center gap-1">
                <span className="material-symbols-outlined hand-drawn-icon" style={{ fontSize: '12px' }}>
                  quality
                </span>
                {metadata.formats.length} formati
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
