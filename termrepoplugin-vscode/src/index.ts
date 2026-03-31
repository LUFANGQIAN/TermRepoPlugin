/**
 * @module 项目公共入口
 * @description 本文件是 TermRepoPlugin 的统一导出点。
 *
 * 模块结构说明：
 * - `storage`：单词存储核心，提供 StorageManager 类用于读写和管理单词数据。
 * - `commands`：所有 VS Code 命令的工厂函数，每个函数返回一个可注册的 Disposable。
 * - `views`：自定义视图组件，目前包含底部面板的单词树视图（WordTreeProvider）。
 * - `utils`：通用工具函数，例如剪贴板操作。
 *
 * 贡献者可以按需导入任何公共 API，例如：
 * ```typescript
 * import { StorageManager, addWordCommand, WordTreeProvider, copyToClipboard } from 'termrepoplugin-vscode';
 * ```
 *
 * 注意：内部模块的具体实现细节请参考各自的源文件。
 */

// 存储模块
export { StorageManager } from './storage/StorageManager';

// 命令模块
export {
  addWordCommand,
  printSelectionCommand,
  copyWordCommand,
  showAllWordsCommand,
  // 未来新增命令在此添加
} from './commands';

// 视图模块
export { WordTreeProvider, WordTreeItem } from './views/wordTreeProvider';
export { initWordTreeView } from './views';   // 如果需要外部初始化视图

// 工具模块
export { copyToClipboard } from './utils/clipboard';
// 其他工具函数在此导出