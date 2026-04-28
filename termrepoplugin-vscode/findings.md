# 发现记录

- 插件根目录：E:\MyCode\TermRepo\TermRepoPlugin\termrepoplugin-vscode
- 根级 AGENTS.md 要求始终使用简体中文，TypeScript 2 空格缩进。

## 代码发现
- 术语持久化由 `src/storage/StorageManager.ts` 管理，数据文件为 `termrepo-data.json`。
- 当前仅暴露逐条 `addTerm/updateTerm/deleteTerm/getAllTerms`，没有批量替换或合并 API。
- 已有本地 `exportWords/importWords` 命令，导出结构包含 `{ exportedAt, count, terms }`，可作为云同步 snapshot。
- 后端同步 API 要求插件 Token Bearer，scope 为 `sync:snapshot`。
- package.json 目前只有导入/导出本地词库命令，没有云同步配置项。
