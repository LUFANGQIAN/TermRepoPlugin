import * as vscode from 'vscode';
import { StorageManager } from '../storage/StorageManager';
import { copyToClipboard } from '../utils/clipboard';

/**
 * 创建“显示所有单词”命令。
 *
 * 命令 ID: `termrepoplugin-vscode.showAllWords`
 *
 * 功能描述：
 * - 从 StorageManager 获取所有已收藏的单词。
 * - 如果没有单词，显示提示信息。
 * - 通过 QuickPick 列出所有单词，支持滚动查看。
 * - 点击任意单词即可将其复制到剪贴板（使用 {@link copyToClipboard} 工具函数）。
 *
 * @param storage - 存储管理器实例，用于获取单词列表。
 * @returns 返回一个 `vscode.Disposable` 对象，用于注册命令。
 *
 * @example
 * ```typescript
 * // 在扩展激活时注册命令
 * const showAllWords = showAllWordsCommand(storage);
 * context.subscriptions.push(showAllWords);
 * ```
 *
 * @see {@link copyToClipboard}
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
        await copyToClipboard(selected); // 使用工具函数复制
      }
    }
  );
}