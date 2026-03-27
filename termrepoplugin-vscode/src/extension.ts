import * as vscode from 'vscode';
import * as path from 'path';
import { registerCommands } from './commands';
import { StorageManager } from './storage/StorageManager';




//vscode弹窗打印信息
export async function activate(context: vscode.ExtensionContext) {
	console.log('TermRepoPlugin 已激活');


	// 1. 初始化存储管理器
	const storage = new StorageManager(context.globalStorageUri.fsPath);
	await storage.init();  // 确保目录存在并加载数据

	// 2. 注册所有命令（依赖注入）
	registerCommands(context, storage);


}

export function deactivate() {
	console.log('扩展被停用');



}