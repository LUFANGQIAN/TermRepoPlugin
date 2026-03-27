import * as fs from 'fs/promises';

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

export async function ensureStorageDir(storagePath: string): Promise<void> {
  console.log('进入存储检测与创建模块');
  
  try {
    await fs.mkdir(storagePath, { recursive: true });
  } catch (err) {
    console.error('创建存储目录失败', err);
    // 可根据需求决定是否向上抛出错误
  }
}