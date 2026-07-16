import type { AnalyzeResponse, DownloadResponse, DownloadStatus, AdminStats, AdminLog } from '@/types';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(endpoint, {
    credentials: 'include',
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

export async function analyzeUrl(url: string): Promise<AnalyzeResponse> {
  return fetchApi<AnalyzeResponse>('/api/analyze', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}

export async function startDownload(url: string, format: string, quality: string): Promise<DownloadResponse> {
  return fetchApi<DownloadResponse>('/api/download', {
    method: 'POST',
    body: JSON.stringify({ url, format, quality }),
  });
}

export async function getDownloadStatus(jobId: string): Promise<{ success: boolean; data: DownloadStatus }> {
  return fetchApi(`/api/download/status/${jobId}`);
}

export function getDownloadFileUrl(jobId: string): string {
  return `/api/download/file/${jobId}`;
}

export async function getAdminStats(): Promise<{ success: boolean; data: AdminStats }> {
  return fetchApi('/api/admin/stats');
}

export async function getAdminLogs(limit?: number): Promise<{ success: boolean; data: AdminLog[] }> {
  const params = limit ? `?limit=${limit}` : '';
  return fetchApi(`/api/admin/logs${params}`);
}

export async function healthCheck(): Promise<{ success: boolean; data: { status: string; uptime: number } }> {
  return fetchApi('/api/health');
}

export async function getUsers(): Promise<{ success: boolean; data: { id: string; email: string; role: string; createdAt: string }[] }> {
  return fetchApi('/api/admin/users');
}

export async function createUserApi(email: string, role?: string): Promise<{ success: boolean; data: any }> {
  return fetchApi('/api/admin/users', {
    method: 'POST',
    body: JSON.stringify({ email, role }),
  });
}

export async function deleteUserApi(id: string): Promise<{ success: boolean }> {
  return fetchApi(`/api/admin/users/${id}`, { method: 'DELETE' });
}
