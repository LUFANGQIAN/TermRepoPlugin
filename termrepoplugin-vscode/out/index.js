"use strict";
/**
 * @module 公共 API
 * @description 本模块导出扩展的所有公共接口，供外部使用或生成 API 文档。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.showAllWordsCommand = exports.printSelectionCommand = exports.addWordCommand = exports.StorageManager = void 0;
var StorageManager_1 = require("./storage/StorageManager");
Object.defineProperty(exports, "StorageManager", { enumerable: true, get: function () { return StorageManager_1.StorageManager; } });
var commands_1 = require("./commands");
Object.defineProperty(exports, "addWordCommand", { enumerable: true, get: function () { return commands_1.addWordCommand; } });
Object.defineProperty(exports, "printSelectionCommand", { enumerable: true, get: function () { return commands_1.printSelectionCommand; } });
var commands_2 = require("./commands");
Object.defineProperty(exports, "showAllWordsCommand", { enumerable: true, get: function () { return commands_2.showAllWordsCommand; } });
// 如果还有其他需要公开的模块，继续导出
//# sourceMappingURL=index.js.map