import * as vscode from 'vscode';
import { TermEntry } from '../types';

export type CloudImportMode = 'overwrite' | 'merge';

export interface CloudSyncSnapshot {
  version?: number;
  exportedAt?: string;
  terms: TermEntry[];
}

interface ApiEnvelope<T> {
  code: number;
  message: string;
  data: T;
}

interface CloudImportResult {
  imported: number;
  skipped: number;
  snapshotVersion: number;
}

export interface CloudSyncStatus {
  enabled: boolean;
  termCount: number;
  lastSyncAt: string | null;
  lastSyncStatus: 'success' | 'conflict' | 'failed' | 'running';
  pendingConflicts: number;
  snapshotVersion: number;
}

export class CloudSyncClient {
  private readonly baseUrl: string;
  private readonly accessToken: string;

  constructor(baseUrl: string, accessToken: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.accessToken = accessToken;
  }

  async status(): Promise<CloudSyncStatus> {
    return this.request<CloudSyncStatus>('/sync/status', { method: 'GET' });
  }

  async enable(): Promise<CloudSyncStatus> {
    return this.request<CloudSyncStatus>('/sync/toggle', {
      method: 'POST',
      body: JSON.stringify({ enabled: true }),
    });
  }

  async exportSnapshot(): Promise<CloudSyncSnapshot> {
    return this.request<CloudSyncSnapshot>('/sync/snapshot/export', { method: 'GET' });
  }

  async importSnapshot(mode: CloudImportMode, snapshot: CloudSyncSnapshot): Promise<CloudImportResult> {
    return this.request<CloudImportResult>('/sync/snapshot/import', {
      method: 'POST',
      body: JSON.stringify({ mode, snapshot }),
    });
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    let response: Response;

    try {
      response = await fetch(url, {
        ...init,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          ...(init.headers ?? {}),
        },
      });
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(`无法连接 TermRepo 后端：${url}。请确认后端已启动、地址配置正确。原始错误：${reason}`);
    }

    let payload: ApiEnvelope<T>;
    try {
      payload = (await response.json()) as ApiEnvelope<T>;
    } catch {
      throw new Error(`TermRepo 后端返回了非 JSON 响应：HTTP ${response.status}`);
    }
    if (!response.ok || payload.code !== 0) {
      throw new Error(payload.message || `HTTP ${response.status}`);
    }

    return payload.data;
  }
}

export function createCloudSyncClient(): CloudSyncClient | undefined {
  const config = vscode.workspace.getConfiguration('termrepoplugin-vscode');
  const baseUrl = config.get<string>('cloudSync.apiBaseUrl')?.trim() || 'http://localhost:3000/api/v1';
  const accessToken = config.get<string>('cloudSync.accessToken')?.trim();

  if (!accessToken) {
    void vscode.window.showWarningMessage('请先在设置中配置 TermRepo 云同步 Access Token。');
    return undefined;
  }

  return new CloudSyncClient(baseUrl, accessToken);
}
