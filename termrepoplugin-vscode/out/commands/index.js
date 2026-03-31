"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyWordCommand = exports.showAllWordsCommand = exports.printSelectionCommand = exports.addWordCommand = void 0;
exports.registerCommands = registerCommands;
const printSelection_1 = require("./printSelection");
const addWord_1 = require("./addWord");
const showAllWords_1 = require("./showAllWords");
const copyWord_1 = require("./copyWord");
var addWord_2 = require("./addWord");
Object.defineProperty(exports, "addWordCommand", { enumerable: true, get: function () { return addWord_2.addWordCommand; } });
var printSelection_2 = require("./printSelection");
Object.defineProperty(exports, "printSelectionCommand", { enumerable: true, get: function () { return printSelection_2.printSelectionCommand; } });
var showAllWords_2 = require("./showAllWords");
Object.defineProperty(exports, "showAllWordsCommand", { enumerable: true, get: function () { return showAllWords_2.showAllWordsCommand; } });
var copyWord_2 = require("./copyWord");
Object.defineProperty(exports, "copyWordCommand", { enumerable: true, get: function () { return copyWord_2.copyWordCommand; } });
/**
 * 注册所有命令，并将它们的 disposable 对象添加到 context.subscriptions。
 *
 * 该函数应在扩展激活时调用，确保所有命令被正确注册并随扩展停用而自动清理。
 *
 * @param context - 扩展上下文，用于管理命令的生命周期。
 * @param storage - 存储管理器实例，用于命令中操作单词数据。
 * @param treeProvider - 树视图提供者实例，用于命令中刷新单词列表视图。
 */
function registerCommands(context, storage, treeProvider) {
    // 收集所有命令的 disposable
    const commands = [
        (0, printSelection_1.printSelectionCommand)(),
        (0, showAllWords_1.showAllWordsCommand)(storage),
        (0, addWord_1.addWordCommand)(storage, treeProvider),
        (0, copyWord_1.copyWordCommand)(),
    ];
    // 一次性将所有命令添加到订阅中
    context.subscriptions.push(...commands);
}
//# sourceMappingURL=index.js.map