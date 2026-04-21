"use strict";
/**
 * 项目统一公共导出入口。
 *
 * 这个文件的职责是把插件中值得阅读、复用和生成文档的公开接口集中导出，
 * 让阅读代码的人只需要从一个入口就能快速了解整个项目的能力边界。
 *
 * 建议将它理解为项目的“公共 API 清单”：
 * - 想看扩展如何启动，可以从这里进入 `activate` / `deactivate`
 * - 想看命令系统，可以从这里进入 `registerCommands` 和各个命令工厂
 * - 想看数据结构，可以从这里进入 `TermEntry` / `TermPart`
 * - 想看词库存储、Webview、补全替换等实现，也都可以从这里跳转
 *
 * 未来如果项目继续扩展，推荐优先维护这个文件，
 * 让它始终保持“对外阅读入口”的角色。
 *
 * @module 项目公共导出入口
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestionMap = exports.splitIdentifier = exports.autoTagPart = exports.askForTermDetails = exports.registerFavoriteKeybindingSupport = exports.openFavoriteKeybindingSettings = exports.getFavoriteKeybinding = exports.FAVORITE_KEYBINDING_CONFIG_PATH = exports.copyToClipboard = exports.MyWebviewProvider = exports.registerWebviewView = exports.StorageManager = exports.ensureStorageDir = exports.registerTermCompletionProvider = exports.getTriggerCharacter = exports.showAllWordsCommand = exports.printSelectionCommand = exports.importWordsCommand = exports.exportWordsCommand = exports.configureFavoriteKeybindingCommand = exports.copyWordCommand = exports.addWordCommand = exports.registerCommands = exports.deactivate = exports.activate = void 0;
/**
 * 扩展生命周期与入口能力。
 */
var extension_1 = require("./extension");
Object.defineProperty(exports, "activate", { enumerable: true, get: function () { return extension_1.activate; } });
Object.defineProperty(exports, "deactivate", { enumerable: true, get: function () { return extension_1.deactivate; } });
/**
 * 命令系统总入口与各命令工厂。
 */
var commands_1 = require("./commands");
Object.defineProperty(exports, "registerCommands", { enumerable: true, get: function () { return commands_1.registerCommands; } });
var commands_2 = require("./commands");
Object.defineProperty(exports, "addWordCommand", { enumerable: true, get: function () { return commands_2.addWordCommand; } });
Object.defineProperty(exports, "copyWordCommand", { enumerable: true, get: function () { return commands_2.copyWordCommand; } });
Object.defineProperty(exports, "configureFavoriteKeybindingCommand", { enumerable: true, get: function () { return commands_2.configureFavoriteKeybindingCommand; } });
Object.defineProperty(exports, "exportWordsCommand", { enumerable: true, get: function () { return commands_2.exportWordsCommand; } });
Object.defineProperty(exports, "importWordsCommand", { enumerable: true, get: function () { return commands_2.importWordsCommand; } });
Object.defineProperty(exports, "printSelectionCommand", { enumerable: true, get: function () { return commands_2.printSelectionCommand; } });
Object.defineProperty(exports, "showAllWordsCommand", { enumerable: true, get: function () { return commands_2.showAllWordsCommand; } });
/**
 * 编辑器补全与触发符号配置能力。
 */
var termCompletionProvider_1 = require("./providers/termCompletionProvider");
Object.defineProperty(exports, "getTriggerCharacter", { enumerable: true, get: function () { return termCompletionProvider_1.getTriggerCharacter; } });
Object.defineProperty(exports, "registerTermCompletionProvider", { enumerable: true, get: function () { return termCompletionProvider_1.registerTermCompletionProvider; } });
/**
 * 存储层能力。
 */
var ensureStorageDir_1 = require("./storage/ensureStorageDir");
Object.defineProperty(exports, "ensureStorageDir", { enumerable: true, get: function () { return ensureStorageDir_1.ensureStorageDir; } });
var StorageManager_1 = require("./storage/StorageManager");
Object.defineProperty(exports, "StorageManager", { enumerable: true, get: function () { return StorageManager_1.StorageManager; } });
/**
 * 视图层能力。
 */
var views_1 = require("./views");
Object.defineProperty(exports, "registerWebviewView", { enumerable: true, get: function () { return views_1.registerWebviewView; } });
var MyWebviewProvider_1 = require("./views/MyWebviewProvider");
Object.defineProperty(exports, "MyWebviewProvider", { enumerable: true, get: function () { return MyWebviewProvider_1.MyWebviewProvider; } });
/**
 * 工具函数与辅助数据。
 */
var clipboard_1 = require("./utils/clipboard");
Object.defineProperty(exports, "copyToClipboard", { enumerable: true, get: function () { return clipboard_1.copyToClipboard; } });
var favoriteKeybinding_1 = require("./utils/favoriteKeybinding");
Object.defineProperty(exports, "FAVORITE_KEYBINDING_CONFIG_PATH", { enumerable: true, get: function () { return favoriteKeybinding_1.FAVORITE_KEYBINDING_CONFIG_PATH; } });
Object.defineProperty(exports, "getFavoriteKeybinding", { enumerable: true, get: function () { return favoriteKeybinding_1.getFavoriteKeybinding; } });
Object.defineProperty(exports, "openFavoriteKeybindingSettings", { enumerable: true, get: function () { return favoriteKeybinding_1.openFavoriteKeybindingSettings; } });
Object.defineProperty(exports, "registerFavoriteKeybindingSupport", { enumerable: true, get: function () { return favoriteKeybinding_1.registerFavoriteKeybindingSupport; } });
var termUtils_1 = require("./utils/termUtils");
Object.defineProperty(exports, "askForTermDetails", { enumerable: true, get: function () { return termUtils_1.askForTermDetails; } });
Object.defineProperty(exports, "autoTagPart", { enumerable: true, get: function () { return termUtils_1.autoTagPart; } });
Object.defineProperty(exports, "splitIdentifier", { enumerable: true, get: function () { return termUtils_1.splitIdentifier; } });
var wordSuggestions_1 = require("./utils/wordSuggestions");
Object.defineProperty(exports, "suggestionMap", { enumerable: true, get: function () { return wordSuggestions_1.suggestionMap; } });
//# sourceMappingURL=index.js.map