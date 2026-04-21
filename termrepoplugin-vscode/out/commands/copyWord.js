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
 * 该命令通常由词库列表或 Webview 详情页触发，
 * 接收一个明确的单词字符串并复制到系统剪贴板。
 *
 * @returns 注册完成后的命令句柄。
 */
function copyWordCommand() {
    return vscode.commands.registerCommand('termrepoplugin-vscode.copyWord', async (word) => {
        if (!word || typeof word !== 'string') {
            void vscode.window.showErrorMessage('无效的单词内容，无法执行复制。');
            return;
        }
        await (0, clipboard_1.copyToClipboard)(word);
    });
}
//# sourceMappingURL=copyWord.js.map