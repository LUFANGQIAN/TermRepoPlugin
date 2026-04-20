import * as vscode from 'vscode';
import { MyWebviewProvider } from "./MyWebviewProvider";

/**
 * 注册 Webview 视图（供 extension.ts 调用）
 * @param context 插件上下文
 */
export function registerWebviewView(context: vscode.ExtensionContext) {
  const provider = new MyWebviewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('myWebview', provider)
  );
}