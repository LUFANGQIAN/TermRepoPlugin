import * as vscode from 'vscode';
import { StorageManager } from '../storage/StorageManager';

/**
 * 创建“显示所有单词”命令。
 * 通过 QuickPick 列出所有已收藏的单词，点击可复制到剪贴板。
 *
 * @param storage - 存储管理器实例
 * @returns 命令的 Disposable 对象
 */
export function showAllWordsCommand(storage: StorageManager) {
  return vscode.commands.registerCommand(
    'termrepoplugin-vscode.showAllWords',
    async () => {
      const words = storage.getAllWords();
      if (words.length === 0) {
        vscode.window.showInformationMessage('📭 暂无收藏的单词');
        return;
      }

      const selected = await vscode.window.showQuickPick(words, {
        placeHolder: `共 ${words.length} 个单词，点击复制到剪贴板`,
        ignoreFocusOut: true,
      });

      if (selected) {
        await vscode.env.clipboard.writeText(selected);
        vscode.window.showInformationMessage(`✅ 已复制“${selected}”到剪贴板`);
      }
    }
  );
}