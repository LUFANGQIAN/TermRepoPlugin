import * as vscode from 'vscode';
import { StorageManager } from '../storage/StorageManager';
import { copyToClipboard } from '../utils/clipboard';

/**
 * 创建“显示所有单词”命令。
 *
 * 命令会将词库中的所有单词汇总成 Quick Pick 列表，便于用户快速：
 * - 浏览已有词条
 * - 通过输入关键字缩小范围
 * - 选中后立即复制单词内容
 *
 * @param storage 词库存储管理器，用于读取全部词条。
 * @returns 注册完成后的命令句柄。
 */
export function showAllWordsCommand(storage: StorageManager): vscode.Disposable {
  return vscode.commands.registerCommand('termrepoplugin-vscode.showAllWords', async () => {
    const words = storage.getAllTerms().map((term) => term.originalText);
    if (words.length === 0) {
      void vscode.window.showInformationMessage('当前还没有收藏任何单词。');
      return;
    }

    const selected = await vscode.window.showQuickPick(words, {
      placeHolder: `共 ${words.length} 个单词，选择后将复制到剪贴板`,
      ignoreFocusOut: true,
    });

    if (selected) {
      await copyToClipboard(selected);
    }
  });
}
