import * as vscode from 'vscode';
import { StorageManager } from '../storage/StorageManager';
import { printSelectionCommand } from './printSelection';
import { addWordCommand } from './addWord';
// 将来可以继续导入更多命令...

/**
 * 注册所有命令，并将它们的 disposable 对象添加到 context.subscriptions。
 * @param context - 扩展上下文
 * @param storage - 存储管理器实例
 */

export function registerCommands(context: vscode.ExtensionContext, storage: StorageManager) {
  // 收集所有命令的 disposable
  const commands = [
    printSelectionCommand(),
    addWordCommand(storage),

  ];

  // 一次性将所有命令添加到订阅中
  context.subscriptions.push(...commands);
}