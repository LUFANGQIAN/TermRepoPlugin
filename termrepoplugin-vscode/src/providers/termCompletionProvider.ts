import * as vscode from 'vscode';
import { StorageManager } from '../storage/StorageManager';
import { TermEntry } from '../types';

const CONFIG_SECTION = 'termrepoplugin-vscode';
const CONFIG_KEY = 'triggerSymbol';

/**
 * 注册基于固定触发符号的单词替换补全提供器。
 *
 * 用户在编辑器中输入类似 `;router` 的前缀后，
 * 提供器会在词库中搜索匹配项，并将整段触发文本替换为目标单词。
 * 该提供器同时监听配置变化，以支持触发符号的动态切换。
 *
 * @param context 扩展上下文，用于托管补全提供器和配置监听器。
 * @param storage 词库存储管理器，用于检索补全候选词条。
 */
export function registerTermCompletionProvider(
  context: vscode.ExtensionContext,
  storage: StorageManager
): void {
  let providerDisposable: vscode.Disposable | undefined;

  /**
   * 按当前配置重新注册补全提供器。
   *
   * 这样可以在用户修改触发符号后立即生效，而无需重载扩展。
   */
  const registerProvider = (): void => {
    providerDisposable?.dispose();

    const triggerCharacter = getTriggerCharacter();
    if (!triggerCharacter) {
      return;
    }

    providerDisposable = vscode.languages.registerCompletionItemProvider(
      { pattern: '**' },
      {
        provideCompletionItems(document, position) {
          const linePrefix = document.lineAt(position).text.slice(0, position.character);
          const match = matchTrigger(linePrefix, triggerCharacter);

          if (!match) {
            return undefined;
          }

          const query = match.query.toLowerCase();
          const replaceRange = new vscode.Range(
            position.line,
            position.character - match.fullText.length,
            position.line,
            position.character
          );

          return findTerms(storage.getAllTerms(), query).map((term) => {
            const item = new vscode.CompletionItem(term.originalText, vscode.CompletionItemKind.Text);
            item.detail = term.overallNote ? `TermRepo: ${term.overallNote}` : 'TermRepo 单词库';
            item.documentation = buildDocumentation(term);
            item.insertText = term.originalText;
            item.range = replaceRange;
            item.sortText = term.originalText.toLowerCase();
            item.filterText = `${triggerCharacter}${term.originalText} ${term.overallNote ?? ''} ${term.tags.join(' ')}`;
            return item;
          });
        },
      },
      triggerCharacter
    );

    context.subscriptions.push(providerDisposable);
  };

  registerProvider();

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(`${CONFIG_SECTION}.${CONFIG_KEY}`)) {
        registerProvider();
      }
    }),
    {
      dispose: () => {
        providerDisposable?.dispose();
      },
    }
  );
}

/**
 * 读取当前配置的触发符号。
 *
 * 即使用户误填了多个字符，这里也只取第一个字符作为真正的触发前缀，
 * 以保证补全提供器始终工作在单字符触发模型下。
 *
 * @returns 当前有效的触发符号。
 */
export function getTriggerCharacter(): string {
  const value = vscode.workspace.getConfiguration(CONFIG_SECTION).get<string>(CONFIG_KEY, ';').trim();
  return value.length > 0 ? value[0] : ';';
}

/**
 * 从当前行前缀中提取触发符号和搜索关键字。
 *
 * @param linePrefix 光标左侧的文本内容。
 * @param triggerCharacter 当前配置的触发符号。
 * @returns 匹配成功时返回完整触发串与搜索词，否则返回 `null`。
 */
function matchTrigger(linePrefix: string, triggerCharacter: string): { fullText: string; query: string } | null {
  const escaped = escapeRegExp(triggerCharacter);
  const pattern = new RegExp(`${escaped}([\\w-]*)$`);
  const match = linePrefix.match(pattern);

  if (!match) {
    return null;
  }

  return {
    fullText: match[0],
    query: match[1],
  };
}

/**
 * 转义正则表达式中的特殊字符。
 *
 * @param value 原始字符串。
 * @returns 可安全用于正则表达式字面匹配的字符串。
 */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 从词库中筛选符合查询条件的候选项。
 *
 * 检索范围覆盖：
 * - 原始单词
 * - 整体备注
 * - 标签
 * - 拆分项文本与备注
 *
 * @param terms 待检索的词条集合。
 * @param query 用户输入的查询关键字。
 * @returns 已排序并限制数量的候选项数组。
 */
function findTerms(terms: TermEntry[], query: string): TermEntry[] {
  return terms
    .filter((term) => {
      if (!query) {
        return true;
      }

      const searchable = [
        term.originalText,
        term.overallNote ?? '',
        term.tags.join(' '),
        term.parts.map((part) => `${part.text} ${part.note ?? ''} ${part.tags.join(' ')}`).join(' '),
      ]
        .join(' ')
        .toLowerCase();

      return searchable.includes(query);
    })
    .slice()
    .sort((left, right) => right.updatedAt - left.updatedAt)
    .slice(0, 30);
}

/**
 * 为补全项生成 Markdown 说明面板。
 *
 * @param term 当前候选词条。
 * @returns 供补全面板展示的富文本说明。
 */
function buildDocumentation(term: TermEntry): vscode.MarkdownString {
  const markdown = new vscode.MarkdownString(undefined, true);
  markdown.appendMarkdown(`**${term.originalText}**`);

  if (term.overallNote) {
    markdown.appendMarkdown(`\n\n${term.overallNote}`);
  }

  if (term.parts.length > 0) {
    const parts = term.parts
      .map((part) => `- \`${part.text}\`${part.note ? `: ${part.note}` : ''}`)
      .join('\n');
    markdown.appendMarkdown(`\n\n${parts}`);
  }

  return markdown;
}
