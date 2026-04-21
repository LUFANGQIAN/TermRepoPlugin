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
exports.configureFavoriteKeybindingCommand = configureFavoriteKeybindingCommand;
const vscode = __importStar(require("vscode"));
const favoriteKeybinding_1 = require("../utils/favoriteKeybinding");
/**
 * 创建“配置收藏快捷键”命令。
 *
 * VS Code 的快捷键绑定由独立的键盘快捷方式系统管理，
 * 因此该命令会根据当前插件设置中的目标组合键，
 * 直接打开对应命令的快捷键配置入口，方便用户完成实际绑定。
 *
 * @returns 注册完成后的命令句柄。
 */
function configureFavoriteKeybindingCommand() {
    return vscode.commands.registerCommand('termrepoplugin-vscode.configureFavoriteKeybinding', async () => {
        await (0, favoriteKeybinding_1.openFavoriteKeybindingSettings)();
        const configuredKeybinding = (0, favoriteKeybinding_1.getFavoriteKeybinding)();
        void vscode.window.showInformationMessage(`当前收藏快捷键设置为 ${configuredKeybinding}。请在打开的“键盘快捷方式”界面中，将它绑定到“收藏选中单词”命令。`);
    });
}
//# sourceMappingURL=configureFavoriteKeybinding.js.map