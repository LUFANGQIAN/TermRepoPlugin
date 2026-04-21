/**
 * 项目统一公共导出入口。
 *
 * 这个文件的职责是把插件中值得阅读、复用和生成文档的公开接口集中导出，
 * 让阅读代码的人只需要从一个入口就能快速了解整个项目的能力边界。
 *
 * 建议将它理解为项目的“公共 API 清单”：
 * - 想看扩展如何启动，可以从这里进入 `activate` / `deactivate`
 * - 想看命令系统，可以从这里进入 `registerCommands` 和各个命令工厂
 * - 想看数据结构，可以从这里进入 `TermEntry` / `TermPart`
 * - 想看词库存储、Webview、补全替换等实现，也都可以从这里跳转
 *
 * 未来如果项目继续扩展，推荐优先维护这个文件，
 * 让它始终保持“对外阅读入口”的角色。
 *
 * @module 项目公共导出入口
 */

/**
 * 扩展生命周期与入口能力。
 */
export { activate, deactivate } from './extension';

/**
 * 命令系统总入口与各命令工厂。
 */
export { registerCommands } from './commands';
export {
  addWordCommand,
  copyWordCommand,
  configureFavoriteKeybindingCommand,
  exportWordsCommand,
  importWordsCommand,
  printSelectionCommand,
  showAllWordsCommand,
} from './commands';

/**
 * 编辑器补全与触发符号配置能力。
 */
export {
  getTriggerCharacter,
  registerTermCompletionProvider,
} from './providers/termCompletionProvider';

/**
 * 存储层能力。
 */
export { ensureStorageDir } from './storage/ensureStorageDir';
export { StorageManager } from './storage/StorageManager';

/**
 * 视图层能力。
 */
export { registerWebviewView } from './views';
export { MyWebviewProvider } from './views/MyWebviewProvider';

/**
 * 业务数据类型。
 */
export type { TermEntry, TermPart } from './types';

/**
 * 工具函数与辅助数据。
 */
export { copyToClipboard } from './utils/clipboard';
export {
  FAVORITE_KEYBINDING_CONFIG_PATH,
  getFavoriteKeybinding,
  openFavoriteKeybindingSettings,
  registerFavoriteKeybindingSupport,
} from './utils/favoriteKeybinding';
export {
  askForTermDetails,
  autoTagPart,
  splitIdentifier,
} from './utils/termUtils';
export { suggestionMap } from './utils/wordSuggestions';
