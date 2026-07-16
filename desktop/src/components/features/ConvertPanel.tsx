import { useState } from 'react';
import { toast } from 'react-hot-toast';

const CATEGORIES: Record<string, { label: string; formats: string[] }> = {
  video: { label: 'Video', formats: ['mp4', 'avi', 'mov', 'mkv', 'webm', 'wmv', 'flv', 'gif'] },
  audio: { label: 'Audio', formats: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma', 'opus'] },
  image: { label: 'Immagine', formats: ['png', 'jpg', 'webp', 'avif', 'gif', 'ico'] },
  document: { label: 'Documento', formats: ['pdf'] },
};

export function ConvertPanel() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [converting, setConverting] = useState(false);

  const handleSelectFile = async () => {
    const res = await window.electronAPI.openFileDialog();
    if (res.success && res.data) {
      setSelectedFile(res.data.path);
    }
  };

  const handleConvert = async () => {
    if (!selectedFile || !selectedFormat) return;
    setConverting(true);
    try {
      const res = await window.electronAPI.convertFile(selectedFile, selectedFormat);
      if (res.success && res.data) {
        toast.success(`File convertito: ${res.data.path}`);
      } else {
        toast.error(res.error || 'Conversione fallita');
      }
    } catch (err: any) {
      toast.error(err.message || 'Conversione fallita');
    } finally {
      setConverting(false);
    }
  };

  const fileName = selectedFile ? selectedFile.split(/[/\\]/).pop() : null;

  return (
    <div className="w-full glass-panel-premium rounded-2xl p-6 light-bleed space-y-5">
      <button
        onClick={handleSelectFile}
        className="w-full glass-panel-premium rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:bg-white/[0.03] spring-transition"
      >
        <span className="material-symbols-outlined text-primary hand-drawn-icon" style={{ fontSize: '40px' }}>
          {selectedFile ? 'file_present' : 'add_circle'}
        </span>
        <span className="text-sm text-on-surface-variant font-medium">
          {fileName || 'Clicca per selezionare un file'}
        </span>
      </button>

      {selectedFile && (
        <div className="space-y-4">
          <p className="text-xs text-on-surface-variant/60 truncate">{selectedFile}</p>

          <div>
            <p className="text-xs font-bold text-on-surface-variant tracking-wider mb-2 uppercase">Formato output</p>
            <div className="flex flex-wrap gap-2">
              {Object.values(CATEGORIES).flatMap(cat =>
                cat.formats.map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setSelectedFormat(fmt)}
                    className={`px-4 py-2 rounded-lg font-bold text-[11px] tracking-wider spring-transition ${selectedFormat === fmt
                      ? 'border-2 border-primary-container bg-primary-fixed/20 text-on-surface shadow-sm'
                      : 'border border-outline-variant text-on-surface-variant hover:border-primary-container hover:bg-primary-fixed/10'
                    }`}
                  >
                    .{fmt}
                  </button>
                ))
              )}
            </div>
          </div>

          <button
            onClick={handleConvert}
            disabled={!selectedFormat || converting}
            className="w-full bg-gradient-to-r from-[#DDD6FE] to-[#8B5CF6] text-[#1b1c1d] font-semibold text-sm px-8 py-3 rounded-full liquid-hover spring-transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          >
            {converting ? (
              <>
                <span className="material-symbols-outlined hand-drawn-icon animate-spin" style={{ fontSize: '18px' }}>
                  sync
                </span>
                Conversione in corso...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined hand-drawn-icon" style={{ fontSize: '18px' }}>
                  swap_horiz
                </span>
                Converti in .{selectedFormat || '...'}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
