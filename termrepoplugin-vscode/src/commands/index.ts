import * as vscode from 'vscode';
import { StorageManager } from '../storage/StorageManager';
import { addWordCommand } from './addWord';
import { copyWordCommand } from './copyWord';
import { configureFavoriteKeybindingCommand } from './configureFavoriteKeybinding';
import { exportWordsCommand } from './exportWords';
import { importWordsCommand } from './importWords';
import { printSelectionCommand } from './printSelection';
import { showAllWordsCommand } from './showAllWords';

export { addWordCommand } from './addWord';
export { copyWordCommand } from './copyWord';
export { configureFavoriteKeybindingCommand } from './configureFavoriteKeybinding';
export { exportWordsCommand } from './exportWords';
export { importWordsCommand } from './importWords';
export { printSelectionCommand } from './printSelection';
export { showAllWordsCommand } from './showAllWords';

/**
 * 注册插件中的全部命令。
 *
 * 该函数统一负责：
 * - 创建每个命令对应的 `Disposable`
 * - 将它们放入扩展上下文的订阅列表
 * - 让所有命令共享同一份词库存储实例
 *
 * 这样做可以让命令层保持轻量，同时把注册逻辑集中在一个入口中。
 *
 * @param context 扩展上下文，用于托管命令的生命周期。
 * @param storage 词库存储管理器，供命令读取和写入业务数据。
 */
export function registerCommands(
  context: vscode.ExtensionContext,
  storage: StorageManager
): void {
  const commands = [
    printSelectionCommand(),
    showAllWordsCommand(storage),
    addWordCommand(storage),
    copyWordCommand(),
    configureFavoriteKeybindingCommand(),
    exportWordsCommand(storage),
    importWordsCommand(storage),
  ];

  context.subscriptions.push(...commands);
}
