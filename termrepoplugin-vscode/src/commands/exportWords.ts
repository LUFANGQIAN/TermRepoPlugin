import * as os from 'os';
import * as vscode from 'vscode';
import { StorageManager } from '../storage/StorageManager';

export function exportWordsCommand(storage: StorageManager): vscode.Disposable {
  return vscode.commands.registerCommand('termrepoplugin-vscode.exportWords', async () => {
    const allTerms = storage.getAllTerms();
    if (allTerms.length === 0) {
      void vscode.window.showInformationMessage('当前词库为空，没有可导出的单词。');
      return;
    }

    const defaultUri = vscode.Uri.joinPath(
      vscode.workspace.workspaceFolders?.[0]?.uri ?? vscode.Uri.file(os.homedir()),
      'termrepo-words.json'
    );

    const targetUri = await vscode.window.showSaveDialog({
      defaultUri,
      filters: { JSON: ['json'] },
      saveLabel: '导出词库',
      title: '导出 TermRepo 单词库',
    });

    if (!targetUri) {
      return;
    }

    const content = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        count: allTerms.length,
        terms: allTerms,
      },
      null,
      2
    );

    await vscode.workspace.fs.writeFile(targetUri, Buffer.from(content, 'utf8'));
    void vscode.window.showInformationMessage(`已导出 ${allTerms.length} 个单词到 ${targetUri.fsPath}`);
  });
}
