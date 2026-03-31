"use strict";
/**
 * @module 扩展入口
 * @file extension.ts
 * @description VS Code 扩展的激活入口。负责初始化存储管理器并注册所有命令。
 * @module extension
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const commands_1 = require("./commands");
const StorageManager_1 = require("./storage/StorageManager");
const views_1 = require("./views"); // 导入视图初始化函数
/**
 * 扩展激活时调用的入口函数。
 * - 初始化存储管理器（读取全局存储目录下的单词列表）
 * - 注册所有扩展命令（通过依赖注入将存储管理器实例传递给命令注册模块）
 *
 * @param context - VS Code 扩展上下文，提供全局存储路径等资源
 * @returns 无返回值（Promise<void>）
 */
async function activate(context) {
    console.log('TermRepoPlugin 已激活');
    // 1. 初始化存储管理器
    const storage = new StorageManager_1.StorageManager(context.globalStorageUri.fsPath);
    await storage.init();
    // 2. 初始化树视图（底部面板）
    const treeProvider = (0, views_1.initWordTreeView)(context, storage);
    // 3. 注册命令，并将 treeProvider 传递给需要刷新视图的命令
    (0, commands_1.registerCommands)(context, storage, treeProvider);
}
/**
 * 扩展停用时调用的清理函数。
 * 目前仅输出日志，无额外清理操作。
 */
function deactivate() {
    console.log('扩展被停用');
}
//# sourceMappingURL=extension.js.map