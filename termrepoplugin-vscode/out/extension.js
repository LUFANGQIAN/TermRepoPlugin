"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const commands_1 = require("./commands");
const termCompletionProvider_1 = require("./providers/termCompletionProvider");
const StorageManager_1 = require("./storage/StorageManager");
const favoriteKeybinding_1 = require("./utils/favoriteKeybinding");
const views_1 = require("./views");
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
async function activate(context) {
    const storage = new StorageManager_1.StorageManager(context.globalStorageUri.fsPath);
    await storage.init();
    (0, favoriteKeybinding_1.registerFavoriteKeybindingSupport)(context);
    (0, commands_1.registerCommands)(context, storage);
    (0, termCompletionProvider_1.registerTermCompletionProvider)(context, storage);
    (0, views_1.registerWebviewView)(context, storage);
}
/**
 * 扩展停用入口。
 *
 * 当前插件的资源释放主要依赖 `context.subscriptions` 自动清理，
 * 因此这里保留空实现，便于未来补充显式的关闭逻辑。
 */
function deactivate() {
    // no-op
}
//# sourceMappingURL=extension.js.map