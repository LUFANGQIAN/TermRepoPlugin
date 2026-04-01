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
class StorageManager {
    dataFilePath;
    terms = new Map();
    constructor(storagePath) {
        this.dataFilePath = path.join(storagePath, 'termrepo-data.json');
    }
    async init() {
        await (0, ensureStorageDir_1.ensureStorageDir)(path.dirname(this.dataFilePath));
        await this.load();
    }
    async load() {
        try {
            const data = await fs.readFile(this.dataFilePath, 'utf-8');
            const parsed = JSON.parse(data);
            if (parsed.version === 1 && parsed.terms) {
                this.terms = new Map(Object.entries(parsed.terms));
                console.log(`[StorageManager] 加载成功，共 ${this.terms.size} 个术语`);
            }
            else {
                this.terms = new Map();
                await this.save();
            }
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                this.terms = new Map();
                await this.save();
            }
            else {
                console.error('[StorageManager] 读取存储文件失败:', err);
                this.terms = new Map();
            }
        }
    }
    async save() {
        const data = {
            version: 1,
            terms: Object.fromEntries(this.terms),
        };
        await fs.writeFile(this.dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
        console.log('[StorageManager] 数据已保存到文件', this.dataFilePath);
    }
    // ---------------------- 核心 API ----------------------
    async addTerm(term) {
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
    getAllTerms() {
        return Array.from(this.terms.values());
    }
    getTerm(id) {
        return this.terms.get(id);
    }
    async updateTerm(id, updates) {
        const term = this.terms.get(id);
        if (!term) {
            return false;
        }
        const updated = { ...term, ...updates, updatedAt: Date.now() };
        this.terms.set(id, updated);
        await this.save();
        console.log('[StorageManager] 已更新术语:', id);
        return true;
    }
    async deleteTerm(id) {
        if (!this.terms.has(id)) {
            return false;
        }
        this.terms.delete(id);
        await this.save();
        console.log('[StorageManager] 已删除术语:', id);
        return true;
    }
}
exports.StorageManager = StorageManager;
//# sourceMappingURL=StorageManager.js.map