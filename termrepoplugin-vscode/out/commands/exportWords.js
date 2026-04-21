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
exports.exportWordsCommand = exportWordsCommand;
const os = __importStar(require("os"));
const vscode = __importStar(require("vscode"));
/**
 * 创建“导出单词库”命令。
 *
 * 导出流程会将当前词库包装成一个带元信息的 JSON 文件，包含：
 * - 导出时间
 * - 词条数量
 * - 词条数组
 *
 * 这样既方便人工阅读，也方便后续再次导入。
 *
 * @param storage 词库存储管理器，用于读取当前全部词条。
 * @returns 注册完成后的命令句柄。
 */
function exportWordsCommand(storage) {
    return vscode.commands.registerCommand('termrepoplugin-vscode.exportWords', async () => {
        const allTerms = storage.getAllTerms();
        if (allTerms.length === 0) {
            void vscode.window.showInformationMessage('当前词库为空，没有可导出的单词。');
            return;
        }
        const defaultUri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders?.[0]?.uri ?? vscode.Uri.file(os.homedir()), 'termrepo-words.json');
        const targetUri = await vscode.window.showSaveDialog({
            defaultUri,
            filters: { JSON: ['json'] },
            saveLabel: '导出词库',
            title: '导出 TermRepo 单词库',
        });
        if (!targetUri) {
            return;
        }
        const content = JSON.stringify({
            exportedAt: new Date().toISOString(),
            count: allTerms.length,
            terms: allTerms,
        }, null, 2);
        await vscode.workspace.fs.writeFile(targetUri, Buffer.from(content, 'utf8'));
        void vscode.window.showInformationMessage(`已导出 ${allTerms.length} 个单词到 ${targetUri.fsPath}`);
    });
}
//# sourceMappingURL=exportWords.js.map