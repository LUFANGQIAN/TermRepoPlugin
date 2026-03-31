// src/utils/clipboard.ts
import * as vscode from 'vscode';

/**
 * 将文本复制到剪贴板，并可选地显示提示消息。
 * @param text - 要复制的文本
 * @param showNotification - 是否显示成功提示，默认为 true
 * @returns Promise<void>
 */
export async function copyToClipboard(text: string, showNotification: boolean = true): Promise<void> {
  if (!text) {
    vscode.window.showErrorMessage('没有可复制的内容');
    return;
  }
  await vscode.env.clipboard.writeText(text);
  if (showNotification) {
    vscode.window.showInformationMessage(`✅ 已复制“${text}”`);
  }
}