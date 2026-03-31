import * as vscode from 'vscode';
import { StorageManager } from '../storage/StorageManager';
import { printSelectionCommand } from './printSelection';
import { addWordCommand } from './addWord';
import { showAllWordsCommand } from './showAllWords';


export { addWordCommand } from './addWord';
export { printSelectionCommand } from './printSelection';
export { showAllWordsCommand } from './showAllWords';

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
    showAllWordsCommand(storage),
  ];

  // 一次性将所有命令添加到订阅中
  context.subscriptions.push(...commands);
}
