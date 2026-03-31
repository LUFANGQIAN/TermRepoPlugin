import * as vscode from 'vscode';
import { copyToClipboard } from '../utils/clipboard';

/**
 * 创建“复制单词”命令。
 *
 * 该命令接收一个单词参数，将其写入系统剪贴板。
 * 通常由树视图中的单词项调用，传入对应的单词字符串。
 * 通过clipboard.ts工具中的copyToClipboard方法实现
 *
 * @returns 返回一个 `vscode.Disposable` 对象，用于注册命令。
 *
 * @example
 * ```typescript
 * // 注册命令
 * context.subscriptions.push(copyWordCommand());
 * ```
 */
export function copyWordCommand() {
  return vscode.commands.registerCommand('termrepoplugin-vscode.copyWord', async (word: string) => {
    // 参数校验：如果未传入单词或单词为空，则提示错误并返回
    if (!word || typeof word !== 'string') {
      vscode.window.showErrorMessage('无效的单词：无法复制空内容');
      return;
    }
    await copyToClipboard(word);
  });
}