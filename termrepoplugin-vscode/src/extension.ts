import * as vscode from 'vscode';
import { registerCommands } from './commands';
import { registerTermCompletionProvider } from './providers/termCompletionProvider';
import { StorageManager } from './storage/StorageManager';
import { registerFavoriteKeybindingSupport } from './utils/favoriteKeybinding';
import { registerWebviewView } from './views';

/**
 * 扩展激活入口。
 *
 * 这里负责串联整个插件的三条主链路：
 * 1. 初始化本地词库存储。
 * 2. 注册命令、编辑器补全替换能力和侧边栏视图。
 * 3. 将所有运行时能力绑定到同一个 {@link StorageManager} 实例上，
 *    保证命令面板、编辑器补全和 Webview 访问的是同一份数据。
 *
 * @param context VS Code 在激活扩展时提供的上下文对象。
 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const storage = new StorageManager(context.globalStorageUri.fsPath);
  await storage.init();

  registerFavoriteKeybindingSupport(context);
  registerCommands(context, storage);
  registerTermCompletionProvider(context, storage);
  registerWebviewView(context, storage);
  console.log('addVersion');
  
}

/**
 * 扩展停用入口。
 *
 * 当前插件的资源释放主要依赖 `context.subscriptions` 自动清理，
 * 因此这里保留空实现，便于未来补充显式的关闭逻辑。
 */
export function deactivate(): void {
  // no-op
}
