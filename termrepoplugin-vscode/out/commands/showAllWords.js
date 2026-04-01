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
exports.showAllWordsCommand = showAllWordsCommand;
const vscode = __importStar(require("vscode"));
const clipboard_1 = require("../utils/clipboard");
/**
 * 创建“显示所有单词”命令。
 *
 * 命令 ID: `termrepoplugin-vscode.showAllWords`
 *
 * 功能描述：
 * - 从 StorageManager 获取所有已收藏的单词。
 * - 如果没有单词，显示提示信息。
 * - 通过 QuickPick 列出所有单词，支持滚动查看。
 * - 点击任意单词即可将其复制到剪贴板（使用 {@link copyToClipboard} 工具函数）。
 *
 * @param storage - 存储管理器实例，用于获取单词列表。
 * @returns 返回一个 `vscode.Disposable` 对象，用于注册命令。
 *
 * @example
 * ```typescript
 * // 在扩展激活时注册命令
 * const showAllWords = showAllWordsCommand(storage);
 * context.subscriptions.push(showAllWords);
 * ```
 *
 * @see {@link copyToClipboard}
 */
function showAllWordsCommand(storage) {
    return vscode.commands.registerCommand('termrepoplugin-vscode.showAllWords', async () => {
        const allTerms = storage.getAllTerms();
        const words = allTerms.map(t => t.originalText);
        // 然后用 words 列表展示 QuickPick
        if (words.length === 0) {
            vscode.window.showInformationMessage('📭 暂无收藏的单词');
            return;
        }
        const selected = await vscode.window.showQuickPick(words, {
            placeHolder: `共 ${words.length} 个单词，点击复制到剪贴板`,
            ignoreFocusOut: true,
        });
        if (selected) {
            await (0, clipboard_1.copyToClipboard)(selected); // 使用工具函数复制
        }
    });
}
//# sourceMappingURL=showAllWords.js.map