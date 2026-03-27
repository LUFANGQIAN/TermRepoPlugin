"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const commands_1 = require("./commands");
const StorageManager_1 = require("./storage/StorageManager");
//vscode弹窗打印信息
async function activate(context) {
    console.log('TermRepoPlugin 已激活');
    // 1. 初始化存储管理器
    const storage = new StorageManager_1.StorageManager(context.globalStorageUri.fsPath);
    await storage.init(); // 确保目录存在并加载数据
    // 2. 注册所有命令（依赖注入）
    (0, commands_1.registerCommands)(context, storage);
}
function deactivate() {
    console.log('扩展被停用');
}
//# sourceMappingURL=extension.js.map