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
exports.printSelectionCommand = printSelectionCommand;
const vscode = __importStar(require("vscode"));
/**
 * 创建“打印选中内容”命令。
 *
 * 这个命令主要服务于调试阶段，用来快速验证：
 * - 当前是否拿到了活动编辑器
 * - 当前选区内容是否正确
 * - 命令注册与执行链路是否正常
 *
 * @returns 注册完成后的命令句柄。
 */
function printSelectionCommand() {
    return vscode.commands.registerCommand('termrepoplugin-vscode.printSelection', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            void vscode.window.showWarningMessage('没有活动的编辑器。');
            return;
        }
        const selection = editor.selection;
        if (selection.isEmpty) {
            void vscode.window.showWarningMessage('没有选中任何文本。');
            return;
        }
        const selectedText = editor.document.getText(selection);
        console.log('选中的内容:', selectedText);
        void vscode.window.showInformationMessage(`选中内容: ${selectedText}`);
    });
}
//# sourceMappingURL=printSelection.js.map