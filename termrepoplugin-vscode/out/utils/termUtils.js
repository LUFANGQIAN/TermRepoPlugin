"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitIdentifier = splitIdentifier;
exports.autoTagPart = autoTagPart;
exports.createTermEntry = createTermEntry;
const crypto_1 = require("crypto");
/**
 * 将驼峰或下划线命名的字符串拆分成单词部分
 * 例如 "indexRouter" -> ["index", "router"]
 */
function splitIdentifier(text) {
    // 简单实现：按大小写变化和下划线拆分
    return text.split(/(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])|_/);
}
/**
 * 为单词部分自动生成标签（例如根据内容判断中英文）
 */
function autoTagPart(partText) {
    const tags = [];
    if (/[a-zA-Z]/.test(partText)) {
        tags.push('en');
    }
    // 可以根据需要增加更多自动标签逻辑
    return tags;
}
/**
 * 创建一个新的术语条目（纯函数，不涉及存储）
 * @param word 用户选中的原始文本
 * @param filePath 收藏时所在的文件路径（可选）
 * @returns 新创建的 TermEntry 对象
 */
function createTermEntry(word, filePath) {
    const now = Date.now();
    const parts = splitIdentifier(word).map(partText => ({
        text: partText,
        note: undefined,
        tags: autoTagPart(partText),
        type: 'camelCase', // 可根据拆分方式设置类型
    }));
    return {
        id: (0, crypto_1.randomUUID)(),
        originalText: word,
        overallNote: undefined,
        filePath,
        parts,
        tags: [],
        createdAt: now,
        updatedAt: now,
        mastery: 0,
        reviewCount: 0,
        nextReviewDate: undefined,
    };
}
//# sourceMappingURL=termUtils.js.map