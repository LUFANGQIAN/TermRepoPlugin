import * as fs from 'fs/promises';

/**
 * 确保存储目录存在。
 *
 * 该函数用于在插件首次激活时准备本地存储目录，
 * 避免后续读写 JSON 数据文件时因为目录不存在而失败。
 *
 * @param storagePath 要创建或确认存在的目录绝对路径。
 */
export async function ensureStorageDir(storagePath: string): Promise<void> {
  try {
    await fs.mkdir(storagePath, { recursive: true });
  } catch (error) {
    console.error('创建存储目录失败:', error);
  }
}
