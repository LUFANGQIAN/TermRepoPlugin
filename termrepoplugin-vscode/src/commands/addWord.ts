import * as vscode from 'vscode';
import { StorageManager } from '../storage/StorageManager';

export function addWordCommand(storage: StorageManager) {
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
      vscode.window.showInformationMessage(`✅ 已收藏单词: ${word}`);
    } else {
      vscode.window.showWarningMessage(`⚠️ 单词 "${word}" 已存在`);
    }
  });
}