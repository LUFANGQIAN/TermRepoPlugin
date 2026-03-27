"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = registerCommands;
const printSelection_1 = require("./printSelection");
const addWord_1 = require("./addWord");
// 将来可以继续导入更多命令...
/**
 * 注册所有命令，并将它们的 disposable 对象添加到 context.subscriptions。
 * @param context - 扩展上下文
 * @param storage - 存储管理器实例
 */
function registerCommands(context, storage) {
    // 收集所有命令的 disposable
    const commands = [
        (0, printSelection_1.printSelectionCommand)(),
        (0, addWord_1.addWordCommand)(storage),
    ];
    // 一次性将所有命令添加到订阅中
    context.subscriptions.push(...commands);
}
//# sourceMappingURL=index.js.map