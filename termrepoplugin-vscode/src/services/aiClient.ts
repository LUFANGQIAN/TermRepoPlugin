import * as vscode from 'vscode';
import { TermDetailsDefaults, splitIdentifier } from '../utils/termUtils';

interface ApiEnvelope<T> {
  code: number;
  message: string;
  data: T;
}

export class AiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly accessToken: string
  ) {}

  async analyzeTerm(input: {
    originalText: string;
    filePath?: string;
    languageId?: string;
    fileName?: string;
    surroundingCode?: string;
  }): Promise<TermDetailsDefaults> {
    const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}/ai/analyze-term`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...input,
        parts: splitIdentifier(input.originalText),
        context: input.surroundingCode,
      }),
    });
    const payload = (await response.json()) as ApiEnvelope<TermDetailsDefaults>;
    if (!response.ok || payload.code !== 0) throw new Error(payload.message || `HTTP ${response.status}`);
    return payload.data;
  }
}

export function createAiClient(): AiClient | undefined {
  const config = vscode.workspace.getConfiguration('termrepoplugin-vscode');
  const baseUrl = config.get<string>('cloudSync.apiBaseUrl')?.trim() || 'http://localhost:3000/api/v1';
  const accessToken = config.get<string>('cloudSync.accessToken')?.trim();
  if (!accessToken) return undefined;
  return new AiClient(baseUrl, accessToken);
}
