"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showAllWordsCommand = exports.printSelectionCommand = exports.addWordCommand = void 0;
exports.registerCommands = registerCommands;
const printSelection_1 = require("./printSelection");
const addWord_1 = require("./addWord");
const showAllWords_1 = require("./showAllWords");
var addWord_2 = require("./addWord");
Object.defineProperty(exports, "addWordCommand", { enumerable: true, get: function () { return addWord_2.addWordCommand; } });
var printSelection_2 = require("./printSelection");
Object.defineProperty(exports, "printSelectionCommand", { enumerable: true, get: function () { return printSelection_2.printSelectionCommand; } });
var showAllWords_2 = require("./showAllWords");
Object.defineProperty(exports, "showAllWordsCommand", { enumerable: true, get: function () { return showAllWords_2.showAllWordsCommand; } });
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
        (0, showAllWords_1.showAllWordsCommand)(storage),
    ];
    // 一次性将所有命令添加到订阅中
    context.subscriptions.push(...commands);
}
//# sourceMappingURL=index.js.map