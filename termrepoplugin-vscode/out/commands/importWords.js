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
exports.importWordsCommand = importWordsCommand;
const vscode = __importStar(require("vscode"));
function importWordsCommand(storage) {
    return vscode.commands.registerCommand('termrepoplugin-vscode.importWords', async () => {
        const sourceUris = await vscode.window.showOpenDialog({
            canSelectMany: false,
            canSelectFiles: true,
            canSelectFolders: false,
            filters: { JSON: ['json'] },
            openLabel: '导入词库',
            title: '导入 TermRepo 单词库',
        });
        const sourceUri = sourceUris?.[0];
        if (!sourceUri) {
            return;
        }
        const raw = await vscode.workspace.fs.readFile(sourceUri);
        const parsed = JSON.parse(Buffer.from(raw).toString('utf8'));
        const importedTerms = normalizeImportedTerms(parsed);
        if (importedTerms.length === 0) {
            void vscode.window.showWarningMessage('导入文件中没有可用的单词数据。');
            return;
        }
        let importedCount = 0;
        let skippedCount = 0;
        for (const term of importedTerms) {
            const added = await storage.addTerm(term);
            if (added) {
                importedCount += 1;
            }
            else {
                skippedCount += 1;
            }
        }
        void vscode.window.showInformationMessage(`导入完成：新增 ${importedCount} 个，跳过 ${skippedCount} 个重复词条。`);
    });
}
function normalizeImportedTerms(parsed) {
    if (!Array.isArray(parsed.terms)) {
        return [];
    }
    return parsed.terms
        .map((item) => normalizeTerm(item))
        .filter((term) => term !== null);
}
function normalizeTerm(value) {
    if (!value || typeof value !== 'object') {
        return null;
    }
    const candidate = value;
    if (!candidate.id || !candidate.originalText || !Array.isArray(candidate.parts) || !Array.isArray(candidate.tags)) {
        return null;
    }
    const now = Date.now();
    return {
        id: String(candidate.id),
        originalText: String(candidate.originalText),
        overallNote: typeof candidate.overallNote === 'string' ? candidate.overallNote : undefined,
        filePath: typeof candidate.filePath === 'string' ? candidate.filePath : undefined,
        parts: candidate.parts
            .map((part) => ({
            text: String(part.text),
            note: typeof part.note === 'string' ? part.note : undefined,
            tags: Array.isArray(part.tags) ? part.tags.map((tag) => String(tag)) : [],
            type: typeof part.type === 'string' ? part.type : undefined,
        }))
            .filter((part) => part.text.length > 0),
        tags: candidate.tags.map((tag) => String(tag)),
        createdAt: typeof candidate.createdAt === 'number' ? candidate.createdAt : now,
        updatedAt: typeof candidate.updatedAt === 'number' ? candidate.updatedAt : now,
        mastery: typeof candidate.mastery === 'number' ? candidate.mastery : 0,
        reviewCount: typeof candidate.reviewCount === 'number' ? candidate.reviewCount : 0,
        nextReviewDate: typeof candidate.nextReviewDate === 'number' ? candidate.nextReviewDate : undefined,
    };
}
//# sourceMappingURL=importWords.js.map