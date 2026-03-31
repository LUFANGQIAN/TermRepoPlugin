/**
 * @module 命令模块
 * @description 本模块集中导出所有命令工厂函数，并提供统一的注册方法。
 * 命令工厂函数返回 `vscode.Disposable`，可在扩展激活时一次性注册到上下文。
 *
 * 已实现的命令：
 * - `addWordCommand`: 添加单词（选中或输入）到收藏
 * - `printSelectionCommand`: 打印选中内容（调试用）
 * - `showAllWordsCommand`: 显示所有单词并通过 QuickPick 复制
 * - `copyWordCommand`: 将指定单词复制到剪贴板
 */

import * as vscode from 'vscode';
import { StorageManager } from '../storage/StorageManager';
import { printSelectionCommand } from './printSelection';
import { addWordCommand } from './addWord';
import { showAllWordsCommand } from './showAllWords';
import { WordTreeProvider } from '../views/wordTreeProvider';
import { copyWordCommand } from './copyWord';

export { addWordCommand } from './addWord';
export { printSelectionCommand } from './printSelection';
export { showAllWordsCommand } from './showAllWords';
export { copyWordCommand } from './copyWord';

/**
 * 注册所有命令，并将它们的 disposable 对象添加到 context.subscriptions。
 * 
 * 该函数应在扩展激活时调用，确保所有命令被正确注册并随扩展停用而自动清理。
 *
 * @param context - 扩展上下文，用于管理命令的生命周期。
 * @param storage - 存储管理器实例，用于命令中操作单词数据。
 * @param treeProvider - 树视图提供者实例，用于命令中刷新单词列表视图。
 */
export function registerCommands(
  context: vscode.ExtensionContext,
  storage: StorageManager,
  treeProvider: WordTreeProvider
) {
  // 收集所有命令的 disposable
  const commands = [
    printSelectionCommand(),
    showAllWordsCommand(storage),
    addWordCommand(storage, treeProvider),
    copyWordCommand(),
  ];

  // 一次性将所有命令添加到订阅中
  context.subscriptions.push(...commands);
}