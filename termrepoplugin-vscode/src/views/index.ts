import * as vscode from 'vscode';
import { StorageManager } from '../storage/StorageManager';
import { MyWebviewProvider } from './MyWebviewProvider';

/**
 * 注册侧边栏 Webview 视图。
 *
 * 该函数负责创建 {@link MyWebviewProvider}，
 * 并将视图提供器与存储层统一纳入扩展上下文的生命周期管理。
 *
 * @param context 扩展上下文。
 * @param storage 词库存储管理器。
 */
export function registerWebviewView(
  context: vscode.ExtensionContext,
  storage: StorageManager
): void {
  const provider = new MyWebviewProvider(context.extensionUri, storage);
  context.subscriptions.push(
    storage,
    provider,
    vscode.window.registerWebviewViewProvider('myWebview', provider)
  );
}
