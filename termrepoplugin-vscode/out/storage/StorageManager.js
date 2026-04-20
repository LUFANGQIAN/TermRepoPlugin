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
class StorageManager {
    constructor(storagePath) {
        this.changeEmitter = new vscode.EventEmitter();
        this.terms = new Map();
        this.suggestions = new Map();
        this.onDidChange = this.changeEmitter.event;
        this.dataFilePath = path.join(storagePath, 'termrepo-data.json');
    }
    async init() {
        await (0, ensureStorageDir_1.ensureStorageDir)(path.dirname(this.dataFilePath));
        await this.load();
    }
    getAllTerms() {
        return Array.from(this.terms.values());
    }
    getTerm(id) {
        return this.terms.get(id);
    }
    hasTerm(originalText) {
        return Array.from(this.terms.values()).some((term) => term.originalText === originalText);
    }
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
    async deleteTerm(id) {
        if (!this.terms.has(id)) {
            return false;
        }
        this.terms.delete(id);
        await this.save();
        this.changeEmitter.fire();
        return true;
    }
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
    dispose() {
        this.changeEmitter.dispose();
    }
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