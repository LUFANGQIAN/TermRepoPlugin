import * as os from 'os';
import * as vscode from 'vscode';
import { StorageManager } from '../storage/StorageManager';

/**
 * 创建“导出单词库”命令。
 *
 * 导出流程会将当前词库包装成一个带元信息的 JSON 文件，包含：
 * - 导出时间
 * - 词条数量
 * - 词条数组
 *
 * 这样既方便人工阅读，也方便后续再次导入。
 *
 * @param storage 词库存储管理器，用于读取当前全部词条。
 * @returns 注册完成后的命令句柄。
 */
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
