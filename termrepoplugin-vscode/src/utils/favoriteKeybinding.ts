import * as vscode from 'vscode';

const CONFIG_SECTION = 'termrepoplugin-vscode';
const FAVORITE_KEYBINDING_KEY = 'favoriteKeybinding';
const ADD_WORD_COMMAND = 'termrepoplugin-vscode.addWord';
const DEFAULT_FAVORITE_KEYBINDING = 'Alt+Q';

/**
 * 收藏快捷键设置项的完整路径。
 */
export const FAVORITE_KEYBINDING_CONFIG_PATH = `${CONFIG_SECTION}.${FAVORITE_KEYBINDING_KEY}`;

/**
 * 读取当前配置的收藏快捷键字符串。
 *
 * 这里返回的是用户希望使用的快捷键文案，默认值为 `Alt+Q`。
 *
 * @returns 当前配置的收藏快捷键文本。
 */
export function getFavoriteKeybinding(): string {
  const value = vscode.workspace
    .getConfiguration(CONFIG_SECTION)
    .get<string>(FAVORITE_KEYBINDING_KEY, DEFAULT_FAVORITE_KEYBINDING)
    .trim();

  return value.length > 0 ? value : DEFAULT_FAVORITE_KEYBINDING;
}

/**
 * 打开“收藏选中单词”命令的键盘快捷方式配置界面。
 */
export async function openFavoriteKeybindingSettings(): Promise<void> {
  await vscode.commands.executeCommand(
    'workbench.action.openGlobalKeybindings',
    `@command:${ADD_WORD_COMMAND}`
  );
}

/**
 * 注册收藏快捷键设置项的联动提示。
 *
 * 当用户修改收藏快捷键设置后，扩展会提供一个快捷入口，
 * 直接跳转到 VS Code 原生的快捷键配置界面，方便完成实际绑定。
 *
 * @param context 扩展上下文，用于托管配置变更监听器。
 */
export function registerFavoriteKeybindingSupport(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (!event.affectsConfiguration(FAVORITE_KEYBINDING_CONFIG_PATH)) {
        return;
      }

      const configuredKeybinding = getFavoriteKeybinding();
      void vscode.window
        .showInformationMessage(
          `已将收藏快捷键设置更新为 ${configuredKeybinding}。请在“键盘快捷方式”中把它绑定到“收藏选中单词”命令。`,
          '打开快捷方式'
        )
        .then(async (action) => {
          if (action === '打开快捷方式') {
            await openFavoriteKeybindingSettings();
          }
        });
    })
  );
}
