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
const aiClient_1 = require("../services/aiClient");
const clipboard_1 = require("../utils/clipboard");
const termUtils_1 = require("../utils/termUtils");
/**
 * 创建“收藏单词”命令。
 *
 * 命令执行时会优先尝试读取当前编辑器选中的文本；
 * 如果没有选中内容，则回退到输入框手动录入。
 * 随后命令会调用术语详情收集流程，补全备注、拆分信息和标签，
 * 最终将数据写入词库，并把原始单词复制到剪贴板。
 *
 * @param storage 词库存储管理器，用于判重、写入词条和更新建议数据。
 * @returns 注册完成后的命令句柄。
 */
function addWordCommand(storage) {
    return vscode.commands.registerCommand('termrepoplugin-vscode.addWord', async () => {
        let word;
        const editor = vscode.window.activeTextEditor;
        let filePath;
        if (editor && !editor.selection.isEmpty) {
            word = editor.document.getText(editor.selection);
            filePath = vscode.workspace.asRelativePath(editor.document.uri);
        }
        if (!word) {
            word = await vscode.window.showInputBox({
                prompt: '请输入要收藏的单词',
                placeHolder: '例如：indexRouter',
            });
            filePath = undefined;
        }
        if (!word) {
            return;
        }
        word = word.trim();
        if (word === '') {
            void vscode.window.showWarningMessage('单词不能为空，请重新选择或输入。');
            return;
        }
        if (word.includes(' ')) {
            void vscode.window.showWarningMessage('暂不支持包含空格的短语，请选择单个单词。');
            return;
        }
        if (storage.hasTerm(word)) {
            void vscode.window.showWarningMessage(`单词 "${word}" 已存在。`);
            return;
        }
        const aiDefaults = await tryAnalyzeWithAi(word, editor, filePath);
        const getSuggestion = (partText) => storage.getTopSuggestion(partText);
        const newTerm = await (0, termUtils_1.askForTermDetails)(word, filePath, getSuggestion, aiDefaults);
        if (!newTerm) {
            void vscode.window.showInformationMessage('已取消添加单词。');
            return;
        }
        const added = await storage.addTerm(newTerm);
        if (!added) {
            void vscode.window.showWarningMessage(`单词 "${word}" 已存在。`);
            return;
        }
        for (const part of newTerm.parts) {
            if (part.note) {
                await storage.updateSuggestion(part.text, part.note);
            }
        }
        await (0, clipboard_1.copyToClipboard)(word, false);
        void vscode.window.showInformationMessage(`已收藏单词：${word}`);
    });
}
async function tryAnalyzeWithAi(word, editor, filePath) {
    const client = (0, aiClient_1.createAiClient)();
    if (!client)
        return undefined;
    try {
        return await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'TermRepo 正在生成 AI 翻译建议...', cancellable: false }, () => client.analyzeTerm({
            originalText: word,
            filePath,
            fileName: editor?.document.fileName.split(/[\\/]/).pop(),
            languageId: editor?.document.languageId,
            surroundingCode: getSurroundingCode(editor),
        }));
    }
    catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        void vscode.window.showWarningMessage(`AI 翻译建议暂不可用，已回退本地建议：${reason}`);
        return undefined;
    }
}
function getSurroundingCode(editor) {
    if (!editor)
        return undefined;
    const line = editor.selection.active.line;
    const start = Math.max(0, line - 3);
    const end = Math.min(editor.document.lineCount - 1, line + 3);
    return editor.document.getText(new vscode.Range(start, 0, end, editor.document.lineAt(end).text.length));
}
//# sourceMappingURL=addWord.js.map