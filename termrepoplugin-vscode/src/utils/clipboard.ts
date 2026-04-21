import * as vscode from 'vscode';

/**
 * 将文本复制到系统剪贴板。
 *
 * 该函数对剪贴板写入做了一层统一封装，
 * 便于不同命令和视图复用同一套反馈逻辑。
 *
 * @param text 要复制的文本内容。
 * @param showNotification 是否在成功后弹出提示消息，默认为 `true`。
 */
export async function copyToClipboard(text: string, showNotification: boolean = true): Promise<void> {
  if (!text) {
    void vscode.window.showErrorMessage('没有可复制的内容。');
    return;
  }

  await vscode.env.clipboard.writeText(text);
  if (showNotification) {
    void vscode.window.showInformationMessage(`已复制：${text}`);
  }
}
