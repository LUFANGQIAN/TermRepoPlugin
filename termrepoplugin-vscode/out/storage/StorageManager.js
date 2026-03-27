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
exports.StorageManager = void 0;
// src/storage/storageManager.ts
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const ensureStorageDir_1 = require("./ensureStorageDir");
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
class StorageManager {
    wordsFilePath;
    words = [];
    /**
     * 创建 StorageManager 实例
     * @param storagePath - 全局存储目录的绝对路径，通常从 context.globalStorageUri.fsPath 获取
     */
    constructor(storagePath) {
        this.wordsFilePath = path.join(storagePath, 'words.json');
    }
    /**
     * 初始化存储：确保存储目录存在，并加载已有单词列表到内存。
     * 必须在扩展激活时调用一次。
     */
    async init() {
        await (0, ensureStorageDir_1.ensureStorageDir)(path.dirname(this.wordsFilePath));
        await this.load();
    }
    /**
     * 从 words.json 加载单词列表到内存。
     * 如果文件不存在或解析失败，则 words 置为空数组。
     */
    async load() {
        try {
            const data = await fs.readFile(this.wordsFilePath, 'utf-8');
            this.words = JSON.parse(data);
        }
        catch {
            this.words = [];
        }
    }
    /**
     * 将当前 words 数组保存到 words.json 文件。
     */
    async save() {
        const data = JSON.stringify(this.words, null, 2);
        await fs.writeFile(this.wordsFilePath, data, 'utf-8');
    }
    /**
     * 添加一个新单词（自动去重）。
     * @param word - 要添加的单词
     * @returns 如果单词已存在返回 false，否则返回 true
     */
    async addWord(word) {
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
    getAllWords() {
        return [...this.words];
    }
    /**
     * 检查单词是否已存在。
     * @param word - 要查找的单词
     */
    hasWord(word) {
        return this.words.includes(word);
    }
    /**
     * 删除指定单词。
     * @param word - 要删除的单词
     * @returns 如果删除成功返回 true，单词不存在返回 false
     */
    async deleteWord(word) {
        const index = this.words.indexOf(word);
        if (index === -1) {
            return false;
        }
        this.words.splice(index, 1);
        await this.save();
        return true;
    }
}
exports.StorageManager = StorageManager;
//# sourceMappingURL=StorageManager.js.map