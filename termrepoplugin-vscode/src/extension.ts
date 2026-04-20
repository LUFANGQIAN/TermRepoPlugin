import * as vscode from 'vscode';
import { registerCommands } from './commands';
import { registerTermCompletionProvider } from './providers/termCompletionProvider';
import { StorageManager } from './storage/StorageManager';
import { registerWebviewView } from './views';

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const storage = new StorageManager(context.globalStorageUri.fsPath);
  await storage.init();

  registerCommands(context, storage);
  registerTermCompletionProvider(context, storage);
  registerWebviewView(context, storage);
}

export function deactivate(): void {
  // no-op
}
