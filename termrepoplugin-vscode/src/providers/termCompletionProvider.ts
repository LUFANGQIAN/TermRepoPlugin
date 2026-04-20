import * as vscode from 'vscode';
import { StorageManager } from '../storage/StorageManager';
import { TermEntry } from '../types';

const CONFIG_SECTION = 'termrepoplugin-vscode';
const CONFIG_KEY = 'triggerSymbol';

export function registerTermCompletionProvider(
  context: vscode.ExtensionContext,
  storage: StorageManager
): void {
  let providerDisposable: vscode.Disposable | undefined;

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

export function getTriggerCharacter(): string {
  const value = vscode.workspace.getConfiguration(CONFIG_SECTION).get<string>(CONFIG_KEY, ';').trim();
  return value.length > 0 ? value[0] : ';';
}

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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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
