import * as vscode from 'vscode';
import {
  getFavoriteKeybinding,
  openFavoriteKeybindingSettings,
} from '../utils/favoriteKeybinding';

/**
 * 创建“配置收藏快捷键”命令。
 *
 * VS Code 的快捷键绑定由独立的键盘快捷方式系统管理，
 * 因此该命令会根据当前插件设置中的目标组合键，
 * 直接打开对应命令的快捷键配置入口，方便用户完成实际绑定。
 *
 * @returns 注册完成后的命令句柄。
 */
export function configureFavoriteKeybindingCommand(): vscode.Disposable {
  return vscode.commands.registerCommand('termrepoplugin-vscode.configureFavoriteKeybinding', async () => {
    await openFavoriteKeybindingSettings();

    const configuredKeybinding = getFavoriteKeybinding();
    void vscode.window.showInformationMessage(
      `当前收藏快捷键设置为 ${configuredKeybinding}。请在打开的“键盘快捷方式”界面中，将它绑定到“收藏选中单词”命令。`
    );
  });
}
