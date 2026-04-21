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
exports.FAVORITE_KEYBINDING_CONFIG_PATH = void 0;
exports.getFavoriteKeybinding = getFavoriteKeybinding;
exports.openFavoriteKeybindingSettings = openFavoriteKeybindingSettings;
exports.registerFavoriteKeybindingSupport = registerFavoriteKeybindingSupport;
const vscode = __importStar(require("vscode"));
const CONFIG_SECTION = 'termrepoplugin-vscode';
const FAVORITE_KEYBINDING_KEY = 'favoriteKeybinding';
const ADD_WORD_COMMAND = 'termrepoplugin-vscode.addWord';
const DEFAULT_FAVORITE_KEYBINDING = 'Alt+Q';
/**
 * 收藏快捷键设置项的完整路径。
 */
exports.FAVORITE_KEYBINDING_CONFIG_PATH = `${CONFIG_SECTION}.${FAVORITE_KEYBINDING_KEY}`;
/**
 * 读取当前配置的收藏快捷键字符串。
 *
 * 这里返回的是用户希望使用的快捷键文案，默认值为 `Alt+Q`。
 *
 * @returns 当前配置的收藏快捷键文本。
 */
function getFavoriteKeybinding() {
    const value = vscode.workspace
        .getConfiguration(CONFIG_SECTION)
        .get(FAVORITE_KEYBINDING_KEY, DEFAULT_FAVORITE_KEYBINDING)
        .trim();
    return value.length > 0 ? value : DEFAULT_FAVORITE_KEYBINDING;
}
/**
 * 打开“收藏选中单词”命令的键盘快捷方式配置界面。
 */
async function openFavoriteKeybindingSettings() {
    await vscode.commands.executeCommand('workbench.action.openGlobalKeybindings', `@command:${ADD_WORD_COMMAND}`);
}
/**
 * 注册收藏快捷键设置项的联动提示。
 *
 * 当用户修改收藏快捷键设置后，扩展会提供一个快捷入口，
 * 直接跳转到 VS Code 原生的快捷键配置界面，方便完成实际绑定。
 *
 * @param context 扩展上下文，用于托管配置变更监听器。
 */
function registerFavoriteKeybindingSupport(context) {
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((event) => {
        if (!event.affectsConfiguration(exports.FAVORITE_KEYBINDING_CONFIG_PATH)) {
            return;
        }
        const configuredKeybinding = getFavoriteKeybinding();
        void vscode.window
            .showInformationMessage(`已将收藏快捷键设置更新为 ${configuredKeybinding}。请在“键盘快捷方式”中把它绑定到“收藏选中单词”命令。`, '打开快捷方式')
            .then(async (action) => {
            if (action === '打开快捷方式') {
                await openFavoriteKeybindingSettings();
            }
        });
    }));
}
//# sourceMappingURL=favoriteKeybinding.js.map