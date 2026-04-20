import { randomUUID } from 'crypto';
import * as vscode from 'vscode';
import { getTriggerCharacter } from '../providers/termCompletionProvider';
import { StorageManager } from '../storage/StorageManager';
import { TermEntry, TermPart } from '../types';

type WebviewMessage =
  | { command: 'ready' }
  | { command: 'search'; query: string }
  | { command: 'openList' }
  | { command: 'openCreate' }
  | { command: 'openEdit'; id: string }
  | { command: 'exportWords' }
  | { command: 'importWords' }
  | { command: 'openSettings' }
  | { command: 'saveTerm'; payload: EditableTermPayload }
  | { command: 'deleteTerm'; id: string }
  | { command: 'copyWord'; word: string };

interface EditablePartPayload {
  text: string;
  note?: string;
  tags?: string[];
  type?: string;
}

interface EditableTermPayload {
  id?: string;
  originalText: string;
  overallNote?: string;
  filePath?: string;
  tags?: string[];
  mastery?: number;
  reviewCount?: number;
  nextReviewDate?: number | null;
  parts: EditablePartPayload[];
}

interface WebviewTermSummary {
  id: string;
  originalText: string;
  overallNote?: string;
  filePath?: string;
  tags: string[];
  partCount: number;
  updatedAt: number;
}

interface WebviewStatePayload {
  terms: WebviewTermSummary[];
  selectedTerm: TermEntry | null;
  searchQuery: string;
  page: 'list' | 'detail';
  mode: 'create' | 'edit' | null;
  triggerCharacter: string;
}

