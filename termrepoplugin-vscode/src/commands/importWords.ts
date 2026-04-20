import * as vscode from 'vscode';
import { StorageManager } from '../storage/StorageManager';
import { TermEntry } from '../types';

interface ImportFileShape {
  terms?: unknown;
}

export function importWordsCommand(storage: StorageManager): vscode.Disposable {
  return vscode.commands.registerCommand('termrepoplugin-vscode.importWords', async () => {
    const sourceUris = await vscode.window.showOpenDialog({
      canSelectMany: false,
      canSelectFiles: true,
      canSelectFolders: false,
      filters: { JSON: ['json'] },
      openLabel: '导入词库',
      title: '导入 TermRepo 单词库',
    });

    const sourceUri = sourceUris?.[0];
    if (!sourceUri) {
      return;
    }

    const raw = await vscode.workspace.fs.readFile(sourceUri);
    const parsed = JSON.parse(Buffer.from(raw).toString('utf8')) as ImportFileShape;
    const importedTerms = normalizeImportedTerms(parsed);

    if (importedTerms.length === 0) {
      void vscode.window.showWarningMessage('导入文件中没有可用的单词数据。');
      return;
    }

    let importedCount = 0;
    let skippedCount = 0;

    for (const term of importedTerms) {
      const added = await storage.addTerm(term);
      if (added) {
        importedCount += 1;
      } else {
        skippedCount += 1;
      }
    }

    void vscode.window.showInformationMessage(
      `导入完成：新增 ${importedCount} 个，跳过 ${skippedCount} 个重复词条。`
    );
  });
}

function normalizeImportedTerms(parsed: ImportFileShape): TermEntry[] {
  if (!Array.isArray(parsed.terms)) {
    return [];
  }

  return parsed.terms
    .map((item) => normalizeTerm(item))
    .filter((term): term is TermEntry => term !== null);
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
