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
exports.registerTermCompletionProvider = registerTermCompletionProvider;
exports.getTriggerCharacter = getTriggerCharacter;
const vscode = __importStar(require("vscode"));
const CONFIG_SECTION = 'termrepoplugin-vscode';
const CONFIG_KEY = 'triggerSymbol';
function registerTermCompletionProvider(context, storage) {
    let providerDisposable;
    const registerProvider = () => {
        providerDisposable?.dispose();
        const triggerCharacter = getTriggerCharacter();
        if (!triggerCharacter) {
            return;
        }
        providerDisposable = vscode.languages.registerCompletionItemProvider({ pattern: '**' }, {
            provideCompletionItems(document, position) {
                const linePrefix = document.lineAt(position).text.slice(0, position.character);
                const match = matchTrigger(linePrefix, triggerCharacter);
                if (!match) {
                    return undefined;
                }
                const query = match.query.toLowerCase();
                const replaceRange = new vscode.Range(position.line, position.character - match.fullText.length, position.line, position.character);
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
        }, triggerCharacter);
        context.subscriptions.push(providerDisposable);
    };
    registerProvider();
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration(`${CONFIG_SECTION}.${CONFIG_KEY}`)) {
            registerProvider();
        }
    }), {
        dispose: () => {
            providerDisposable?.dispose();
        },
    });
}
function getTriggerCharacter() {
    const value = vscode.workspace.getConfiguration(CONFIG_SECTION).get(CONFIG_KEY, ';').trim();
    return value.length > 0 ? value[0] : ';';
}
function matchTrigger(linePrefix, triggerCharacter) {
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
function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function findTerms(terms, query) {
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
function buildDocumentation(term) {
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
//# sourceMappingURL=termCompletionProvider.js.map