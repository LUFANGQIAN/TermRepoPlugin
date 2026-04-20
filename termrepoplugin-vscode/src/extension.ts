// src/extension.ts
import * as vscode from 'vscode';
import { registerCommands } from './commands';
import { StorageManager } from './storage/StorageManager';
import { registerWebviewView } from './views';


export async function activate(context: vscode.ExtensionContext): Promise<void> {
	console.log('TermRepoPlugin 已激活');
	vscode.window.showInformationMessage('TermRepoPlugin 已激活');

	const storage = new StorageManager(context.globalStorageUri.fsPath);
	await storage.init();

	registerCommands(context, storage);

	console.log('测试回滚');


	// 注册 Webview 侧边栏面板
	registerWebviewView(context);
}
export function deactivate(): void {
	console.log('扩展被停用');
}