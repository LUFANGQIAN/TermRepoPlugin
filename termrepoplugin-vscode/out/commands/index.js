"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showAllWordsCommand = exports.printSelectionCommand = exports.importWordsCommand = exports.exportWordsCommand = exports.configureFavoriteKeybindingCommand = exports.copyWordCommand = exports.addWordCommand = void 0;
exports.registerCommands = registerCommands;
const addWord_1 = require("./addWord");
const copyWord_1 = require("./copyWord");
const configureFavoriteKeybinding_1 = require("./configureFavoriteKeybinding");
const exportWords_1 = require("./exportWords");
const importWords_1 = require("./importWords");
const printSelection_1 = require("./printSelection");
const showAllWords_1 = require("./showAllWords");
var addWord_2 = require("./addWord");
Object.defineProperty(exports, "addWordCommand", { enumerable: true, get: function () { return addWord_2.addWordCommand; } });
var copyWord_2 = require("./copyWord");
Object.defineProperty(exports, "copyWordCommand", { enumerable: true, get: function () { return copyWord_2.copyWordCommand; } });
var configureFavoriteKeybinding_2 = require("./configureFavoriteKeybinding");
Object.defineProperty(exports, "configureFavoriteKeybindingCommand", { enumerable: true, get: function () { return configureFavoriteKeybinding_2.configureFavoriteKeybindingCommand; } });
var exportWords_2 = require("./exportWords");
Object.defineProperty(exports, "exportWordsCommand", { enumerable: true, get: function () { return exportWords_2.exportWordsCommand; } });
var importWords_2 = require("./importWords");
Object.defineProperty(exports, "importWordsCommand", { enumerable: true, get: function () { return importWords_2.importWordsCommand; } });
var printSelection_2 = require("./printSelection");
Object.defineProperty(exports, "printSelectionCommand", { enumerable: true, get: function () { return printSelection_2.printSelectionCommand; } });
var showAllWords_2 = require("./showAllWords");
Object.defineProperty(exports, "showAllWordsCommand", { enumerable: true, get: function () { return showAllWords_2.showAllWordsCommand; } });
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
function registerCommands(context, storage) {
    const commands = [
        (0, printSelection_1.printSelectionCommand)(),
        (0, showAllWords_1.showAllWordsCommand)(storage),
        (0, addWord_1.addWordCommand)(storage),
        (0, copyWord_1.copyWordCommand)(),
        (0, configureFavoriteKeybinding_1.configureFavoriteKeybindingCommand)(),
        (0, exportWords_1.exportWordsCommand)(storage),
        (0, importWords_1.importWordsCommand)(storage),
    ];
    context.subscriptions.push(...commands);
}
//# sourceMappingURL=index.js.map