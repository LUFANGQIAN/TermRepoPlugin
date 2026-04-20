import * as vscode from 'vscode';
import { StorageManager } from '../storage/StorageManager';
import { copyToClipboard } from '../utils/clipboard';
import { askForTermDetails } from '../utils/termUtils';


/**
 * 创建一个用于收藏单词的 VS Code 命令。
 *
 * 命令 ID: `termrepoplugin-vscode.addWord`
 *
 * 功能描述：
 * - 优先获取当前活动编辑器的选中文本作为要收藏的单词。
 * - 如果没有选中文本，则弹出输入框让用户手动输入。
 * - 通过问答形式询问整体备注和每个拆分部分的备注，自动生成标签。
 * - 使用 {@link StorageManager} 保存单词（自动去重），并显示相应的提示消息。
 * - 成功添加后，自动将单词复制到剪贴板（无额外提示，避免重复通知）。
 * - 调用 {@link WordTreeProvider.refresh} 刷新单词列表视图。
 * - 将用户输入的备注记录到学习库，用于后续智能提示。
 *
 * @param storage - 存储管理器实例，用于保存单词数据。
 * @param treeProvider - 树视图提供者实例，用于在单词添加后刷新视图。
 * @returns 返回一个 `vscode.Disposable` 对象，可用于在扩展停用时注销命令。
 */
export function addWordCommand(storage: StorageManager) {
  return vscode.commands.registerCommand('termrepoplugin-vscode.addWord', async () => {
    // 1. 获取活动编辑器和选中文本
    let word: string | undefined;
    const editor = vscode.window.activeTextEditor;
    let filePath: string | undefined;

    if (editor && !editor.selection.isEmpty) {
      word = editor.document.getText(editor.selection);
      filePath = vscode.workspace.asRelativePath(editor.document.uri);
    }

    // 2. 如果没有选中文本，则弹出输入框让用户输入
    if (!word) {
      word = await vscode.window.showInputBox({
        prompt: '请输入要收藏的单词',
        placeHolder: '例如: hello world'
      });
      filePath = undefined;
    }

    if (!word) { return; }

    // 3. 清理空格：去除首尾空格，并检查有效性
    word = word.trim();
    if (word === '') {
      vscode.window.showWarningMessage('单词不能为空，请重新选择或输入');
      return;
    }

    // 可选：检查是否包含内部空格（短语暂不支持）
    if (word.includes(' ')) {
      vscode.window.showWarningMessage('暂不支持添加包含空格的短语，请选择单个单词');
      return;
    }

    // 4. 检查单词是否已存在（基于清理后的单词）
    if (storage.hasTerm(word)) {
      vscode.window.showWarningMessage(`⚠️ 单词 "${word}" 已存在`);
      return;
    }

    const getSuggestion = (partText: string) => storage.getTopSuggestion(partText);
    const newTerm = await askForTermDetails(word, filePath, getSuggestion);
    if (!newTerm) {
      vscode.window.showInformationMessage('已取消添加单词');
      return;
    }

    const added = await storage.addTerm(newTerm);
    if (added) {
      for (const part of newTerm.parts) {
        if (part.note) {
          await storage.updateSuggestion(part.text, part.note);
        }
      }
      // 不再刷新树视图，可以在这里通知 Webview 视图更新（可选）
      await copyToClipboard(word, false);
      vscode.window.showInformationMessage(`✅ 已收藏单词: ${word}`);
    } else {
      vscode.window.showWarningMessage(`⚠️ 单词 "${word}" 已存在`);
    }
  });
}