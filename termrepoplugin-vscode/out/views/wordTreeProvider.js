"use strict";
/**
 * @module 视图模块
 * @description 提供底部面板的单词列表树视图，用于展示和管理单词库。
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WordTreeProvider = exports.WordTreeItem = void 0;
const vscode = __importStar(require("vscode"));
/**
 * 树视图中的单个单词项。
 * 每个单词项在树视图中显示为一个可点击的条目，点击时触发 `copyWord` 命令。
 */
class WordTreeItem extends vscode.TreeItem {
    word;
    /**
     * 创建一个单词树项。
     * @param word - 单词文本
     */
    constructor(word) {
        super(word, vscode.TreeItemCollapsibleState.None);
        this.word = word;
        this.tooltip = word; // 鼠标悬停提示
        this.contextValue = 'word'; // 用于右键菜单的上下文值
        // 点击单词时自动执行复制命令
        this.command = {
            command: 'termrepoplugin-vscode.copyWord', // 复制单词命令
            title: '复制单词',
            arguments: [word] // 将单词作为参数传递给命令
        };
    }
}
exports.WordTreeItem = WordTreeItem;
/**
 * 单词列表树数据提供者。
 * 负责将 `StorageManager` 中的单词数据转换为树视图可渲染的项，并支持刷新。
 */
class WordTreeProvider {
    storage;
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    /**
     * 创建树数据提供者实例。
     * @param storage - 存储管理器实例，用于获取单词列表
     */
    constructor(storage) {
        this.storage = storage;
    }
    /**
     * 刷新整个树视图。
     * 在单词增删后调用，使视图自动更新。
     */
    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }
    /**
     * 获取树项的 UI 表示。
     * @param element - 单词树项
     * @returns 用于渲染的 TreeItem
     */
    getTreeItem(element) {
        return element;
    }
    /**
     * 获取子项（根节点或展开节点）。
     * @param element - 父节点（根节点时为 undefined）
     * @returns Promise 包装的单词树项数组
     */
    getChildren(element) {
        if (element) {
            return Promise.resolve([]); // 单词项没有子节点
        }
        const words = this.storage.getAllWords();
        return Promise.resolve(words.map(w => new WordTreeItem(w)));
    }
}
exports.WordTreeProvider = WordTreeProvider;
//# sourceMappingURL=wordTreeProvider.js.map