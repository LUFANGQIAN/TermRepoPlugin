import * as vscode from 'vscode';
import { copyToClipboard } from '../utils/clipboard';

/**
 * 创建“复制单词”命令。
 *
 * 该命令通常由词库列表或 Webview 详情页触发，
 * 接收一个明确的单词字符串并复制到系统剪贴板。
 *
 * @returns 注册完成后的命令句柄。
 */
export function copyWordCommand(): vscode.Disposable {
  return vscode.commands.registerCommand('termrepoplugin-vscode.copyWord', async (word: string) => {
    if (!word || typeof word !== 'string') {
      void vscode.window.showErrorMessage('无效的单词内容，无法执行复制。');
      return;
    }

    await copyToClipboard(word);
  });
}
