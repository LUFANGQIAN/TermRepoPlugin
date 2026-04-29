# 进度记录

- 已进入插件项目并读取根级 AGENTS.md。
- 已开始搜索命令、存储、网络、同步相关代码。

- 已完成存储、导入导出命令、命令注册和 package.json contributes 读取。
- 下一步新增 StorageManager 批量导入/合并能力与 cloudSync 命令。

- 已新增 `src/services/cloudSyncClient.ts`：封装后端同步 API。
- 已新增 `src/commands/cloudSync.ts`：提供状态、上传、拉取、合并四个云同步命令。
- 已扩展 `StorageManager`：支持 `replaceTerms` 与 `mergeTerms`。
- 已更新 `package.json`：注册命令、activationEvents、`cloudSync.apiBaseUrl` 与 `cloudSync.accessToken` 配置项。

- 编译验证：`npm run compile` 通过。
- Lint 验证：`npm run lint` 通过。

- 修正 package.json 新增命令标题和配置描述为英文，避免终端编码导致扩展元数据出现问号。
- Added plugin AI analyze client and wired add-word flow to prefill editable notes/tags, with warning fallback to local suggestions.
