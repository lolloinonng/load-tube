import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getVideoInfo: (url: string) => ipcRenderer.invoke('get-video-info', url),
  downloadVideo: (url: string, itag: string) => ipcRenderer.invoke('download-video', url, itag),
  convertFile: (inputPath: string, outputFormat: string) => ipcRenderer.invoke('convert-file', inputPath, outputFormat),
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
});
