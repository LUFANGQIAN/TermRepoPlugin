"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitCamelCase = splitCamelCase;
exports.autoGenerateTagsForPart = autoGenerateTagsForPart;
exports.createTermEntry = createTermEntry;
const crypto_1 = require("crypto");
/**
 * 将驼峰/下划线命名的字符串拆分成单词部分
 * 例如 "indexRouter" -> ["index", "router"]
 */
function splitCamelCase(text) {
    // 简单的驼峰拆分实现
    return text.split(/(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])/);
}
/**
 * 为单词部分自动生成标签（例如根据内容判断中英文）
 */
function autoGenerateTagsForPart(partText) {
    const tags = [];
    // 如果包含英文字母，添加 'en' 标签
    if (/[a-zA-Z]/.test(partText)) {
        tags.push('en');
    }
    // 可根据需要增加更多自动标签逻辑
    return tags;
}
/**
 * 创建一个新的术语条目
 * @param word 用户选中的原始文本
 * @param filePath 收藏时所在的文件路径（可选）
 * @returns 新创建的 TermEntry 对象
 */
function createTermEntry(word, filePath) {
    const now = Date.now();
    const parts = splitCamelCase(word).map(partText => ({
        text: partText,
        note: undefined,
        tags: autoGenerateTagsForPart(partText),
        type: 'camelCase', // 可根据实际拆分方式设置类型
    }));
    return {
        id: (0, crypto_1.randomUUID)(),
        originalText: word,
        overallNote: undefined,
        filePath,
        parts,
        tags: [], // 用户自定义标签初始为空，后续在编辑界面添加
        createdAt: now,
        updatedAt: now,
        mastery: 0,
        reviewCount: 0,
        nextReviewDate: undefined,
    };
}
//# sourceMappingURL=term.js.map