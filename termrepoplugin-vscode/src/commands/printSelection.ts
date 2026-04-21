import * as vscode from 'vscode';

/**
 * 创建“打印选中内容”命令。
 *
 * 这个命令主要服务于调试阶段，用来快速验证：
 * - 当前是否拿到了活动编辑器
 * - 当前选区内容是否正确
 * - 命令注册与执行链路是否正常
 *
 * @returns 注册完成后的命令句柄。
 */
export function printSelectionCommand(): vscode.Disposable {
  return vscode.commands.registerCommand('termrepoplugin-vscode.printSelection', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      void vscode.window.showWarningMessage('没有活动的编辑器。');
      return;
    }

    const selection = editor.selection;
    if (selection.isEmpty) {
      void vscode.window.showWarningMessage('没有选中任何文本。');
      return;
    }

    const selectedText = editor.document.getText(selection);
    console.log('选中的内容:', selectedText);
    void vscode.window.showInformationMessage(`选中内容: ${selectedText}`);
  });
}
