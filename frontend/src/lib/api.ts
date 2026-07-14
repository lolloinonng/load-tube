import type { AnalyzeResponse, DownloadResponse, DownloadStatus, AdminStats, AdminLog } from '@/types';

const API_BASE = '/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
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

export async function getUsers(token: string): Promise<{ success: boolean; data: { id: string; email: string; role: string; createdAt: string }[] }> {
  return fetchApi('/admin/users', { headers: { Authorization: `Bearer ${token}` } });
}

export async function createUserApi(token: string, email: string, role?: string): Promise<{ success: boolean; data: any }> {
  return fetchApi('/admin/users', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ email, role }),
  });
}

export async function deleteUserApi(token: string, id: string): Promise<{ success: boolean }> {
  return fetchApi(`/admin/users/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}