export class MyWebviewProvider implements vscode.WebviewViewProvider, vscode.Disposable {
  private webviewView?: vscode.WebviewView;
  private selectedId: string | null = null;
  private searchQuery = '';
  private page: 'list' | 'detail' = 'list';
  private mode: 'create' | 'edit' | null = null;
  private readonly disposables: vscode.Disposable[] = [];

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly storage: StorageManager
  ) {
    this.disposables.push(
      this.storage.onDidChange(() => {
        void this.refresh();
      }),
      vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration('termrepoplugin-vscode.triggerSymbol')) {
          void this.refresh();
        }
      })
    );
  }

  dispose(): void {
    while (this.disposables.length > 0) {
      this.disposables.pop()?.dispose();
    }
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this.webviewView = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };

    webviewView.webview.html = this.getHtml(webviewView.webview);

    const messageDisposable = webviewView.webview.onDidReceiveMessage((message: WebviewMessage) => {
      void this.handleMessage(message);
    });

    this.disposables.push(messageDisposable);
  }

  private async handleMessage(message: WebviewMessage): Promise<void> {
    switch (message.command) {
      case 'ready':
        await this.refresh();
        return;
      case 'search':
        this.searchQuery = message.query.trim();
        await this.refresh();
        return;
      case 'openList':
        this.page = 'list';
        this.mode = null;
        await this.refresh();
        return;
      case 'openCreate':
        this.page = 'detail';
        this.mode = 'create';
        this.selectedId = null;
        await this.refresh();
        return;
      case 'openEdit':
        this.page = 'detail';
        this.mode = 'edit';
        this.selectedId = message.id;
        await this.refresh();
        return;
      case 'exportWords':
        await vscode.commands.executeCommand('termrepoplugin-vscode.exportWords');
        return;
      case 'importWords':
        await vscode.commands.executeCommand('termrepoplugin-vscode.importWords');
        return;
      case 'openSettings':
        await vscode.commands.executeCommand(
          'workbench.action.openSettings',
          'termrepoplugin-vscode.triggerSymbol'
        );
        return;
      case 'saveTerm':
        await this.saveTerm(message.payload);
        return;
      case 'deleteTerm':
        await this.deleteTerm(message.id);
        return;
      case 'copyWord':
        await vscode.env.clipboard.writeText(message.word);
        void vscode.window.showInformationMessage(`已复制单词: ${message.word}`);
        return;
    }
  }

  private async saveTerm(payload: EditableTermPayload): Promise<void> {
    const normalizedWord = payload.originalText.trim();
    if (!normalizedWord) {
      await this.postError('单词内容不能为空。');
      return;
    }

    const parts = this.normalizeParts(payload.parts);
    if (parts.length === 0) {
      await this.postError('至少需要保留一个拆分项。');
      return;
    }

    const tags = this.normalizeTags(payload.tags);
    const filePath = payload.filePath?.trim() || undefined;
    const overallNote = payload.overallNote?.trim() || undefined;

    if (payload.id) {
      const current = this.storage.getTerm(payload.id);
      if (!current) {
        await this.postError('未找到要更新的单词。');
        return;
      }

      const duplicate = this.storage
        .getAllTerms()
        .some((term) => term.id !== payload.id && term.originalText === normalizedWord);
      if (duplicate) {
        await this.postError(`单词 "${normalizedWord}" 已存在。`);
        return;
      }

      await this.storage.updateTerm(payload.id, {
        originalText: normalizedWord,
        overallNote,
        filePath,
        tags,
        parts,
        mastery: this.normalizeNumber(payload.mastery, current.mastery),
        reviewCount: this.normalizeNumber(payload.reviewCount, current.reviewCount),
        nextReviewDate: payload.nextReviewDate ?? undefined,
      });

      this.page = 'list';
      this.mode = null;
      this.selectedId = payload.id;
      await this.postInfo(`已更新单词: ${normalizedWord}`);
      return;
    }

    if (this.storage.hasTerm(normalizedWord)) {
      await this.postError(`单词 "${normalizedWord}" 已存在。`);
      return;
    }

    const now = Date.now();
    const created: TermEntry = {
      id: randomUUID(),
      originalText: normalizedWord,
      overallNote,
      filePath,
      tags,
      parts,
      createdAt: now,
      updatedAt: now,
      mastery: this.normalizeNumber(payload.mastery, 0),
      reviewCount: this.normalizeNumber(payload.reviewCount, 0),
      nextReviewDate: payload.nextReviewDate ?? undefined,
    };

    const added = await this.storage.addTerm(created);
    if (!added) {
      await this.postError(`单词 "${normalizedWord}" 已存在。`);
      return;
    }

    this.page = 'list';
    this.mode = null;
    this.selectedId = created.id;
    await this.postInfo(`已新增单词: ${normalizedWord}`);
  }

  private async deleteTerm(id: string): Promise<void> {
    const target = this.storage.getTerm(id);
    if (!target) {
      await this.postError('未找到要删除的单词。');
      return;
    }

    const confirmed = await vscode.window.showWarningMessage(
      `确定删除单词 "${target.originalText}" 吗？`,
      { modal: true },
      '删除'
    );

    if (confirmed !== '删除') {
      return;
    }

    if (this.selectedId === id) {
      this.selectedId = null;
    }
    this.page = 'list';
    this.mode = null;

    await this.storage.deleteTerm(id);
    await this.postInfo(`已删除单词: ${target.originalText}`);
  }

  private normalizeParts(parts: EditablePartPayload[]): TermPart[] {
    return parts
      .map((part) => ({
        text: part.text.trim(),
        note: part.note?.trim() || undefined,
        tags: this.normalizeTags(part.tags),
        type: part.type?.trim() || undefined,
      }))
      .filter((part) => part.text.length > 0);
  }

  private normalizeTags(tags?: string[]): string[] {
    if (!tags) {
      return [];
    }

    const uniqueTags = new Set(
      tags
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
    );
    return Array.from(uniqueTags);
  }

  private normalizeNumber(value: number | undefined, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  }

  private getVisibleTerms(): TermEntry[] {
    const allTerms = this.storage
      .getAllTerms()
      .slice()
      .sort((left, right) => right.updatedAt - left.updatedAt);

    if (!this.searchQuery) {
      return allTerms;
    }

    const query = this.searchQuery.toLowerCase();
    return allTerms.filter((term) => {
      const haystack = [
        term.originalText,
        term.overallNote ?? '',
        term.filePath ?? '',
        term.tags.join(' '),
        term.parts.map((part) => `${part.text} ${part.note ?? ''} ${part.tags.join(' ')}`).join(' '),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }

  private buildStatePayload(): WebviewStatePayload {
    const visibleTerms = this.getVisibleTerms();
    const selectedTerm =
      this.mode === 'edit' && this.selectedId ? this.storage.getTerm(this.selectedId) ?? null : null;

    if (this.mode === 'edit' && this.selectedId && !selectedTerm) {
      this.page = 'list';
      this.mode = null;
      this.selectedId = null;
    }

    return {
      terms: visibleTerms.map((term) => ({
        id: term.id,
        originalText: term.originalText,
        overallNote: term.overallNote,
        filePath: term.filePath,
        tags: term.tags,
        partCount: term.parts.length,
        updatedAt: term.updatedAt,
      })),
      selectedTerm,
      searchQuery: this.searchQuery,
      page: this.page,
      mode: this.mode,
      triggerCharacter: getTriggerCharacter(),
    };
  }

  private async refresh(): Promise<void> {
    if (!this.webviewView) {
      return;
    }

    await this.webviewView.webview.postMessage({
      type: 'state',
      payload: this.buildStatePayload(),
    });
  }

  private async postInfo(message: string): Promise<void> {
    if (!this.webviewView) {
      return;
    }

    await this.webviewView.webview.postMessage({
      type: 'notification',
      payload: { kind: 'info', message },
    });
  }

  private async postError(message: string): Promise<void> {
    if (!this.webviewView) {
      vscode.window.showErrorMessage(message);
      return;
    }

    await this.webviewView.webview.postMessage({
      type: 'notification',
      payload: { kind: 'error', message },
    });
  }

  private getHtml(webview: vscode.Webview): string {
    const nonce = this.getNonce();

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta
    http-equiv="Content-Security-Policy"
    content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';"
  />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TermRepo</title>
  <style>
    :root {
      --border: var(--vscode-sideBarSectionHeader-border, var(--vscode-panel-border));
      --button-icon-size: 22px;
      --danger: var(--vscode-errorForeground);
      --row-hover: var(--vscode-list-hoverBackground);
      --menu-bg: var(--vscode-menu-background, var(--vscode-editorWidget-background));
      --menu-fg: var(--vscode-menu-foreground, var(--vscode-foreground));
      --menu-border: var(--vscode-menu-border, var(--vscode-panel-border));
      --menu-hover: var(--vscode-list-hoverBackground);
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 0;
      color: var(--vscode-sideBar-foreground);
      background: var(--vscode-sideBar-background);
      font-family: var(--vscode-font-family);
      font-size: 12px;
      line-height: 1.35;
    }

    button,
    input,
    textarea {
      font: inherit;
    }

    .view {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .titlebar {
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 0 8px;
      border-bottom: 1px solid var(--border);
      background: var(--vscode-sideBarSectionHeader-background);
      color: var(--vscode-sideBarSectionHeader-foreground);
    }

    .titlebar h1 {
      margin: 0;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .actions {
      display: inline-flex;
      flex: none;
      align-items: center;
      gap: 2px;
    }

    .icon-button {
      width: var(--button-icon-size);
      height: var(--button-icon-size);
      border: 0;
      border-radius: 3px;
      padding: 0;
      color: var(--vscode-icon-foreground);
      background: transparent;
      cursor: pointer;
      display: inline-grid;
      place-items: center;
      line-height: 1;
    }

    .icon-button:hover {
      background: var(--vscode-toolbar-hoverBackground);
    }

    .icon-button.danger:hover {
      color: var(--danger);
      background: color-mix(in srgb, var(--danger) 14%, transparent);
    }

    .content {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }

    .search-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 6px;
      padding: 6px 8px;
      border-bottom: 1px solid var(--border);
      position: relative;
    }

    .input,
    .textarea,
    .number {
      width: 100%;
      border: 1px solid var(--vscode-input-border, transparent);
      border-radius: 2px;
      outline: none;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
    }

    .input,
    .number {
      height: 24px;
      padding: 2px 6px;
    }

    .textarea {
      min-height: 52px;
      padding: 5px 6px;
      resize: vertical;
    }

    .input:focus,
    .textarea:focus,
    .number:focus {
      border-color: var(--vscode-focusBorder);
    }

    .summary {
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 0 8px;
      color: var(--vscode-descriptionForeground);
      border-bottom: 1px solid var(--border);
      font-size: 11px;
    }

    .word-list {
      flex: 1;
      min-height: 0;
      overflow: auto;
      padding: 4px 0;
    }

    .word-card {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 6px;
      padding: 5px 6px 5px 8px;
      color: var(--vscode-sideBar-foreground);
      border-left: 2px solid transparent;
    }

    .word-card:hover {
      background: var(--row-hover);
    }

    .word-main {
      min-width: 0;
      cursor: pointer;
    }

    .word-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 12px;
      font-weight: 600;
      color: inherit;
    }

    .word-note {
      margin-top: 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--vscode-descriptionForeground);
      font-size: 11px;
    }

    .word-meta {
      display: flex;
      gap: 4px;
      margin-top: 3px;
      color: var(--vscode-descriptionForeground);
      font-size: 10px;
    }

    .word-actions {
      display: inline-flex;
      gap: 1px;
      align-items: start;
      opacity: 0.74;
    }

    .word-card:hover .word-actions {
      opacity: 1;
    }

    .empty {
      padding: 18px 10px;
      color: var(--vscode-descriptionForeground);
      text-align: center;
      font-size: 12px;
    }

    .menu {
      position: absolute;
      top: 34px;
      right: 8px;
      width: 156px;
      padding: 4px;
      border: 1px solid var(--menu-border);
      background: var(--menu-bg);
      color: var(--menu-fg);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.18);
      z-index: 10;
    }

    .menu button {
      width: 100%;
      height: 26px;
      border: 0;
      background: transparent;
      color: inherit;
      text-align: left;
      padding: 0 8px;
      border-radius: 2px;
      cursor: pointer;
    }

    .menu button:hover {
      background: var(--menu-hover);
    }

    .detail {
      flex: 1;
      min-height: 0;
      overflow: auto;
      padding: 8px;
    }

    .field {
      display: grid;
      gap: 4px;
      margin-bottom: 8px;
    }

    .field label {
      color: var(--vscode-descriptionForeground);
      font-size: 11px;
    }

    .two-cols {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }

    .part-card {
      padding: 6px;
      margin-bottom: 6px;
      border: 1px solid var(--border);
      border-radius: 3px;
      background: var(--vscode-editor-background);
    }

    .part-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
      color: var(--vscode-descriptionForeground);
      font-size: 11px;
    }

    .button-row {
      position: sticky;
      bottom: 0;
      display: flex;
      justify-content: space-between;
      gap: 6px;
      padding: 8px;
      border-top: 1px solid var(--border);
      background: var(--vscode-sideBar-background);
    }

    .button-group {
      display: inline-flex;
      gap: 6px;
    }

    .button {
      height: 26px;
      border: 1px solid transparent;
      border-radius: 2px;
      padding: 0 9px;
      cursor: pointer;
      color: var(--vscode-button-foreground);
      background: var(--vscode-button-background);
    }

    .button:hover {
      background: var(--vscode-button-hoverBackground);
    }

    .button.secondary {
      color: var(--vscode-button-secondaryForeground);
      background: var(--vscode-button-secondaryBackground);
    }

    .button.secondary:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }

    .button.danger {
      color: var(--danger);
      border-color: color-mix(in srgb, var(--danger) 45%, transparent);
      background: transparent;
    }

    .button.danger:hover {
      background: color-mix(in srgb, var(--danger) 12%, transparent);
    }

    .status {
      min-height: 22px;
      padding: 4px 8px;
      color: var(--vscode-descriptionForeground);
      font-size: 11px;
      border-top: 1px solid var(--border);
    }

    .status[data-kind="error"] {
      color: var(--danger);
    }

    .mono {
      font-family: var(--vscode-editor-font-family, monospace);
    }

    .hidden {
      display: none !important;
    }
  </style>
