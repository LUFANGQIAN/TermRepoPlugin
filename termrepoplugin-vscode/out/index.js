"use strict";
/**
 * @module 项目公共入口
 * @description 本文件是 TermRepoPlugin 的统一导出点。
 *
 * 模块结构说明：
 * - `storage`：单词存储核心，提供 StorageManager 类用于读写和管理单词数据。
 * - `commands`：所有 VS Code 命令的工厂函数，每个函数返回一个可注册的 Disposable。
 * - `views`：自定义视图组件，目前包含底部面板的单词树视图（WordTreeProvider）。
 * - `utils`：通用工具函数，例如剪贴板操作。
 *
 * 贡献者可以按需导入任何公共 API，例如：
 * ```typescript
 * import { StorageManager, addWordCommand, WordTreeProvider, copyToClipboard } from 'termrepoplugin-vscode';
 * ```
 *
 * 注意：内部模块的具体实现细节请参考各自的源文件。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyToClipboard = exports.initWordTreeView = exports.WordTreeItem = exports.WordTreeProvider = exports.showAllWordsCommand = exports.copyWordCommand = exports.printSelectionCommand = exports.addWordCommand = exports.StorageManager = void 0;
// 存储模块
var StorageManager_1 = require("./storage/StorageManager");
Object.defineProperty(exports, "StorageManager", { enumerable: true, get: function () { return StorageManager_1.StorageManager; } });
// 命令模块
var commands_1 = require("./commands");
Object.defineProperty(exports, "addWordCommand", { enumerable: true, get: function () { return commands_1.addWordCommand; } });
Object.defineProperty(exports, "printSelectionCommand", { enumerable: true, get: function () { return commands_1.printSelectionCommand; } });
Object.defineProperty(exports, "copyWordCommand", { enumerable: true, get: function () { return commands_1.copyWordCommand; } });
Object.defineProperty(exports, "showAllWordsCommand", { enumerable: true, get: function () { return commands_1.showAllWordsCommand; } });
// 视图模块
var wordTreeProvider_1 = require("./views/wordTreeProvider");
Object.defineProperty(exports, "WordTreeProvider", { enumerable: true, get: function () { return wordTreeProvider_1.WordTreeProvider; } });
Object.defineProperty(exports, "WordTreeItem", { enumerable: true, get: function () { return wordTreeProvider_1.WordTreeItem; } });
var views_1 = require("./views"); // 如果需要外部初始化视图
Object.defineProperty(exports, "initWordTreeView", { enumerable: true, get: function () { return views_1.initWordTreeView; } });
// 工具模块
var clipboard_1 = require("./utils/clipboard");
Object.defineProperty(exports, "copyToClipboard", { enumerable: true, get: function () { return clipboard_1.copyToClipboard; } });
// 其他工具函数在此导出
//# sourceMappingURL=index.js.map