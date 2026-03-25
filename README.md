# TermRepoPlugin

此插件属于**TermRepo** - 开发者术语收集与管理工具 系列下的收集端

## 介绍

### 项目名称

**TermRepoPlugin** - 开发者术语收集与管理工具收集端

### 项目定位

TermRepo 是一款专为开发者设计的 VS Code 插件，帮助开发者在编码过程中快速收藏、管理和复习专业术语，提升技术英语能力和知识积累效率。

### 目标用户

- 🎯 非英语母语的开发者
- 🎯 技术术语学习者
- 🎯 知识管理爱好者
- 🎯 团队协作场景

### 项目愿景

让每一个遇到的技术术语都成为可复用的知识资产。

### 版本信息

| 项目     | 信息             |
| -------- | ---------------- |
| 当前版本 | v0.0.1 (规划中)  |
| 开发状态 | 🚧 开发中         |
| 目标发布 | 2026 Q1          |
| 兼容版本 | VS Code ≥ 1.85.0 |

------

## 功能特性

### 核心功能

```txt
┌─────────────────────────────────────────────────────────────────┐
│                    TermRepo 功能全景图                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📥 收藏功能                    📋 管理功能                       │
│  ────────────                   ────────────                    │
│  • 选中文本一键收藏             • 侧边栏术语列表                     │
│  • 右键菜单快捷操作             • 术语详情查看                       │
│  • 快捷键支持 (Ctrl+Alt+C)      • 编辑/删除术语                    │
│  • 自动捕获上下文信息           • 标签分类管理                       │
│                                                                 │
│  🔍 搜索功能 (规划中)           📊 统计功能 (规划中)               │
│  ────────────                   ────────────                    │
│  • 关键词搜索                   • 收藏数量统计                   │
│  • 标签过滤                     • 学习进度追踪                   │
│  • 语言类型筛选                 • 掌握程度分析                   │
│  • 最近收藏排序                 • 复习提醒                       │
│                                                                 │
│  ☁️ 同步功能 (规划中)            🎓 学习功能 (规划中)             │
│  ──────────────────             ──────────────────              │
│  • 云端数据备份                 • 闪卡复习模式                   │
│  • 多设备同步                   • 每日术语推送                   │
│  • 团队共享词库                 • 测验功能                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 功能优先级

| 优先级 | 功能模块   | 状态     | 预计版本 |
| ------ | ---------- | -------- | -------- |
| P0     | 收藏命令   | 🚧 开发中 | v0.0.1   |
| P0     | 侧边栏展示 | 🚧 开发中 | v0.0.1   |
| P0     | 本地存储   | 🚧 开发中 | v0.0.1   |
| P1     | 搜索功能   | 📋 规划中 | v0.1.0   |
| P1     | 编辑/删除  | 📋 规划中 | v0.1.0   |
| P2     | 云端同步   | 📋 规划中 | v0.2.0   |
| P2     | 复习模式   | 📋 规划中 | v0.2.0   |
| P3     | 团队共享   | 📋 规划中 | v1.0.0   |

------

## 技术架构

### 系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                    TermRepo 技术架构                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    用户界面层 (UI Layer)                 │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │   │
│  │  │ 右键菜单  │  │ 命令面板  │  │ 侧边栏视图 │              │   │
│  │  └──────────┘  └──────────┘  └──────────┘              │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │   │
│  │  │ 快捷键   │  │ 通知提示  │  │ Webview  │              │   │
│  │  └──────────┘  └──────────┘  └──────────┘              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    业务逻辑层 (Business Layer)           │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  Command Handlers                                │   │   │
│  │  │  • CollectCommand    • SearchCommand             │   │   │
│  │  │  • EditCommand       • DeleteCommand             │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  Providers                                       │   │   │
│  │  │  • TermTreeProvider  • CompletionProvider        │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    数据服务层 (Data Layer)               │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  StorageService                                  │   │   │
│  │  │  • Memento Storage (VS Code 内置)                │   │   │
│  │  │  • SQLite Storage (本地数据库) [规划中]          │   │   │
│  │  │  • Cloud Storage (云端同步) [规划中]             │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    数据模型层 (Model Layer)              │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  Term          TermContext       TermFilter       │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 技术栈

| 层级     | 技术选型       |
| -------- | -------------- |
| 开发语言 | TypeScript     |
| 运行环境 | Node.js        |
| 构建工具 | esbuild        |
| 包管理   | npm            |
| 数据存储 | vscode.Memento |
| 数据库   | SQLite [规划]  |
| 测试框架 | Jest [规划]    |

### 项目结构

项目结构为规划样式

```
TermRepoPlugin/
├── .vscode/                    # VS Code 配置
│   ├── launch.json             # 调试配置
│   └── tasks.json              # 构建任务
├── src/                        # 源代码目录
│   ├── extension.ts            # 插件入口文件
│   ├── commands/               # 命令处理
│   │   ├── collectCommand.ts   # 收藏命令
│   │   ├── searchCommand.ts    # 搜索命令
│   │   └── ...                 # [开发中]
│   ├── providers/              # 数据提供者
│   │   ├── termTreeProvider.ts # 侧边栏树形数据
│   │   └── ...                 # [开发中]
│   ├── storage/                # 存储服务
│   │   ├── storageService.ts   # 存储接口实现
│   │   └── ...                 # [开发中]
│   ├── models/                 # 数据模型
│   │   ├── term.ts             # 术语模型定义
│   │   └── ...                 # [开发中]
│   ├── sync/                   # 同步服务
│   │   └── ...                 # [开发中]
│   └── utils/                  # 工具函数
│       ├── logger.ts           # 日志工具
│       └── ...                 # [开发中]
├── resources/                  # 资源文件
│   ├── light/                  # 浅色主题图标
│   └── dark/                   # 深色主题图标
├── .gitignore                  # Git 忽略配置
├── package.json                # 插件配置文件
├── tsconfig.json               # TypeScript 配置
├── README.md                   # 项目说明
└── CHANGELOG.md                # 更新日志

