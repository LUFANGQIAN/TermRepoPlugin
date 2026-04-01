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
const clipboard_1 = require("../utils/clipboard");
const termUtils_1 = require("../utils/termUtils"); // 新增：创建术语对象的工具函数
/**
 * 创建一个用于收藏单词的 VS Code 命令。
 *
 * 命令 ID: `termrepoplugin-vscode.addWord`
 *
 * 功能描述：
 * - 优先获取当前活动编辑器的选中文本作为要收藏的单词。
 * - 如果没有选中文本，则弹出输入框让用户手动输入。
 * - 使用 {@link StorageManager} 保存单词（自动去重），并显示相应的提示消息。
 * - 成功添加后，自动将单词复制到剪贴板（无额外提示，避免重复通知）。
 * - 调用 {@link WordTreeProvider.refresh} 刷新单词列表视图。
 *
 * @param storage - 存储管理器实例，用于保存单词数据。
 * @param treeProvider - 树视图提供者实例，用于在单词添加后刷新视图（若不需要刷新可传入空对象，但不推荐）。
 * @returns 返回一个 `vscode.Disposable` 对象，可用于在扩展停用时注销命令。
 *
 * @example
 * ```typescript
 * // 在扩展激活函数中注册命令
 * const command = addWordCommand(storage, treeProvider);
 * context.subscriptions.push(command);
 * ```
 *
 * @see {@link copyToClipboard} 底层使用的剪贴板工具函数
 */
function addWordCommand(storage, treeProvider) {
    return vscode.commands.registerCommand('termrepoplugin-vscode.addWord', async () => {
        // 1. 获取活动编辑器和选中文本
        let word;
        const editor = vscode.window.activeTextEditor;
        let filePath;
        if (editor && !editor.selection.isEmpty) {
            word = editor.document.getText(editor.selection);
            // 获取当前文件的相对路径（相对于工作区根）
            filePath = vscode.workspace.asRelativePath(editor.document.uri);
        }
        // 2. 如果没有选中文本，则弹出输入框让用户输入（此时无法记录文件路径）
        if (!word) {
            word = await vscode.window.showInputBox({
                prompt: '请输入要收藏的单词',
                placeHolder: '例如: hello world'
            });
            // 通过输入框添加的单词没有关联文件路径
            filePath = undefined;
        }
        if (!word) {
            return;
        }
        // 3. 创建完整的术语条目
        const newTerm = (0, termUtils_1.createTermEntry)(word, filePath);
        // 4. 保存术语
        const added = await storage.addTerm(newTerm);
        if (added) {
            treeProvider.refresh(); // 刷新树视图
            await (0, clipboard_1.copyToClipboard)(word, false); // 自动复制到剪贴板，不显示额外通知
            vscode.window.showInformationMessage(`✅ 已收藏单词: ${word}`);
        }
        else {
            vscode.window.showWarningMessage(`⚠️ 单词 "${word}" 已存在`);
        }
    });
}
//# sourceMappingURL=addWord.js.map