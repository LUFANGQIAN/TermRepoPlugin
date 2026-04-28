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
exports.cloudSyncStatusCommand = cloudSyncStatusCommand;
exports.uploadCloudSnapshotCommand = uploadCloudSnapshotCommand;
exports.downloadCloudSnapshotCommand = downloadCloudSnapshotCommand;
exports.mergeWithCloudCommand = mergeWithCloudCommand;
const vscode = __importStar(require("vscode"));
const cloudSyncClient_1 = require("../services/cloudSyncClient");
function cloudSyncStatusCommand() {
    return vscode.commands.registerCommand('termrepoplugin-vscode.cloudSyncStatus', async () => {
        const client = (0, cloudSyncClient_1.createCloudSyncClient)();
        if (!client) {
            return;
        }
        await runCloudSyncTask('正在查询 TermRepo 云同步状态...', async () => {
            const status = await client.status();
            void vscode.window.showInformationMessage(`云同步：${status.enabled ? '已启用' : '未启用'}，云端 ${status.termCount} 条，版本 ${status.snapshotVersion}`);
        });
    });
}
function uploadCloudSnapshotCommand(storage) {
    return vscode.commands.registerCommand('termrepoplugin-vscode.uploadCloudSnapshot', async () => {
        const client = (0, cloudSyncClient_1.createCloudSyncClient)();
        if (!client) {
            return;
        }
        const terms = storage.getAllTerms();
        const snapshot = {
            exportedAt: new Date().toISOString(),
            terms,
        };
        await runCloudSyncTask('正在上传 TermRepo 词库快照...', async () => {
            await client.enable();
            const result = await client.importSnapshot('overwrite', snapshot);
            void vscode.window.showInformationMessage(`上传完成：${terms.length} 条本地词条已写入云端，云端版本 ${result.snapshotVersion}。`);
        });
    });
}
function downloadCloudSnapshotCommand(storage) {
    return vscode.commands.registerCommand('termrepoplugin-vscode.downloadCloudSnapshot', async () => {
        const client = (0, cloudSyncClient_1.createCloudSyncClient)();
        if (!client) {
            return;
        }
        const mode = await pickImportMode('选择云端快照写入本地的方式');
        if (!mode) {
            return;
        }
        await runCloudSyncTask('正在拉取 TermRepo 云端词库...', async () => {
            const snapshot = await client.exportSnapshot();
            const terms = normalizeTerms(snapshot.terms);
            if (mode === 'overwrite') {
                await storage.replaceTerms(terms);
                void vscode.window.showInformationMessage(`拉取完成：本地词库已覆盖为云端 ${terms.length} 条词条。`);
                return;
            }
            const result = await storage.mergeTerms(terms);
            void vscode.window.showInformationMessage(`拉取完成：新增 ${result.imported} 条，跳过 ${result.skipped} 条重复词条。`);
        });
    });
}
function mergeWithCloudCommand(storage) {
    return vscode.commands.registerCommand('termrepoplugin-vscode.mergeWithCloud', async () => {
        const client = (0, cloudSyncClient_1.createCloudSyncClient)();
        if (!client) {
            return;
        }
        await runCloudSyncTask('正在合并 TermRepo 本地与云端词库...', async () => {
            await client.enable();
            const cloudSnapshot = await client.exportSnapshot();
            const cloudTerms = normalizeTerms(cloudSnapshot.terms);
            const localMerge = await storage.mergeTerms(cloudTerms);
            const mergedTerms = storage.getAllTerms();
            const uploadResult = await client.importSnapshot('merge', {
                exportedAt: new Date().toISOString(),
                terms: mergedTerms,
            });
            void vscode.window.showInformationMessage(`合并完成：本地新增 ${localMerge.imported} 条，云端版本 ${uploadResult.snapshotVersion}。`);
        });
    });
}
async function runCloudSyncTask(title, task) {
    try {
        await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title }, task);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        void vscode.window.showErrorMessage(`TermRepo 云同步失败：${message}`);
    }
}
async function pickImportMode(title) {
    const selected = await vscode.window.showQuickPick([
        { label: '合并到本地', description: '保留本地词条，只新增云端不存在的词条', mode: 'merge' },
        { label: '覆盖本地', description: '用云端快照替换当前本地词库', mode: 'overwrite' },
    ], { title, placeHolder: '请选择同步方式' });
    return selected?.mode;
}
function normalizeTerms(terms) {
    if (!Array.isArray(terms)) {
        return [];
    }
    return terms.map((term) => normalizeTerm(term)).filter((term) => term !== null);
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
//# sourceMappingURL=cloudSync.js.map