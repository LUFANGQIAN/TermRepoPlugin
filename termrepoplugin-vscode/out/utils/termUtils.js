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
const crypto_1 = require("crypto");
const vscode = __importStar(require("vscode"));
const wordSuggestions_1 = require("./wordSuggestions");
/**
 * 从静态建议表中获取某个拆分项的默认备注。
 *
 * 这是一层后备策略：当动态学习建议不存在时，
 * 会退回到预置术语映射表提供推荐值。
 *
 * @param partText 拆分项文本。
 * @returns 命中的建议备注；若不存在则返回 `undefined`。
 */
function getStaticSuggestion(partText) {
    return wordSuggestions_1.suggestionMap[partText.toLowerCase()];
}
/**
 * 将标识符按命名风格拆分为多个语义片段。
 *
 * 当前支持两类拆分规则：
 * - 下划线命名：`user_name` -> `user`, `name`
 * - 驼峰命名：`indexRouter` -> `index`, `Router`
 *
 * @param text 原始单词或标识符。
 * @returns 拆分后的文本片段数组。
 */
function splitIdentifier(text) {
    if (text.includes('_')) {
        return text.split('_');
    }
    return text.split(/(?<=[a-z])(?=[A-Z])/);
}
/**
 * 为拆分项自动生成基础标签。
 *
 * 目前会根据字母或中文的存在情况自动附加 `en` / `zh` 标签，
 * 以便后续搜索和筛选。
 *
 * @param partText 拆分项文本。
 * @param note 拆分项备注。
 * @returns 自动推断出的标签数组。
 */
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
 * 询问用户某个拆分项的备注。
 *
 * 如果存在推荐值，输入框会自动预填建议内容，
 * 用户可以直接回车采用，也可以手动修改。
 *
 * @param partText 当前拆分项文本。
 * @param index 当前拆分项序号，从 1 开始。
 * @param total 总拆分项数量。
 * @param suggestion 推荐备注。
 * @returns 用户输入的备注；若取消则返回 `undefined`。
 */
async function askForPartNote(partText, index, total, suggestion) {
    return vscode.window.showInputBox({
        title: `${partText} 的备注 (${index}/${total})`,
        prompt: suggestion
            ? `建议值：“${suggestion}”，可直接回车采用，或修改后确认`
            : '请输入该拆分项的备注（可留空）',
        placeHolder: suggestion || '例如：路由',
        value: suggestion || '',
    });
}
/**
 * 通过连续问答的方式采集一个完整词条。
 *
 * 采集流程包括：
 * 1. 询问整体备注
 * 2. 自动拆分标识符
 * 3. 针对每个拆分项依次询问备注
 * 4. 自动生成词条与拆分项标签
 *
 * @param word 原始单词。
 * @param filePath 来源文件路径，可为空。
 * @param getSuggestion 动态建议获取函数，优先级高于静态建议表。
 * @returns 完整词条；用户任一步取消时返回 `undefined`。
 */
async function askForTermDetails(word, filePath, getSuggestion) {
    const overallNote = await vscode.window.showInputBox({
        prompt: `“${word}” 的整体备注是什么？`,
        placeHolder: '例如：主页路由（可留空）',
    });
    if (overallNote === undefined) {
        return undefined;
    }
    const partsText = splitIdentifier(word);
    const parts = [];
    for (let index = 0; index < partsText.length; index += 1) {
        const partText = partsText[index];
        const externalSuggestion = getSuggestion ? getSuggestion(partText) : undefined;
        const suggestion = externalSuggestion ?? getStaticSuggestion(partText);
        const note = await askForPartNote(partText, index + 1, partsText.length, suggestion);
        if (note === undefined) {
            return undefined;
        }
        parts.push({
            text: partText,
            note: note || undefined,
            tags: autoTagPart(partText, note),
            type: 'camelCase',
        });
    }
    const globalTags = [];
    if (/[a-zA-Z]/.test(word)) {
        globalTags.push('en');
    }
    if (overallNote && /[\u4e00-\u9fa5]/.test(overallNote)) {
        globalTags.push('zh');
    }
    const partTagsSet = new Set(parts.flatMap((part) => part.tags));
    partTagsSet.forEach((tag) => {
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