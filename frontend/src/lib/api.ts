import type { AnalyzeResponse, DownloadResponse, DownloadStatus, AdminStats, AdminLog } from '@/types';

const API_BASE = '/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data;
}

export async function analyzeUrl(url: string): Promise<AnalyzeResponse> {
  return fetchApi<AnalyzeResponse>('/analyze', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}

export async function startDownload(url: string, format: string, quality: string): Promise<DownloadResponse> {
  return fetchApi<DownloadResponse>('/download', {
    method: 'POST',
    body: JSON.stringify({ url, format, quality }),
  });
}

export async function getDownloadStatus(jobId: string): Promise<{ success: boolean; data: DownloadStatus }> {
  return fetchApi(`/download/status/${jobId}`);
}

export function getDownloadFileUrl(jobId: string): string {
  return `${API_BASE}/download/file/${jobId}`;
}

export async function adminLogin(username: string, password: string): Promise<{ success: boolean; data: { token: string } }> {
  return fetchApi('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function getAdminStats(token: string): Promise<{ success: boolean; data: AdminStats }> {
  return fetchApi('/admin/stats', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getAdminLogs(token: string, limit?: number): Promise<{ success: boolean; data: AdminLog[] }> {
  const params = limit ? `?limit=${limit}` : '';
  return fetchApi(`/admin/logs${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function healthCheck(): Promise<{ success: boolean; data: { status: string; uptime: number } }> {
  return fetchApi('/health');
}
