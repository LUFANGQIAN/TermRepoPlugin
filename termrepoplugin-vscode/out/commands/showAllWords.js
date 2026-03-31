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
/**
 * 创建“显示所有单词”命令。
 * 通过 QuickPick 列出所有已收藏的单词，点击可复制到剪贴板。
 *
 * @param storage - 存储管理器实例
 * @returns 命令的 Disposable 对象
 */
function showAllWordsCommand(storage) {
    return vscode.commands.registerCommand('termrepoplugin-vscode.showAllWords', async () => {
        const words = storage.getAllWords();
        if (words.length === 0) {
            vscode.window.showInformationMessage('📭 暂无收藏的单词');
            return;
        }
        const selected = await vscode.window.showQuickPick(words, {
            placeHolder: `共 ${words.length} 个单词，点击复制到剪贴板`,
            ignoreFocusOut: true,
        });
        if (selected) {
            await vscode.env.clipboard.writeText(selected);
            vscode.window.showInformationMessage(`✅ 已复制“${selected}”到剪贴板`);
        }
    });
}
//# sourceMappingURL=showAllWords.js.map