规划中
```

------





## 安装与使用

### 安装方式

#### 方式一：从 VS Code 市场安装（发布后）

```
1. 打开 VS Code
2. 点击左侧扩展图标 (Ctrl+Shift+X)
3. 搜索 "TermRepo"
4. 点击安装
```

#### 方式二：本地安装（开发阶段）

仅为参考 项目规划中

```bash
# 克隆项目
git clone https://github.com/your-username/TermRepoPlugin.git
cd TermRepoPlugin

# 安装依赖
npm install

# 构建项目
npm run compile

# 在 VS Code 中按 F5 运行调试
```

#### 方式三：从 VSIX 文件安装

```bash
# 打包插件
vsce package

# 安装 VSIX
code --install-extension termrepo-0.0.1.vsix
```



### 使用指南

以下皆为规划中 仅供参考

#### 快速开始

```
┌─────────────────────────────────────────────────────────────────┐
│                    5 步开始使用 TermRepo                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  步骤 1: 打开任意代码文件                                        │
│         ┌─────────────────┐                                     │
│         │  const x = 10   │                                     │
│         └─────────────────┘                                     │
│                                                                 │
│  步骤 2: 选中想要收藏的术语                                      │
│         ┌─────────────────┐                                     │
│         │  [const] x = 10 │  ← 选中 "const"                     │
│         └─────────────────┘                                     │
│                                                                 │
│  步骤 3: 右键点击 → 选择 "收藏术语"                              │
│         或使用快捷键 Ctrl+Alt+C                                 │
│                                                                 │
│  步骤 4: 在弹出框中输入翻译/备注                                 │
│         ┌─────────────────┐                                     │
│         │ 添加翻译或备注   │                                     │
│         │ [常量]          │                                     │
│         └─────────────────┘                                     │
│                                                                 │
│  步骤 5: 查看侧边栏确认收藏成功                                  │
│         ┌─────────────┐                                         │
│         │ TermRepo    │                                         │
│         │ ─────────   │                                         │
│         │ ✓ const     │  ← 新术语已显示                         │
│         │   常量      │                                         │
│         └─────────────┘                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 快捷键

| 操作     | Windows/Linux | macOS     |
| -------- | ------------- | --------- |
| 收藏术语 | Ctrl+Alt+C    | Cmd+Alt+C |
| 搜索术语 | Ctrl+Alt+F    | Cmd+Alt+F |
| 刷新词库 | Ctrl+Alt+R    | Cmd+Alt+R |

#### 配置选项

| 配置项               | 类型    | 默认值 | 说明                  |
| -------------------- | ------- | ------ | --------------------- |
| termrepo.enabled     | boolean | true   | 启用插件              |
| termrepo.autoSave    | boolean | true   | 自动保存              |
| termrepo.syncEnabled | boolean | false  | 启用云端同步 [规划中] |

------

## 开发指南

### 环境要求

