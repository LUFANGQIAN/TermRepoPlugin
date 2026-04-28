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
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
const ensureStorageDir_1 = require("./ensureStorageDir");
/**
 * 词库存储管理器。
 *
 * 该类负责：
 * - 管理单词与拆分建议的内存态缓存
 * - 在 JSON 文件与运行时 `Map` 结构之间转换
 * - 暴露增删改查接口
 * - 在数据变化时向视图层广播刷新事件
 */
class StorageManager {
    /**
     * @param storagePath VS Code 分配给扩展的全局存储目录。
     */
    constructor(storagePath) {
        this.changeEmitter = new vscode.EventEmitter();
        this.terms = new Map();
        this.suggestions = new Map();
        /**
         * 当词库发生变更时触发的事件。
         *
         * Webview、TreeView 或其它上层调用方可以订阅该事件，
         * 用于在数据更新后立即刷新界面。
         */
        this.onDidChange = this.changeEmitter.event;
        this.dataFilePath = path.join(storagePath, 'termrepo-data.json');
    }
    /**
     * 初始化存储层。
     *
     * 初始化流程分为两步：
     * 1. 确保存储目录存在。
     * 2. 将磁盘中的 JSON 数据加载到内存缓存。
     */
    async init() {
        await (0, ensureStorageDir_1.ensureStorageDir)(path.dirname(this.dataFilePath));
        await this.load();
    }
    /**
     * 获取全部词条。
     *
     * @returns 当前缓存中的词条数组快照。
     */
    getAllTerms() {
        return Array.from(this.terms.values());
    }
    /**
     * 按词条 ID 获取单条数据。
     *
     * @param id 词条唯一标识。
     * @returns 命中时返回词条，否则返回 `undefined`。
     */
    getTerm(id) {
        return this.terms.get(id);
    }
    /**
     * 判断指定原始单词是否已存在于词库中。
     *
     * @param originalText 待检查的原始单词。
     * @returns 存在时返回 `true`，否则返回 `false`。
     */
    hasTerm(originalText) {
        return Array.from(this.terms.values()).some((term) => term.originalText === originalText);
    }
    /**
     * 新增词条。
     *
     * @param term 待写入的完整词条对象。
     * @returns 写入成功返回 `true`，若原始单词重复则返回 `false`。
     */
    async addTerm(term) {
        const existing = Array.from(this.terms.values()).some((item) => item.originalText === term.originalText);
        if (existing) {
            return false;
        }
        this.terms.set(term.id, term);
        await this.save();
        this.changeEmitter.fire();
        return true;
    }
    /**
     * 更新指定词条。
     *
     * @param id 目标词条 ID。
     * @param updates 需要覆盖的字段集合。
     * @returns 更新成功返回 `true`，词条不存在时返回 `false`。
     */
    async updateTerm(id, updates) {
        const current = this.terms.get(id);
        if (!current) {
            return false;
        }
        const updated = {
            ...current,
            ...updates,
            id: current.id,
            updatedAt: Date.now(),
        };
        this.terms.set(id, updated);
        await this.save();
        this.changeEmitter.fire();
        return true;
    }
    /**
     * 删除指定词条。
     *
     * @param id 目标词条 ID。
     * @returns 删除成功返回 `true`，词条不存在时返回 `false`。
     */
    async deleteTerm(id) {
        if (!this.terms.has(id)) {
            return false;
        }
        this.terms.delete(id);
        await this.save();
        this.changeEmitter.fire();
        return true;
    }
    async replaceTerms(terms) {
        this.terms = new Map(terms.map((term) => [term.id, term]));
        await this.save();
        this.changeEmitter.fire();
    }
    async mergeTerms(terms) {
        let imported = 0;
        let skipped = 0;
        for (const term of terms) {
            const exists = Array.from(this.terms.values()).some((item) => item.id === term.id || item.originalText === term.originalText);
            if (exists) {
                skipped += 1;
                continue;
            }
            this.terms.set(term.id, term);
            imported += 1;
        }
        if (imported > 0) {
            await this.save();
            this.changeEmitter.fire();
        }
        return { imported, skipped };
    }
    /**
     * 获取拆分项的最高频备注建议。
     *
     * @param partText 拆分项文本，例如 `router`。
     * @returns 出现频率最高的备注；若没有数据则返回 `undefined`。
     */
    getTopSuggestion(partText) {
        const partMap = this.suggestions.get(partText);
        if (!partMap) {
            return undefined;
        }
        let topNote;
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
     * 记录拆分项备注的使用频次。
     *
     * 该数据会在后续新增单词时作为输入建议使用，
     * 形成一个轻量的本地学习机制。
     *
     * @param partText 拆分项文本。
     * @param note 对应备注。
     */
    async updateSuggestion(partText, note) {
        if (!note) {
            return;
        }
        let partMap = this.suggestions.get(partText);
        if (!partMap) {
            partMap = new Map();
            this.suggestions.set(partText, partMap);
        }
        const count = (partMap.get(note) ?? 0) + 1;
        partMap.set(note, count);
        await this.save();
    }
    /**
     * 释放内部事件资源。
     */
    dispose() {
        this.changeEmitter.dispose();
    }
    /**
     * 从磁盘加载词库数据到内存。
     *
     * 若文件不存在，则自动创建一个空的存储文件；
     * 若文件损坏或版本不匹配，则回退为一份空缓存。
     */
    async load() {
        try {
            const raw = await fs.readFile(this.dataFilePath, 'utf-8');
            const parsed = JSON.parse(raw);
            if (parsed.version !== 1 || !parsed.terms) {
                this.terms = new Map();
                this.suggestions = new Map();
                await this.save();
                return;
            }
            this.terms = new Map(Object.entries(parsed.terms));
            if (parsed.suggestions) {
                this.suggestions = new Map(Object.entries(parsed.suggestions).map(([part, counts]) => [
                    part,
                    new Map(Object.entries(counts)),
                ]));
            }
            else {
                this.suggestions = new Map();
            }
        }
        catch (error) {
            const nodeError = error;
            if (nodeError.code === 'ENOENT') {
                this.terms = new Map();
                this.suggestions = new Map();
                await this.save();
                return;
            }
            console.error('[StorageManager] Failed to load storage file.', error);
            this.terms = new Map();
            this.suggestions = new Map();
        }
    }
    /**
     * 将内存中的词库与建议数据写回磁盘。
     */
    async save() {
        const suggestions = {};
        for (const [part, counts] of this.suggestions) {
            suggestions[part] = Object.fromEntries(counts);
        }
        const data = {
            version: 1,
            terms: Object.fromEntries(this.terms),
            suggestions,
        };
        await fs.writeFile(this.dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    }
}
exports.StorageManager = StorageManager;
//# sourceMappingURL=StorageManager.js.map