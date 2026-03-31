// src/views/index.ts
import * as vscode from 'vscode';
import { StorageManager } from '../storage/StorageManager';
import { WordTreeProvider } from './wordTreeProvider';

/**
 * 初始化底部面板的单词列表树视图。
 * @param context - 扩展上下文，用于注册视图
 * @param storage - 存储管理器实例
 * @returns WordTreeProvider 实例，可用于刷新视图或监听事件
 */
export function initWordTreeView(
  context: vscode.ExtensionContext,
  storage: StorageManager
): WordTreeProvider {
  console.log('Registering tree data provider for termRepoWordList');
  const treeProvider = new WordTreeProvider(storage);
  vscode.window.registerTreeDataProvider('termRepoWordList', treeProvider);
  return treeProvider;
}