import * as vscode from 'vscode';
import { StorageManager } from '../storage/StorageManager';
import { WordTreeProvider } from '../views/wordTreeProvider';
import { copyToClipboard } from '../utils/clipboard';   // 导入复制工具函数

/**
 * 创建一个用于收藏单词的 VS Code 命令。
 *
 * 命令 ID: `termrepoplugin-vscode.addWord`
 *
 * 功能描述：
 * - 优先获取当前活动编辑器的选中文本作为要收藏的单词。
 * - 如果没有选中文本，则弹出输入框让用户手动输入。
 * - 使用 {@link StorageManager} 保存单词（自动去重），并显示相应的提示消息。
 * - 成功添加后，自动将单词复制到剪贴板（无额外提示，避免重复通知）。
 * - 调用 {@link WordTreeProvider.refresh} 刷新单词列表视图。
 *
 * @param storage - 存储管理器实例，用于保存单词数据。
 * @param treeProvider - 树视图提供者实例，用于在单词添加后刷新视图（若不需要刷新可传入空对象，但不推荐）。
 * @returns 返回一个 `vscode.Disposable` 对象，可用于在扩展停用时注销命令。
 *
 * @example
 * ```typescript
 * // 在扩展激活函数中注册命令
 * const command = addWordCommand(storage, treeProvider);
 * context.subscriptions.push(command);
 * ```
 *
 * @see {@link copyToClipboard} 底层使用的剪贴板工具函数
 */
export function addWordCommand(storage: StorageManager, treeProvider: WordTreeProvider) {
  return vscode.commands.registerCommand('termrepoplugin-vscode.addWord', async () => {
    // 1. 忽略任何传入的参数，直接获取活动编辑器的选中文本
    let word: string | undefined;
    const editor = vscode.window.activeTextEditor;
    if (editor && !editor.selection.isEmpty) {
      word = editor.document.getText(editor.selection);
    }

    // 2. 如果没有选中文本，则弹出输入框让用户输入
    if (!word) {
      word = await vscode.window.showInputBox({
        prompt: '请输入要收藏的单词',
        placeHolder: '例如: hello world'
      });
    }

    if (!word) { return; }

    // 3. 保存单词
    const added = await storage.addWord(word);

    if (added) {
      treeProvider.refresh();                      // 刷新树视图
      await copyToClipboard(word, false);          // 自动复制到剪贴板，不显示额外通知
      vscode.window.showInformationMessage(`✅ 已收藏单词: ${word}`);
    } else {
      vscode.window.showWarningMessage(`⚠️ 单词 "${word}" 已存在`);
    }
  });
}