import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { execFile, exec } from 'child_process';
import fs from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);
const existsAsync = promisify(fs.exists);

process.env.DIST = path.join(__dirname, '../dist');
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public');

let mainWin: BrowserWindow | null = null;

function getBinDir() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'binaries');
  }
  return path.join(__dirname, '../binaries');
}

function getYtdlpPath(): string {
  const binDir = getBinDir();
  const isWin = process.platform === 'win32';
  return path.join(binDir, isWin ? 'yt-dlp.exe' : 'yt-dlp');
}

function getFfmpegPath(): string {
  const binDir = getBinDir();
  const isWin = process.platform === 'win32';
  return path.join(binDir, isWin ? 'ffmpeg.exe' : 'ffmpeg');
}

function getFfprobePath(): string {
  const binDir = getBinDir();
  const isWin = process.platform === 'win32';
  return path.join(binDir, isWin ? 'ffprobe.exe' : 'ffprobe');
}

const isDev = !app.isPackaged;

function createWindow() {
  mainWin = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 800,
    minHeight: 600,
    frame: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    backgroundColor: '#0f0f0f',
  });

  mainWin.once('ready-to-show', () => mainWin?.show());

  if (isDev) {
    mainWin.loadURL('http://localhost:5173');
    mainWin.webContents.openDevTools();
  } else {
    mainWin.loadFile(path.join(process.env.DIST!, 'index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ---- IPC Handlers ----

// Get video info via yt-dlp
ipcMain.handle('get-video-info', async (_event, url: string) => {
  const ytdlp = getYtdlpPath();
  if (!(await existsAsync(ytdlp))) {
    return { success: false, error: `yt-dlp non trovato in ${ytdlp}. Scarica il binario da https://github.com/yt-dlp/yt-dlp/releases e mettilo in desktop/binaries/` };
  }
  try {
    const { stdout } = await execAsync(`"${ytdlp}" --dump-json --no-download "${url}"`);
    const data = JSON.parse(stdout.trim());
    return {
      success: true,
      data: {
        title: data.title,
        duration: data.duration,
        thumbnail: data.thumbnail,
        author: data.channel || data.uploader,
        formats: (data.formats || [])
          .filter((f: any) => f.vcodec !== 'none' && f.acodec !== 'none')
          .map((f: any) => ({
            itag: f.format_id,
            quality: f.format_note || f.height + 'p' || f.quality,
            container: f.ext,
            contentLength: f.filesize?.toString() || f.filesize_approx?.toString(),
            hasAudio: f.acodec !== 'none',
            hasVideo: f.vcodec !== 'none',
          })),
      },
    };
  } catch (err: any) {
    return { success: false, error: err.stderr || err.message };
  }
});

// Download video
ipcMain.handle('download-video', async (_event, url: string, itag: string) => {
  const ytdlp = getYtdlpPath();
  if (!(await existsAsync(ytdlp))) {
    return { success: false, error: `yt-dlp non trovato in ${ytdlp}` };
  }

  const result = await dialog.showSaveDialog(mainWin!, {
    title: 'Salva il video',
    buttonLabel: 'Salva',
    filters: [{ name: 'Video', extensions: ['mp4'] }],
  });

  if (result.canceled || !result.filePath) {
    return { success: false, error: 'Salvataggio annullato' };
  }

  try {
    const { stdout } = await execAsync(`"${ytdlp}" -f ${itag} -o "${result.filePath}" "${url}"`);
    return { success: true, data: { path: result.filePath } };
  } catch (err: any) {
    return { success: false, error: err.stderr || err.message };
  }
});

// Convert file with ffmpeg
ipcMain.handle('convert-file', async (_event, inputPath: string, outputFormat: string) => {
  const ffmpegPath = getFfmpegPath();
  if (!(await existsAsync(ffmpegPath))) {
    return { success: false, error: `ffmpeg non trovato in ${ffmpegPath}` };
  }

  const ext = path.extname(inputPath);
  const basename = path.basename(inputPath, ext);
  const outputPath = path.join(path.dirname(inputPath), `${basename}.${outputFormat}`);

  try {
    await execAsync(`"${ffmpegPath}" -i "${inputPath}" "${outputPath}"`);
    return { success: true, data: { path: outputPath } };
  } catch (err: any) {
    return { success: false, error: err.stderr || err.message };
  }
});

// Open file dialog
ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWin!, {
    title: 'Seleziona file',
    properties: ['openFile'],
    filters: [
      { name: 'Tutti i formati supportati', extensions: ['mp4', 'avi', 'mov', 'mkv', 'webm', 'wmv', 'flv', 'mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'pdf'] },
      { name: 'Video', extensions: ['mp4', 'avi', 'mov', 'mkv', 'webm', 'wmv', 'flv'] },
      { name: 'Audio', extensions: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma'] },
      { name: 'Immagini', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif'] },
    ],
  });
  if (result.canceled || !result.filePaths.length) {
    return { success: false, error: 'Nessun file selezionato' };
  }
  return { success: true, data: { path: result.filePaths[0] } };
});
