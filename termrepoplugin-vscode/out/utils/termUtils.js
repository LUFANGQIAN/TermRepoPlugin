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
exports.splitIdentifier = splitIdentifier;
exports.autoTagPart = autoTagPart;
exports.askForTermDetails = askForTermDetails;
// src/utils/termUtils.ts
const crypto_1 = require("crypto");
const vscode = __importStar(require("vscode"));
const wordSuggestions_1 = require("./wordSuggestions"); // 静态映射表，作为后备
// 静态建议函数（仅作为内部后备）
function getStaticSuggestion(partText) {
    return wordSuggestions_1.suggestionMap[partText.toLowerCase()];
}
function splitIdentifier(text) {
    if (text.includes('_')) {
        return text.split('_');
    }
    return text.split(/(?<=[a-z])(?=[A-Z])/);
}
function autoTagPart(partText, note) {
    const tags = [];
    if (/[a-zA-Z]/.test(partText)) {
        tags.push('en');
    }
    if (note && /[\u4e00-\u9fa5]/.test(note)) {
        tags.push('zh');
    }
    return tags;
}
/**
 * 为拆分部分提供输入界面（输入框预填建议，直接回车采用）
 * @param partText 拆分文本
 * @param index 当前部分序号
 * @param total 总部分数
 * @param suggestion 外部提供的建议（优先使用）
 */
async function askForPartNote(partText, index, total, suggestion) {
    const input = await vscode.window.showInputBox({
        title: `${partText} 的备注 (${index}/${total})`,
        prompt: suggestion ? `建议：“${suggestion}”，按回车直接采用，或修改后回车` : '输入备注（可留空）',
        placeHolder: suggestion || '例如：路由',
        value: suggestion || '',
    });
    return input;
}
/**
 * 通过问答方式获取术语详情
 * @param word 原始单词
 * @param filePath 文件路径（可选）
 * @param getSuggestion 外部建议获取函数（优先于静态映射表）
 */
async function askForTermDetails(word, filePath, getSuggestion) {
    // 整体备注
    const overallNote = await vscode.window.showInputBox({
        prompt: `“${word}” 的整体备注是什么？`,
        placeHolder: '例如：主页路由（可留空）',
    });
    if (overallNote === undefined) {
        return undefined;
    }
    const partsText = splitIdentifier(word);
    const parts = [];
    for (let i = 0; i < partsText.length; i++) {
        const partText = partsText[i];
        // 优先使用外部建议，否则使用静态映射表
        const externalSuggestion = getSuggestion ? getSuggestion(partText) : undefined;
        const suggestion = externalSuggestion ?? getStaticSuggestion(partText);
        const note = await askForPartNote(partText, i + 1, partsText.length, suggestion);
        if (note === undefined) {
            return undefined;
        }
        const tags = autoTagPart(partText, note);
        parts.push({
            text: partText,
            note: note || undefined,
            tags,
            type: 'camelCase',
        });
    }
    // 全局标签
    const globalTags = [];
    if (/[a-zA-Z]/.test(word)) {
        globalTags.push('en');
    }
    if (overallNote && /[\u4e00-\u9fa5]/.test(overallNote)) {
        globalTags.push('zh');
    }
    const partTagsSet = new Set(parts.flatMap(p => p.tags));
    partTagsSet.forEach(tag => {
        if (!globalTags.includes(tag)) {
            globalTags.push(tag);
        }
    });
    const now = Date.now();
    return {
        id: (0, crypto_1.randomUUID)(),
        originalText: word,
        overallNote: overallNote || undefined,
        filePath,
        parts,
        tags: globalTags,
        createdAt: now,
        updatedAt: now,
        mastery: 0,
        reviewCount: 0,
        nextReviewDate: undefined,
    };
}
//# sourceMappingURL=termUtils.js.map