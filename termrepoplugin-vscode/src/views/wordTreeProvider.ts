/**
 * @module 视图模块
 * @description 提供底部面板的单词列表树视图，用于展示和管理单词库。
 */

import * as vscode from 'vscode';
import { StorageManager } from '../storage/StorageManager';

/**
 * 树视图中的单个单词项。
 * 每个单词项在树视图中显示为一个可点击的条目，点击时触发 `copyWord` 命令。
 */
export class WordTreeItem extends vscode.TreeItem {
  /**
   * 创建一个单词树项。
   * @param word - 单词文本
   */
  constructor(public readonly word: string) {
    super(word, vscode.TreeItemCollapsibleState.None);
    this.tooltip = word;                           // 鼠标悬停提示
    this.contextValue = 'word';                    // 用于右键菜单的上下文值
    // 点击单词时自动执行复制命令
    this.command = {
      command: 'termrepoplugin-vscode.copyWord',   // 复制单词命令
      title: '复制单词',
      arguments: [word]                            // 将单词作为参数传递给命令
    };
  }
}

/**
 * 单词列表树数据提供者。
 * 负责将 `StorageManager` 中的单词数据转换为树视图可渲染的项，并支持刷新。
 */
export class WordTreeProvider implements vscode.TreeDataProvider<WordTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<WordTreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  /**
   * 创建树数据提供者实例。
   * @param storage - 存储管理器实例，用于获取单词列表
   */
  constructor(private storage: StorageManager) { }

  /**
   * 刷新整个树视图。
   * 在单词增删后调用，使视图自动更新。
   */
  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  /**
   * 获取树项的 UI 表示。
   * @param element - 单词树项
   * @returns 用于渲染的 TreeItem
   */
  getTreeItem(element: WordTreeItem): vscode.TreeItem {
    return element;
  }

  /**
   * 获取子项（根节点或展开节点）。
   * @param element - 父节点（根节点时为 undefined）
   * @returns Promise 包装的单词树项数组
   */
  getChildren(): WordTreeItem[] {
    const terms = this.storage.getAllTerms();
    return terms.map(term => new WordTreeItem(term.originalText));
  }
}