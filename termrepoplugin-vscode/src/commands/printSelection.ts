import * as vscode from 'vscode';

/**
 * 创建一个用于打印选中内容的调试命令。
 *
 * 命令 ID: `termrepoplugin-vscode.printSelection`
 *
 * 功能描述：
 * - 获取当前活动编辑器中被选中的文本。
 * - 如果没有活动编辑器或未选中任何文本，则显示相应的警告消息。
 * - 将选中的文本输出到控制台，并弹窗提示。
 *
 * @returns 返回一个 `vscode.Disposable` 对象，用于注册命令。
 *
 * @example
 * ```typescript
 * // 在扩展激活时注册命令
 * context.subscriptions.push(printSelectionCommand());
 * ```
 */
export function printSelectionCommand() {
  return vscode.commands.registerCommand('termrepoplugin-vscode.printSelection', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('没有活动的编辑器');
      return;
    }

    const selection = editor.selection;
    if (selection.isEmpty) {
      vscode.window.showWarningMessage('没有选中任何文本');
      return;
    }

    const selectedText = editor.document.getText(selection);
    // 打印到控制台
    console.log('选中的内容:', selectedText);

    // 弹出消息框显示
    vscode.window.showInformationMessage(`选中内容: ${selectedText}`);
  });
}