</head>
<body>
  <main class="view">
    <section id="listPage" class="content">
      <header class="titlebar">
        <h1>TermRepo 词库</h1>
        <div class="actions">
          <button id="addButton" class="icon-button" title="新增单词" type="button">+</button>
        </div>
      </header>

      <div class="search-row">
        <input id="searchInput" class="input" type="search" placeholder="搜索单词、备注、标签" />
        <button id="menuButton" class="icon-button" title="插件配置" type="button">⋯</button>
        <div id="configMenu" class="menu hidden">
          <button id="importButton" type="button">导入单词库</button>
          <button id="exportButton" type="button">导出单词库</button>
          <button id="settingsButton" type="button">插件设置</button>
        </div>
      </div>

      <div id="summary" class="summary">
        <span id="summaryText">0 个单词</span>
        <span id="triggerHint" class="mono"></span>
      </div>

      <div id="wordList" class="word-list"></div>
    </section>

    <section id="detailPage" class="content hidden">
      <header class="titlebar">
        <div class="actions">
          <button id="backButton" class="icon-button" title="返回列表" type="button"><</button>
        </div>
        <h1 id="detailTitle">编辑单词</h1>
        <div class="actions">
          <button id="detailDeleteIcon" class="icon-button danger" title="删除单词" type="button">×</button>
        </div>
      </header>

      <form id="detailForm" class="content">
        <div class="detail">
          <input id="termId" type="hidden" />

          <div class="field">
            <label for="wordInput">单词</label>
            <input id="wordInput" class="input mono" type="text" placeholder="indexRouter" />
          </div>

          <div class="field">
            <label for="overallNoteInput">整体备注</label>
            <textarea id="overallNoteInput" class="textarea" placeholder="这个词条的整体说明"></textarea>
          </div>

          <div class="field">
            <label for="filePathInput">来源文件</label>
            <input id="filePathInput" class="input mono" type="text" placeholder="src/example.ts" />
          </div>

          <div class="field">
            <label for="tagsInput">标签，逗号分隔</label>
            <input id="tagsInput" class="input" type="text" placeholder="en, webview" />
          </div>

          <div class="two-cols">
            <div class="field">
              <label for="masteryInput">掌握度</label>
              <input id="masteryInput" class="number" type="number" min="0" step="1" />
            </div>
            <div class="field">
              <label for="reviewCountInput">复习次数</label>
              <input id="reviewCountInput" class="number" type="number" min="0" step="1" />
            </div>
          </div>

          <div class="field">
            <label>拆分项</label>
            <div id="partsContainer"></div>
            <button id="addPartButton" class="button secondary" type="button">新增拆分项</button>
          </div>
        </div>

        <div class="button-row">
          <div class="button-group">
            <button id="saveButton" class="button" type="submit">保存</button>
            <button id="copyButton" class="button secondary" type="button">复制</button>
          </div>
          <div class="button-group">
            <button id="resetButton" class="button secondary" type="button">重置</button>
            <button id="deleteButton" class="button danger" type="button">删除</button>
          </div>
        </div>
      </form>
    </section>

    <div id="statusMessage" class="status" aria-live="polite"></div>
  </main>

  <template id="partTemplate">
    <section class="part-card">
      <div class="part-head">
        <span class="part-index">拆分项</span>
        <button class="icon-button danger part-remove-button" title="移除拆分项" type="button">×</button>
      </div>

      <div class="two-cols">
        <div class="field">
          <label>文本</label>
          <input class="input part-text" type="text" placeholder="router" />
        </div>
        <div class="field">
          <label>类型</label>
          <input class="input part-type" type="text" placeholder="camelCase" />
        </div>
      </div>

      <div class="field">
        <label>备注</label>
        <textarea class="textarea part-note" placeholder="路由"></textarea>
      </div>

      <div class="field">
        <label>标签，逗号分隔</label>
        <input class="input part-tags" type="text" placeholder="en, zh" />
      </div>
    </section>
  </template>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    const state = {
      terms: [],
      selectedTerm: null,
      searchQuery: "",
      page: "list",
      mode: null,
      triggerCharacter: ";",
    };

    const listPage = document.getElementById("listPage");
    const detailPage = document.getElementById("detailPage");
    const addButton = document.getElementById("addButton");
    const menuButton = document.getElementById("menuButton");
    const configMenu = document.getElementById("configMenu");
    const importButton = document.getElementById("importButton");
    const exportButton = document.getElementById("exportButton");
    const settingsButton = document.getElementById("settingsButton");
    const backButton = document.getElementById("backButton");
    const searchInput = document.getElementById("searchInput");
    const summaryText = document.getElementById("summaryText");
    const triggerHint = document.getElementById("triggerHint");
    const wordList = document.getElementById("wordList");
    const detailTitle = document.getElementById("detailTitle");
    const detailDeleteIcon = document.getElementById("detailDeleteIcon");
    const detailForm = document.getElementById("detailForm");
    const termIdInput = document.getElementById("termId");
    const wordInput = document.getElementById("wordInput");
    const overallNoteInput = document.getElementById("overallNoteInput");
    const filePathInput = document.getElementById("filePathInput");
    const tagsInput = document.getElementById("tagsInput");
    const masteryInput = document.getElementById("masteryInput");
    const reviewCountInput = document.getElementById("reviewCountInput");
    const partsContainer = document.getElementById("partsContainer");
    const addPartButton = document.getElementById("addPartButton");
    const copyButton = document.getElementById("copyButton");
    const resetButton = document.getElementById("resetButton");
    const deleteButton = document.getElementById("deleteButton");
    const statusMessage = document.getElementById("statusMessage");
    const partTemplate = document.getElementById("partTemplate");

    function parseTags(rawValue) {
      return rawValue.split(",").map((item) => item.trim()).filter(Boolean);
    }

    function formatDate(timestamp) {
      if (!timestamp) {
        return "未更新";
      }
      return new Date(timestamp).toLocaleString("zh-CN", {
        hour12: false,
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    function escapeHtml(value) {
      return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
    }

    function setStatus(message, kind = "info") {
      statusMessage.dataset.kind = kind;
      statusMessage.textContent = message || "";
    }

    function showPage(page) {
      listPage.classList.toggle("hidden", page !== "list");
      detailPage.classList.toggle("hidden", page !== "detail");
      configMenu.classList.add("hidden");
    }

    function createPartElement(part = {}) {
      const fragment = partTemplate.content.cloneNode(true);
      const root = fragment.querySelector(".part-card");
      const textInput = root.querySelector(".part-text");
      const typeInput = root.querySelector(".part-type");
      const noteInput = root.querySelector(".part-note");
      const tagsInput = root.querySelector(".part-tags");
      const removeButton = root.querySelector(".part-remove-button");
      const indexLabel = root.querySelector(".part-index");

      textInput.value = part.text || "";
      typeInput.value = part.type || "";
      noteInput.value = part.note || "";
      tagsInput.value = Array.isArray(part.tags) ? part.tags.join(", ") : "";

      removeButton.addEventListener("click", () => {
        root.remove();
        refreshPartIndexes();
      });

      root._updateIndexLabel = (index) => {
        indexLabel.textContent = "拆分项 " + (index + 1);
      };

      return root;
    }

    function refreshPartIndexes() {
      Array.from(partsContainer.children).forEach((child, index) => {
        if (typeof child._updateIndexLabel === "function") {
          child._updateIndexLabel(index);
        }
      });
    }

    function renderParts(parts) {
      partsContainer.innerHTML = "";
      const normalizedParts = Array.isArray(parts) && parts.length > 0 ? parts : [{ text: "", note: "", tags: [], type: "" }];
      normalizedParts.forEach((part) => partsContainer.appendChild(createPartElement(part)));
      refreshPartIndexes();
    }

    function populateForm(term) {
      termIdInput.value = term?.id || "";
      wordInput.value = term?.originalText || "";
      overallNoteInput.value = term?.overallNote || "";
      filePathInput.value = term?.filePath || "";
      tagsInput.value = Array.isArray(term?.tags) ? term.tags.join(", ") : "";
      masteryInput.value = term?.mastery ?? 0;
      reviewCountInput.value = term?.reviewCount ?? 0;
      renderParts(term?.parts || []);

      const editing = Boolean(term?.id);
      detailTitle.textContent = editing ? "编辑单词" : "新增单词";
      deleteButton.classList.toggle("hidden", !editing);
      detailDeleteIcon.classList.toggle("hidden", !editing);
      copyButton.disabled = !wordInput.value.trim();
    }

    function renderList() {
      wordList.innerHTML = "";
      summaryText.textContent = state.searchQuery
        ? state.terms.length + " 个匹配结果"
        : state.terms.length + " 个单词";
      triggerHint.textContent = "替换前缀: " + state.triggerCharacter;

      if (state.terms.length === 0) {
        wordList.innerHTML = '<div class="empty">暂无单词。点击右上角 + 新增，或从菜单导入。</div>';
        return;
      }

      state.terms.forEach((term) => {
        const card = document.createElement("article");
        card.className = "word-card";
        card.innerHTML = \`
          <div class="word-main" title="打开二级编辑页">
            <div class="word-name">\${escapeHtml(term.originalText)}</div>
            <div class="word-note">\${escapeHtml(term.overallNote || "暂无备注")}</div>
            <div class="word-meta">
              <span>\${term.partCount} parts</span>
              <span>\${escapeHtml(formatDate(term.updatedAt))}</span>
            </div>
          </div>
          <div class="word-actions">
            <button class="icon-button edit-action" title="编辑" type="button">✎</button>
            <button class="icon-button danger delete-action" title="删除" type="button">×</button>
          </div>
        \`;

        card.querySelector(".word-main").addEventListener("click", () => {
          vscode.postMessage({ command: "openEdit", id: term.id });
        });
        card.querySelector(".edit-action").addEventListener("click", (event) => {
          event.stopPropagation();
          vscode.postMessage({ command: "openEdit", id: term.id });
        });
        card.querySelector(".delete-action").addEventListener("click", (event) => {
          event.stopPropagation();
          vscode.postMessage({ command: "deleteTerm", id: term.id });
        });

        wordList.appendChild(card);
      });
    }

    function renderDetail() {
      if (state.page !== "detail") {
        return;
      }

      if (state.mode === "edit" && state.selectedTerm) {
        populateForm(state.selectedTerm);
        setStatus("已进入二级编辑页。");
        return;
      }

      populateForm(null);
      setStatus("正在创建新单词。");
    }

    function collectPayload() {
      const parts = Array.from(partsContainer.querySelectorAll(".part-card"))
        .map((item) => ({
          text: item.querySelector(".part-text").value.trim(),
          note: item.querySelector(".part-note").value.trim(),
          tags: parseTags(item.querySelector(".part-tags").value),
          type: item.querySelector(".part-type").value.trim(),
        }))
        .filter((part) => part.text);

      return {
        id: termIdInput.value || undefined,
        originalText: wordInput.value.trim(),
        overallNote: overallNoteInput.value.trim(),
        filePath: filePathInput.value.trim(),
        tags: parseTags(tagsInput.value),
        mastery: Number(masteryInput.value || 0),
        reviewCount: Number(reviewCountInput.value || 0),
        parts,
      };
    }

    function applyState(nextState) {
      state.terms = nextState.terms || [];
      state.selectedTerm = nextState.selectedTerm || null;
      state.searchQuery = nextState.searchQuery || "";
      state.page = nextState.page || "list";
      state.mode = nextState.mode || null;
      state.triggerCharacter = nextState.triggerCharacter || ";";

      if (document.activeElement !== searchInput) {
        searchInput.value = state.searchQuery;
      }

      showPage(state.page);
      renderList();
      renderDetail();
      vscode.setState(state);
    }

    window.addEventListener("message", (event) => {
      const message = event.data;
      if (message.type === "state") {
        applyState(message.payload);
      }

      if (message.type === "notification") {
        setStatus(message.payload.message, message.payload.kind);
      }
    });

    menuButton.addEventListener("click", () => {
      configMenu.classList.toggle("hidden");
    });

    document.addEventListener("click", (event) => {
      if (!configMenu.contains(event.target) && event.target !== menuButton) {
        configMenu.classList.add("hidden");
      }
    });

    importButton.addEventListener("click", () => {
      configMenu.classList.add("hidden");
      vscode.postMessage({ command: "importWords" });
    });

    exportButton.addEventListener("click", () => {
      configMenu.classList.add("hidden");
      vscode.postMessage({ command: "exportWords" });
    });

    settingsButton.addEventListener("click", () => {
      configMenu.classList.add("hidden");
      vscode.postMessage({ command: "openSettings" });
    });

    addButton.addEventListener("click", () => {
      vscode.postMessage({ command: "openCreate" });
    });

    backButton.addEventListener("click", () => {
      vscode.postMessage({ command: "openList" });
    });

    searchInput.addEventListener("input", () => {
      vscode.postMessage({ command: "search", query: searchInput.value });
    });

    addPartButton.addEventListener("click", () => {
      partsContainer.appendChild(createPartElement());
      refreshPartIndexes();
    });

    copyButton.addEventListener("click", () => {
      const word = wordInput.value.trim();
      if (!word) {
        setStatus("当前没有可复制的单词。", "error");
        return;
      }
      vscode.postMessage({ command: "copyWord", word });
    });

    resetButton.addEventListener("click", () => {
      if (state.mode === "edit" && state.selectedTerm) {
        populateForm(state.selectedTerm);
        return;
      }
      populateForm(null);
    });

    function requestDeleteCurrent() {
      if (!termIdInput.value) {
        setStatus("新建状态下无需删除。", "error");
        return;
      }
      vscode.postMessage({ command: "deleteTerm", id: termIdInput.value });
    }

    deleteButton.addEventListener("click", requestDeleteCurrent);
    detailDeleteIcon.addEventListener("click", requestDeleteCurrent);

    detailForm.addEventListener("submit", (event) => {
      event.preventDefault();
      vscode.postMessage({ command: "saveTerm", payload: collectPayload() });
    });

    const persistedState = vscode.getState();
    if (persistedState) {
      applyState(persistedState);
    } else {
      renderParts([]);
    }

    vscode.postMessage({ command: "ready" });
  </script>
</body>
</html>`;
  }

  private getNonce(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let value = '';
    for (let index = 0; index < 32; index += 1) {
      value += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return value;
  }
}
