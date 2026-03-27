// src/storage/storageManager.ts
import * as fs from 'fs/promises';
import * as path from 'path';
import { ensureStorageDir } from './ensureStorageDir';

/**
 * 管理单词存储的类，负责读写全局存储目录下的 words.json 文件，
 * 并提供内存缓存以减少文件 I/O。
 *
 * @example
 * ```typescript
 * const storage = new StorageManager(context.globalStorageUri.fsPath);
 * await storage.init();
 * await storage.addWord('hello');
 * const allWords = storage.getAllWords();
 * ```
 */
export class StorageManager {
  private readonly wordsFilePath: string;
  private words: string[] = [];

  /**
   * 创建 StorageManager 实例
   * @param storagePath - 全局存储目录的绝对路径，通常从 context.globalStorageUri.fsPath 获取
   */
  constructor(storagePath: string) {
    this.wordsFilePath = path.join(storagePath, 'words.json');
  }

  /**
   * 初始化存储：确保存储目录存在，并加载已有单词列表到内存。
   * 必须在扩展激活时调用一次。
   */
  async init(): Promise<void> {
    await ensureStorageDir(path.dirname(this.wordsFilePath));
    await this.load();
  }

  /**
   * 从 words.json 加载单词列表到内存。
   * 如果文件不存在或解析失败，则 words 置为空数组。
   */
  private async load(): Promise<void> {
    try {
      const data = await fs.readFile(this.wordsFilePath, 'utf-8');
      this.words = JSON.parse(data);
    } catch {
      this.words = [];
    }
  }

  /**
   * 将当前 words 数组保存到 words.json 文件。
   */
  private async save(): Promise<void> {
    const data = JSON.stringify(this.words, null, 2);
    await fs.writeFile(this.wordsFilePath, data, 'utf-8');
  }

  /**
   * 添加一个新单词（自动去重）。
   * @param word - 要添加的单词
   * @returns 如果单词已存在返回 false，否则返回 true
   */
  async addWord(word: string): Promise<boolean> {
    if (this.words.includes(word)) {
      return false;
    }
    this.words.push(word);
    await this.save();
    return true;
  }

  /**
   * 获取所有单词的副本。
   * @returns 单词数组（不影响内部缓存）
   */
  getAllWords(): string[] {
    return [...this.words];
  }

  /**
   * 检查单词是否已存在。
   * @param word - 要查找的单词
   */
  hasWord(word: string): boolean {
    return this.words.includes(word);
  }

  /**
   * 删除指定单词。
   * @param word - 要删除的单词
   * @returns 如果删除成功返回 true，单词不存在返回 false
   */
  
  async deleteWord(word: string): Promise<boolean> {
    const index = this.words.indexOf(word);
    if (index === -1) { return false; }
    this.words.splice(index, 1);
    await this.save();
    return true;
  }
}