"use strict";
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
exports.copyWordCommand = copyWordCommand;
const vscode = __importStar(require("vscode"));
const clipboard_1 = require("../utils/clipboard");
/**
 * 创建“复制单词”命令。
 *
 * 该命令接收一个单词参数，将其写入系统剪贴板。
 * 通常由树视图中的单词项调用，传入对应的单词字符串。
 * 通过clipboard.ts工具中的copyToClipboard方法实现
 *
 * @returns 返回一个 `vscode.Disposable` 对象，用于注册命令。
 *
 * @example
 * ```typescript
 * // 注册命令
 * context.subscriptions.push(copyWordCommand());
 * ```
 */
function copyWordCommand() {
    return vscode.commands.registerCommand('termrepoplugin-vscode.copyWord', async (word) => {
        // 参数校验：如果未传入单词或单词为空，则提示错误并返回
        if (!word || typeof word !== 'string') {
            vscode.window.showErrorMessage('无效的单词：无法复制空内容');
            return;
        }
        await (0, clipboard_1.copyToClipboard)(word);
    });
}
//# sourceMappingURL=copyWord.js.map