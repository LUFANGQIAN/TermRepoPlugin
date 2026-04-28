import * as vscode from 'vscode';
import { createCloudSyncClient, type CloudImportMode, type CloudSyncSnapshot } from '../services/cloudSyncClient';
import { StorageManager } from '../storage/StorageManager';
import { TermEntry } from '../types';

export function cloudSyncStatusCommand(): vscode.Disposable {
  return vscode.commands.registerCommand('termrepoplugin-vscode.cloudSyncStatus', async () => {
    const client = createCloudSyncClient();
    if (!client) {
      return;
    }

    await runCloudSyncTask('正在查询 TermRepo 云同步状态...', async () => {
      const status = await client.status();
      void vscode.window.showInformationMessage(
        `云同步：${status.enabled ? '已启用' : '未启用'}，云端 ${status.termCount} 条，版本 ${status.snapshotVersion}`
      );
    });
  });
}

export function uploadCloudSnapshotCommand(storage: StorageManager): vscode.Disposable {
  return vscode.commands.registerCommand('termrepoplugin-vscode.uploadCloudSnapshot', async () => {
    const client = createCloudSyncClient();
    if (!client) {
      return;
    }

    const terms = storage.getAllTerms();
    const snapshot: CloudSyncSnapshot = {
      exportedAt: new Date().toISOString(),
      terms,
    };

    await runCloudSyncTask('正在上传 TermRepo 词库快照...', async () => {
      await client.enable();
      const result = await client.importSnapshot('overwrite', snapshot);
      void vscode.window.showInformationMessage(
        `上传完成：${terms.length} 条本地词条已写入云端，云端版本 ${result.snapshotVersion}。`
      );
    });
  });
}

export function downloadCloudSnapshotCommand(storage: StorageManager): vscode.Disposable {
  return vscode.commands.registerCommand('termrepoplugin-vscode.downloadCloudSnapshot', async () => {
    const client = createCloudSyncClient();
    if (!client) {
      return;
    }

    const mode = await pickImportMode('选择云端快照写入本地的方式');
    if (!mode) {
      return;
    }

    await runCloudSyncTask('正在拉取 TermRepo 云端词库...', async () => {
      const snapshot = await client.exportSnapshot();
      const terms = normalizeTerms(snapshot.terms);

      if (mode === 'overwrite') {
        await storage.replaceTerms(terms);
        void vscode.window.showInformationMessage(`拉取完成：本地词库已覆盖为云端 ${terms.length} 条词条。`);
        return;
      }

      const result = await storage.mergeTerms(terms);
      void vscode.window.showInformationMessage(
        `拉取完成：新增 ${result.imported} 条，跳过 ${result.skipped} 条重复词条。`
      );
    });
  });
}

export function mergeWithCloudCommand(storage: StorageManager): vscode.Disposable {
  return vscode.commands.registerCommand('termrepoplugin-vscode.mergeWithCloud', async () => {
    const client = createCloudSyncClient();
    if (!client) {
      return;
    }

    await runCloudSyncTask('正在合并 TermRepo 本地与云端词库...', async () => {
      await client.enable();
      const cloudSnapshot = await client.exportSnapshot();
      const cloudTerms = normalizeTerms(cloudSnapshot.terms);
      const localMerge = await storage.mergeTerms(cloudTerms);
      const mergedTerms = storage.getAllTerms();
      const uploadResult = await client.importSnapshot('merge', {
        exportedAt: new Date().toISOString(),
        terms: mergedTerms,
      });

      void vscode.window.showInformationMessage(
        `合并完成：本地新增 ${localMerge.imported} 条，云端版本 ${uploadResult.snapshotVersion}。`
      );
    });
  });
}

async function runCloudSyncTask(title: string, task: () => Promise<void>): Promise<void> {
  try {
    await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title },
      task
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    void vscode.window.showErrorMessage(`TermRepo 云同步失败：${message}`);
  }
}

async function pickImportMode(title: string): Promise<CloudImportMode | undefined> {
  const selected = await vscode.window.showQuickPick(
    [
      { label: '合并到本地', description: '保留本地词条，只新增云端不存在的词条', mode: 'merge' as const },
      { label: '覆盖本地', description: '用云端快照替换当前本地词库', mode: 'overwrite' as const },
    ],
    { title, placeHolder: '请选择同步方式' }
  );

  return selected?.mode;
}

function normalizeTerms(terms: unknown): TermEntry[] {
  if (!Array.isArray(terms)) {
    return [];
  }
  return terms.map((term) => normalizeTerm(term)).filter((term): term is TermEntry => term !== null);
}

function normalizeTerm(value: unknown): TermEntry | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const candidate = value as Partial<TermEntry>;
  if (!candidate.id || !candidate.originalText || !Array.isArray(candidate.parts) || !Array.isArray(candidate.tags)) {
    return null;
  }

  const now = Date.now();
  return {
    id: String(candidate.id),
    originalText: String(candidate.originalText),
    overallNote: typeof candidate.overallNote === 'string' ? candidate.overallNote : undefined,
    filePath: typeof candidate.filePath === 'string' ? candidate.filePath : undefined,
    parts: candidate.parts
      .map((part) => ({
        text: String(part.text),
        note: typeof part.note === 'string' ? part.note : undefined,
        tags: Array.isArray(part.tags) ? part.tags.map((tag) => String(tag)) : [],
        type: typeof part.type === 'string' ? part.type : undefined,
      }))
      .filter((part) => part.text.length > 0),
    tags: candidate.tags.map((tag) => String(tag)),
    createdAt: typeof candidate.createdAt === 'number' ? candidate.createdAt : now,
    updatedAt: typeof candidate.updatedAt === 'number' ? candidate.updatedAt : now,
    mastery: typeof candidate.mastery === 'number' ? candidate.mastery : 0,
    reviewCount: typeof candidate.reviewCount === 'number' ? candidate.reviewCount : 0,
    nextReviewDate: typeof candidate.nextReviewDate === 'number' ? candidate.nextReviewDate : undefined,
  };
}
