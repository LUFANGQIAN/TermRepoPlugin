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
exports.initWordTreeView = initWordTreeView;
// src/views/index.ts
const vscode = __importStar(require("vscode"));
const wordTreeProvider_1 = require("./wordTreeProvider");
/**
 * 初始化底部面板的单词列表树视图。
 * @param context - 扩展上下文，用于注册视图
 * @param storage - 存储管理器实例
 * @returns WordTreeProvider 实例，可用于刷新视图或监听事件
 */
function initWordTreeView(context, storage) {
    console.log('Registering tree data provider for termRepoWordList');
    const treeProvider = new wordTreeProvider_1.WordTreeProvider(storage);
    vscode.window.registerTreeDataProvider('termRepoWordList', treeProvider);
    return treeProvider;
}
//# sourceMappingURL=index.js.map