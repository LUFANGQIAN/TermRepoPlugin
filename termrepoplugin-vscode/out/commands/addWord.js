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
exports.addWordCommand = addWordCommand;
const vscode = __importStar(require("vscode"));
/**
 * 创建一个用于收藏单词的 VS Code 命令。
 *
 * 命令 ID: `termrepoplugin-vscode.addWord`
 *
 * 功能描述：
 * - 优先获取当前活动编辑器的选中文本作为要收藏的单词。
 * - 如果没有选中文本，则弹出输入框让用户手动输入。
 * - 使用 `StorageManager` 保存单词（自动去重），并显示相应的提示消息。
 *
 * @param storage - 存储管理器实例，用于保存单词数据。
 * @returns 返回一个 `vscode.Disposable` 对象，可用于在扩展停用时注销命令。
 *
 * @example
 * ```typescript
 * const command = addWordCommand(storage);
 * context.subscriptions.push(command);
 * ```
 */
function addWordCommand(storage) {
    return vscode.commands.registerCommand('termrepoplugin-vscode.addWord', async () => {
        // 1. 忽略任何传入的参数，直接获取活动编辑器的选中文本
        let word;
        const editor = vscode.window.activeTextEditor;
        if (editor && !editor.selection.isEmpty) {
            word = editor.document.getText(editor.selection);
        }
        // 2. 如果没有选中文本，则弹出输入框让用户输入
        if (!word) {
            word = await vscode.window.showInputBox({
                prompt: '请输入要收藏的单词',
                placeHolder: '例如: hello world'
            });
        }
        if (!word) {
            return;
        }
        // 3. 保存单词
        const added = await storage.addWord(word);
        if (added) {
            vscode.window.showInformationMessage(`✅ 已收藏单词: ${word}`);
        }
        else {
            vscode.window.showWarningMessage(`⚠️ 单词 "${word}" 已存在`);
        }
    });
}
//# sourceMappingURL=addWord.js.map