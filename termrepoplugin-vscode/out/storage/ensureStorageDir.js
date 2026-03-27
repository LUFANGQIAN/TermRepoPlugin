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
exports.ensureStorageDir = ensureStorageDir;
const fs = __importStar(require("fs/promises"));
/**
 * 确保 VS Code 扩展的全局存储目录存在。
 * 如果目录不存在，则递归创建所有父级目录。
 *
 * @param storagePath - 存储目录的绝对路径，通常从 `context.globalStorageUri.fsPath` 获取。
 *
 * @example
 * ```typescript
 * import * as vscode from 'vscode';
 * import { ensureStorageDir } from './storage/ensureStorageDir';
 *
 * export async function activate(context: vscode.ExtensionContext) {
 *     const storagePath = context.globalStorageUri.fsPath;
 *     await ensureStorageDir(storagePath);
 *     // 现在可以安全地向该目录写入文件
 * }
 * ```
 *
 * @remarks
 * - 本函数使用 `fs.mkdir` 的 `recursive: true` 选项，因此目录已存在时不会报错。
 * - 如果创建失败，会在控制台输出错误信息，但不会抛出异常（可根据需要修改）。
 */
async function ensureStorageDir(storagePath) {
    console.log('进入存储检测与创建模块');
    try {
        await fs.mkdir(storagePath, { recursive: true });
    }
    catch (err) {
        console.error('创建存储目录失败', err);
        // 可根据需求决定是否向上抛出错误
    }
}
//# sourceMappingURL=ensureStorageDir.js.map