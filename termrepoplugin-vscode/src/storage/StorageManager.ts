// src/storage/storageManager.ts
import * as fs from 'fs/promises';
import * as path from 'path';
import { ensureStorageDir } from './ensureStorageDir';
import { TermEntry } from '../types';

interface StorageData {
  version: number;
  terms: Record<string, TermEntry>;
  suggestions?: Record<string, Record<string, number>>;
  metadata?: { lastSyncTime?: number };
}

export class StorageManager {
  private readonly dataFilePath: string;
  private terms: Map<string, TermEntry> = new Map();
  private suggestions: Map<string, Map<string, number>> = new Map();

  constructor(storagePath: string) {
    this.dataFilePath = path.join(storagePath, 'termrepo-data.json');
  }

  async init(): Promise<void> {
    await ensureStorageDir(path.dirname(this.dataFilePath));
    await this.load();
  }

  private async load(): Promise<void> {
    try {
      const data = await fs.readFile(this.dataFilePath, 'utf-8');
      const parsed = JSON.parse(data) as StorageData;
      if (parsed.version === 1 && parsed.terms) {
        this.terms = new Map(Object.entries(parsed.terms));

        // 加载 suggestions（如果存在）
        if (parsed.suggestions) {
          this.suggestions = new Map(
            Object.entries(parsed.suggestions).map(([part, counts]) => [
              part,
              new Map(Object.entries(counts)),
            ])
          );
        } else {
          this.suggestions = new Map();
        }

        console.log(`[StorageManager] 加载成功，共 ${this.terms.size} 个术语`);
      } else {
        this.terms = new Map();
        this.suggestions = new Map();
        await this.save();
      }
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        this.terms = new Map();
        this.suggestions = new Map();
        await this.save();
      } else {
        console.error('[StorageManager] 读取存储文件失败:', err);
        this.terms = new Map();
        this.suggestions = new Map();
      }
    }
  }

  private async save(): Promise<void> {
    // 将 suggestions Map 转换为普通对象以便 JSON 序列化
    const suggestionsObj: Record<string, Record<string, number>> = {};
    for (const [part, counts] of this.suggestions) {
      suggestionsObj[part] = Object.fromEntries(counts);
    }

    const data: StorageData = {
      version: 1,
      terms: Object.fromEntries(this.terms),
      suggestions: suggestionsObj,
    };
    await fs.writeFile(this.dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log('[StorageManager] 数据已保存到文件', this.dataFilePath);
  }

  // ---------------------- 核心 API ----------------------

  async addTerm(term: TermEntry): Promise<boolean> {
    const existing = Array.from(this.terms.values()).some(t => t.originalText === term.originalText);
    if (existing) {
      console.log(`[StorageManager] 术语已存在，跳过添加: ${term.originalText}`);
      return false;
    }
    this.terms.set(term.id, term);
    await this.save();
    console.log('[StorageManager] 已添加术语:', JSON.stringify(term, null, 2));
    return true;
  }

  getAllTerms(): TermEntry[] {
    return Array.from(this.terms.values());
  }

  getTerm(id: string): TermEntry | undefined {
    return this.terms.get(id);
  }

  async updateTerm(id: string, updates: Partial<TermEntry>): Promise<boolean> {
    const term = this.terms.get(id);
    if (!term) { return false; }
    const updated = { ...term, ...updates, updatedAt: Date.now() };
    this.terms.set(id, updated);
    await this.save();
    console.log('[StorageManager] 已更新术语:', id);
    return true;
  }

  async deleteTerm(id: string): Promise<boolean> {
    if (!this.terms.has(id)) { return false; }
    this.terms.delete(id);
    await this.save();
    console.log('[StorageManager] 已删除术语:', id);
    return true;
  }

  // ---------------------- 学习库 API ----------------------

  /**
   * 获取某个拆分部分出现次数最多的备注
   */
  getTopSuggestion(partText: string): string | undefined {
    const partMap = this.suggestions.get(partText);
    if (!partMap) { return undefined; }
    let topNote: string | undefined;
    let topCount = 0;
    for (const [note, count] of partMap) {
      if (count > topCount) {
        topCount = count;
        topNote = note;
      }
    }
    return topNote;
  }

  /**
   * 更新学习库：增加某个拆分部分的备注使用次数
   */
  async updateSuggestion(partText: string, note: string): Promise<void> {
    if (!note) { return; }
    let partMap = this.suggestions.get(partText);
    if (!partMap) {
      partMap = new Map();
      this.suggestions.set(partText, partMap);
    }
    const count = (partMap.get(note) || 0) + 1;
    partMap.set(note, count);
    await this.save();
  }
}