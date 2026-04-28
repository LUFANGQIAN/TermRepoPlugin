# 任务计划：插件云同步

## 目标
为 VS Code 插件接入 TermRepo 后端云同步接口，支持配置服务地址和插件 Token，并能导出/导入本地术语快照。

## 阶段
1. [完成] 梳理插件命令与存储结构
2. [完成] 设计云同步 API 与配置项
3. [完成] 实现云同步服务与命令
4. [完成] 接入 package.json 命令/配置
5. [完成] 编译验证并记录结果

## 决策
- 开发后端默认使用 http://localhost:3000/api/v1。
- 仅对接当前后端已实现的 /sync/status、/sync/toggle、/sync/snapshot/export、/sync/snapshot/import。
