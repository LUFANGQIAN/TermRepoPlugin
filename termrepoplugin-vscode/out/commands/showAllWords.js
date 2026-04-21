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
 * 命令会将词库中的所有单词汇总成 Quick Pick 列表，便于用户快速：
 * - 浏览已有词条
 * - 通过输入关键字缩小范围
 * - 选中后立即复制单词内容
 *
 * @param storage 词库存储管理器，用于读取全部词条。
 * @returns 注册完成后的命令句柄。
 */
function showAllWordsCommand(storage) {
    return vscode.commands.registerCommand('termrepoplugin-vscode.showAllWords', async () => {
        const words = storage.getAllTerms().map((term) => term.originalText);
        if (words.length === 0) {
            void vscode.window.showInformationMessage('当前还没有收藏任何单词。');
            return;
        }
        const selected = await vscode.window.showQuickPick(words, {
            placeHolder: `共 ${words.length} 个单词，选择后将复制到剪贴板`,
            ignoreFocusOut: true,
        });
        if (selected) {
            await (0, clipboard_1.copyToClipboard)(selected);
        }
    });
}
//# sourceMappingURL=showAllWords.js.map