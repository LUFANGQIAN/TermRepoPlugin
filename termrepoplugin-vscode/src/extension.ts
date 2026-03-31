/**
 * @module 扩展入口
 * @file extension.ts
 * @description VS Code 扩展的激活入口。负责初始化存储管理器并注册所有命令。
 * @module extension
 */

import * as vscode from 'vscode';
import { registerCommands } from './commands';
import { StorageManager } from './storage/StorageManager';

/**
 * 扩展激活时调用的入口函数。
 * - 初始化存储管理器（读取全局存储目录下的单词列表）
 * - 注册所有扩展命令（通过依赖注入将存储管理器实例传递给命令注册模块）
 *
 * @param context - VS Code 扩展上下文，提供全局存储路径等资源
 * @returns 无返回值（Promise<void>）
 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
	console.log('TermRepoPlugin 已激活');

	// 1. 初始化存储管理器
	const storage = new StorageManager(context.globalStorageUri.fsPath);
	await storage.init();  // 确保目录存在并加载数据

	// 2. 注册所有命令（依赖注入）
	registerCommands(context, storage);
}

/**
 * 扩展停用时调用的清理函数。
 * 目前仅输出日志，无额外清理操作。
 */
export function deactivate(): void {
	console.log('扩展被停用');
}