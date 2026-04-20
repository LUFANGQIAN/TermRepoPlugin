import * as fs from 'fs/promises';
import * as path from 'path';
import * as vscode from 'vscode';
import { ensureStorageDir } from './ensureStorageDir';
import { TermEntry } from '../types';

interface StorageData {
  version: number;
  terms: Record<string, TermEntry>;
  suggestions?: Record<string, Record<string, number>>;
  metadata?: { lastSyncTime?: number };
}

export class StorageManager implements vscode.Disposable {
  private readonly dataFilePath: string;
  private readonly changeEmitter = new vscode.EventEmitter<void>();
  private terms: Map<string, TermEntry> = new Map();
  private suggestions: Map<string, Map<string, number>> = new Map();

  public readonly onDidChange = this.changeEmitter.event;

  constructor(storagePath: string) {
    this.dataFilePath = path.join(storagePath, 'termrepo-data.json');
  }

  async init(): Promise<void> {
    await ensureStorageDir(path.dirname(this.dataFilePath));
    await this.load();
  }

  getAllTerms(): TermEntry[] {
    return Array.from(this.terms.values());
  }

  getTerm(id: string): TermEntry | undefined {
    return this.terms.get(id);
  }

  hasTerm(originalText: string): boolean {
    return Array.from(this.terms.values()).some((term) => term.originalText === originalText);
  }

  async addTerm(term: TermEntry): Promise<boolean> {
    const existing = Array.from(this.terms.values()).some((item) => item.originalText === term.originalText);
    if (existing) {
      return false;
    }

    this.terms.set(term.id, term);
    await this.save();
    this.changeEmitter.fire();
    return true;
  }

  async updateTerm(id: string, updates: Partial<TermEntry>): Promise<boolean> {
    const current = this.terms.get(id);
    if (!current) {
      return false;
    }

    const updated: TermEntry = {
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

  async deleteTerm(id: string): Promise<boolean> {
    if (!this.terms.has(id)) {
      return false;
    }

    this.terms.delete(id);
    await this.save();
    this.changeEmitter.fire();
    return true;
  }

  getTopSuggestion(partText: string): string | undefined {
    const partMap = this.suggestions.get(partText);
    if (!partMap) {
      return undefined;
    }

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

  async updateSuggestion(partText: string, note: string): Promise<void> {
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

  dispose(): void {
    this.changeEmitter.dispose();
  }

  private async load(): Promise<void> {
    try {
      const raw = await fs.readFile(this.dataFilePath, 'utf-8');
      const parsed = JSON.parse(raw) as StorageData;

      if (parsed.version !== 1 || !parsed.terms) {
        this.terms = new Map();
        this.suggestions = new Map();
        await this.save();
        return;
      }

      this.terms = new Map(Object.entries(parsed.terms));

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
    } catch (error: unknown) {
      const nodeError = error as NodeJS.ErrnoException;
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

  private async save(): Promise<void> {
    const suggestions: Record<string, Record<string, number>> = {};
    for (const [part, counts] of this.suggestions) {
      suggestions[part] = Object.fromEntries(counts);
    }

    const data: StorageData = {
      version: 1,
      terms: Object.fromEntries(this.terms),
      suggestions,
    };

    await fs.writeFile(this.dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
  }
}