| 软件    | 版本要求 | 安装方式                                                     |
| ------- | -------- | ------------------------------------------------------------ |
| Node.js | ≥ 18.x   | [https://nodejs.org](https://nodejs.org/)                    |
| VS Code | ≥ 1.85.0 | [https://code.visualstudio.com](https://code.visualstudio.com/) |
| npm     | ≥ 9.x    | 随 Node.js 安装                                              |
| Git     | ≥ 2.x    | [https://git-scm.com](https://git-scm.com/)                  |

### 开发环境搭建

```bash
# 1. 克隆项目
git clone https://github.com/your-username/TermRepoPlugin.git
cd TermRepoPlugin

# 2. 安装依赖
npm install

# 3. 安装 VS Code 扩展生成器 (首次开发需要)
npm install -g yo generator-code

# 4. 启动开发模式
npm run watch

# 5. 在 VS Code 中按 F5 启动调试
```

### 构建命令

| 命令              | 说明                 |
| ----------------- | -------------------- |
| `npm run compile` | 编译 TypeScript      |
| `npm run watch`   | 监听文件变化自动编译 |
| `npm run package` | 打包为 VSIX 文件     |
| `npm run lint`    | 代码检查             |

### 代码规范

```
┌─────────────────────────────────────────────────────────────────┐
│                    代码规范要点                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  命名规范                                                       │
│  ────────────                                                   │
│  • 文件/文件夹：kebab-case (term-tree-provider.ts)              │
│  • 类名：PascalCase (TermTreeProvider)                          │
│  • 函数/变量：camelCase (collectTerm)                           │
│  • 常量：UPPER_CASE (MAX_TERMS)                                 │
│  • 接口/类型：PascalCase (Term, TermContext)                    │
│                                                                 │
│  代码风格                                                       │
│  ────────────                                                   │
│  • 使用 TypeScript 严格模式                                     │
│  • 所有函数添加类型注解                                         │
│  • 使用 async/await 处理异步                                    │
│  • 错误使用 try-catch 捕获                                      │
│  • 添加必要的注释文档                                           │
│                                                                 │
│  提交规范                                                       │
│  ────────────                                                   │
│  • feat: 新功能                                                 │
│  • fix: 修复 bug                                                │
│  • docs: 文档更新                                               │
│  • style: 代码格式调整                                          │
│  • refactor: 重构                                               │
│  • test: 测试相关                                               │
│  • chore: 构建/工具相关                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 调试技巧

```
┌─────────────────────────────────────────────────────────────────┐
│                    调试方法                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  方法 1: F5 调试                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  • 按 F5 启动扩展开发主机                                        │
│  • 在新窗口中测试插件功能                                        │
│  • 断点调试源代码                                                │
│                                                                 │
│  方法 2: 控制台日志                                              │
│  ─────────────────────────────────────────────────────────────  │
│  console.log('调试信息')  // 在调试控制台查看                    │
│                                                                 │
│  方法 3: 输出面板                                                │
│  ─────────────────────────────────────────────────────────────  │
│  const output = vscode.window.createOutputChannel('TermRepo')   │
│  output.appendLine('日志')                                       │
│  output.show()                                                   │
│                                                                 │
│  方法 4: 开发者工具                                              │
│  ─────────────────────────────────────────────────────────────  │
│  • 开发主机中 Help → Toggle Developer Tools                     │
│  • 查看 Console 和 Network                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 技术细节

> ⚠️ **以下技术细节正在开发中，将在后续版本完善**

#### 核心 API 使用

```typescript
// [开发中] 详细 API 文档待补充
```

#### 数据存储方案

```typescript
// [开发中] 存储实现细节待补充
```

#### 同步机制设计

```typescript
// [开发中] 同步逻辑待补充
```

------

## API 说明

### 命令 API

> [开发中] 配置项详细说明待补充

| 命令 ID               | 说明         | 参数             | 返回值          |
| --------------------- | ------------ | ---------------- | --------------- |
| termrepo.collectTerm  | 收藏术语     | 无               | Promise         |
| termrepo.searchTerm   | 搜索术语     | keyword?: string | Promise<Term[]> |
| termrepo.refreshTerms | 刷新词库     | 无               | Promise         |
| termrepo.openTerm     | 打开术语详情 | term: Term       | Promise         |
| termrepo.deleteTerm   | 删除术语     | termId: string   | Promise         |

### 配置 API

> [开发中] 配置项详细说明待补充

### 事件 API

> [开发中] 事件订阅机制待补充

------

## 贡献指南

### 如何贡献

```
┌─────────────────────────────────────────────────────────────────┐
│                    贡献流程                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Fork 项目                                                    │
│     github.com/your-username/TermRepoPlugin                     │
│                                                                 │
│  2. 创建分支                                                     │
│     git checkout -b feat/your-feature                           │
│                                                                 │
│  3. 开发并提交                                                   │
│     git commit -m "feat: add your feature"                      │
│                                                                 │
│  4. 推送分支                                                     │
│     git push origin feat/your-feature                           │
│                                                                 │
│  5. 创建 Pull Request                                           │
│     github.com/your-username/TermRepoPlugin/pulls               │
│                                                                 │
│  6. 等待 Code Review                                            │
│     根据反馈修改代码                                             │
│                                                                 │
│  7. 合并到主分支                                                 │
│     维护者审核通过后合并                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 贡献类型

| 类型       | 说明                 |
| ---------- | -------------------- |
| 🐛 Bug 报告 | 提交 Issue 描述问题  |
| 💡 功能建议 | 提交 Issue 描述需求  |
| 📝 文档改进 | 修正或补充文档       |
| 🔧 代码贡献 | 提交 PR 修复或新功能 |
| 🎨 设计贡献 | UI/UX 改进建议       |
| 🌍 翻译贡献 | 多语言支持           |

### 开发待办

> ⚠️ **以下功能正在开发中，欢迎认领贡献**

-  SQLite 存储实现
-  云端同步功能
-  复习模式
-  单元测试覆盖
-  多语言支持
-  性能优化

------



## 提交规范

为保证项目的可读与可维护性 请各位遵从此文档格式提交commit

---

### 格式

```
<类型>(<范围>): <简短描述>

<详细描述（可选）>

<脚注（可选）>
```

**核心要求**：

- 首行不超过 50 个字符
- 使用中文或英文均可，但团队内保持一致
- 描述用**祈使句**，如“修复”“添加”“更新”

---

### 常用类型

| 类型       | 说明                                   |
| ---------- | -------------------------------------- |
| `feat`     | 新增功能                               |
| `fix`      | 修复 Bug                               |
| `docs`     | 仅文档变更                             |
| `style`    | 代码格式调整（不影响功能）             |
| `refactor` | 重构（既不是新功能也不是修复 Bug）     |
| `perf`     | 性能优化                               |
| `test`     | 增加或修改测试                         |
| `chore`    | 构建过程、辅助工具变动（不改业务代码） |
| `revert`   | 回滚之前的提交                         |

---

### 示例

```
feat(登录): 增加手机号登录功能
```

```
fix(支付): 修复支付宝回调验签失败问题
```

```
docs: 更新 README 中的安装说明
```

```
style: 统一缩进为 2 空格，移除多余空行
```

```
refactor(用户模块): 提取公共验证逻辑
```

```
chore: 升级 webpack 到 5.x
```

---

### 可选：添加详细描述

如果变更较复杂，首行之后空一行，再补充详细说明：

```
feat(搜索): 支持模糊搜索

- 增加 Elasticsearch 模糊查询配置
- 新增搜索历史记录功能
- 优化前端防抖处理
```

---

### 可选：关联 Issue 或 PR

在脚注中引用：

```
fix(列表): 修复分页组件跳转错误

Closes #123
```

```
feat(导出): 新增 Excel 批量导出

Refs: PR-456
```

---





## 常见问题

### FAQ

| 问题             | 解答                                           |
| ---------------- | ---------------------------------------------- |
| 数据存储在哪里？ | 默认使用 VS Code 全局状态存储，后续支持 SQLite |
| 数据会同步吗？   | v0.2.0 将支持云端同步 [规划中]                 |
| 支持多设备吗？   | 云端同步功能上线后支持 [规划中]                |
| 可以导出数据吗？ | v0.1.0 将支持导入导出 [规划中]                 |
| 开源吗？         | 是，MIT 许可证                                 |

### 故障排查

> [开发中] 常见问题排查指南待补充

------

## 更新日志

### 规划版本

#### v0.0.1 (MVP) - [开发中]

-  基础收藏功能
-  侧边栏展示
-  本地存储

#### v0.1.0 - [规划中]

-  搜索功能
-  编辑/删除
-  导入导出

#### v0.2.0 - [规划中]

-  云端同步
-  复习模式
-  SQLite 存储

#### v1.0.0 - [规划中]

-  团队共享
-  术语市场
-  完整测试覆盖

------

## 许可证

```
MIT License

Copyright (c) 2025 TermRepo Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

------

## 联系方式

| 渠道    | 链接                                                   |
| ------- | ------------------------------------------------------ |
| GitHub  | https://github.com/your-username/TermRepoPlugin        |
| Issues  | https://github.com/your-username/TermRepoPlugin/issues |
| Email   | [开发中]                                               |
| Discord | [规划中]                                               |

------

## 致谢

感谢以下项目和资源：

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Yeoman Generator](https://yeoman.io/)
- [TypeScript](https://www.typescriptlang.org/)

------

**📌 注：本文档中标注 [开发中] 的内容将在后续版本中完善，[规划中] 的内容为未来功能计划。**

**最后更新：2026 年 3 月**

