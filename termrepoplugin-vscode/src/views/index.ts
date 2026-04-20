import * as vscode from 'vscode';
import { StorageManager } from '../storage/StorageManager';
import { MyWebviewProvider } from './MyWebviewProvider';

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
