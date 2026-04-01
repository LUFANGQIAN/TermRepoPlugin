// src/utils/termUtils.ts
import { randomUUID } from 'crypto';
import * as vscode from 'vscode';
import { TermEntry, TermPart } from '../types';
import { suggestionMap } from './wordSuggestions'; // 静态映射表，作为后备

// 静态建议函数（仅作为内部后备）
function getStaticSuggestion(partText: string): string | undefined {
  return suggestionMap[partText.toLowerCase()];
}

export function splitIdentifier(text: string): string[] {
  if (text.includes('_')) {
    return text.split('_');
  }
  return text.split(/(?<=[a-z])(?=[A-Z])/);
}

export function autoTagPart(partText: string, note?: string): string[] {
  const tags: string[] = [];
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
async function askForPartNote(
  partText: string,
  index: number,
  total: number,
  suggestion?: string
): Promise<string | undefined> {
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
export async function askForTermDetails(
  word: string,
  filePath: string | undefined,
  getSuggestion?: (partText: string) => string | undefined
): Promise<TermEntry | undefined> {
  // 整体备注
  const overallNote = await vscode.window.showInputBox({
    prompt: `“${word}” 的整体备注是什么？`,
    placeHolder: '例如：主页路由（可留空）',
  });
  if (overallNote === undefined) {
    return undefined;
  }

  const partsText = splitIdentifier(word);
  const parts: TermPart[] = [];

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
  const globalTags: string[] = [];
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
    id: randomUUID(),
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