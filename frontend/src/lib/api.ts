import type { AnalyzeResponse, DownloadResponse, DownloadStatus, AdminStats, AdminLog } from '@/types';

const API_BASE = '/api';

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getCookie('site_token');
  const res = await fetch(`${API_BASE}${endpoint}`, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
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

export async function getAdminStats(): Promise<{ success: boolean; data: AdminStats }> {
  return fetchApi('/admin/stats');
}

export async function getAdminLogs(limit?: number): Promise<{ success: boolean; data: AdminLog[] }> {
  const params = limit ? `?limit=${limit}` : '';
  return fetchApi(`/admin/logs${params}`);
}

export async function healthCheck(): Promise<{ success: boolean; data: { status: string; uptime: number } }> {
  return fetchApi('/health');
}

export async function getUsers(): Promise<{ success: boolean; data: { id: string; email: string; role: string; createdAt: string }[] }> {
  return fetchApi('/admin/users');
}

export async function createUserApi(email: string, role?: string): Promise<{ success: boolean; data: any }> {
  return fetchApi('/admin/users', {
    method: 'POST',
    body: JSON.stringify({ email, role }),
  });
}

export async function deleteUserApi(id: string): Promise<{ success: boolean }> {
  return fetchApi(`/admin/users/${id}`, { method: 'DELETE' });
}
