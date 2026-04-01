import { randomUUID } from 'crypto';
import { TermEntry, TermPart } from '../types';

/**
 * 将驼峰或下划线命名的字符串拆分成单词部分
 * 例如 "indexRouter" -> ["index", "router"]
 */
export function splitIdentifier(text: string): string[] {
  // 简单实现：按大小写变化和下划线拆分
  return text.split(/(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])|_/);
}

/**
 * 为单词部分自动生成标签（例如根据内容判断中英文）
 */
export function autoTagPart(partText: string): string[] {
  const tags: string[] = [];
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
export function createTermEntry(word: string, filePath?: string): TermEntry {
  const now = Date.now();
  const parts: TermPart[] = splitIdentifier(word).map(partText => ({
    text: partText,
    note: undefined,
    tags: autoTagPart(partText),
    type: 'camelCase', // 可根据拆分方式设置类型
  }));

  return {
    id: randomUUID(),
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