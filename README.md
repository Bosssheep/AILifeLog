# 📒 LifeLog - 极简模块化日记

LifeLog 是一款基于 **React + Tailwind CSS** 开发的极简主义日记应用。
它采用“模块化块（Block-based）”的设计理念，让你可以像玩积木一样记录生活，支持按标签分类回顾和本地化存储。

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

---

## ✨ 核心特性

- 🧩 **模块化记录**：自由组合"今日小记"、"心情"、"成长"、"感恩"等内容模块。
- 🏷️ **标签时间轴**：点击标签即可进入专属时间线，回顾特定领域的成长点滴。
- 👥 **多用户支持**：完整的用户注册、登录系统，支持多用户同时使用
- 🔐 **数据隔离**：每个用户拥有独立的数据库文件，确保隐私和安全
- 💾 **接口驱动**：基于 Express.js + JWT 认证的完整后端，支持标准 RESTful API
- ⚡ **极致速度**：基于 Vite 6 构建，零冗余代码，秒级启动。
- 📱 **响应式设计**：适配 PC 与移动端，随时随地记录。

---

## 🚀 最新更新

### 📅 用户认证与数据隔离系统 (v3.0)

> **更新日期：** 2026-02-22

为了支持多用户场景和数据安全，进行了以下核心升级：

- **🔐 用户认证系统**：基于 JWT + bcrypt 的完整注册/登录系统
- **👥 多用户支持**：支持多个用户同时使用，各自数据完全隔离
- **💾 数据文件隔离**：每个用户拥有独立的 `entries.json` 数据文件
- **🔄 数据迁移工具**：提供一次性迁移接口，将旧数据迁移到新结构
- **🔒 安全增强**：密码哈希存储，API 路由保护

### 📅 系统架构由 v1.0 (LocalStorage) 升级至 v2.0 (Client-Server)

> **更新日期：** 2026-02-04

为了提升数据安全性与测试专业度，进行了以下核心升级：

- **前后端分离架构**：引入 `json-server` 模拟后端环境，实现标准的 API 请求响应流。
- **Service 层逻辑抽象**：将 API 调用与 UI 组件完全解耦，支持高效的单元测试与 Mock 调试。
- **智能合并导入**：优化了 JSON 导入逻辑，支持 **Upsert (更新或插入)** 策略，自动识别 ID 冲突并覆盖。
- **测试工具链初始化**：新增 `scripts/seed.js` 脚本，支持一键构造大规模模拟测试数据。

### 📅 日历视角与内容预览功能上线

> **更新日期：** 2026-01-31

为了让回顾生活变得更加直观高效，对日历模块进行了重大升级：

- **全景日历视角**：支持以月度为单位全局扫视生活轨迹，日期状态一目了然。
- **即时内容预览**：鼠标悬停日历格子即可弹出内容摘要。无需频繁点击跳转，即可快速回溯当天的关键事件与心情。
- **多维度结构展示**：
  - **标签化分类**：预览中自动关联日记标签（如：心情、任务、灵感等）。
  - **结构化排版**：内容按标签整齐排列，支持多行摘要展示，确保信息量充足且视觉有序。
- **视觉体验优化**：采用响应式弹窗设计，自动适配内容长度，提供更丝滑的阅读体验。

## 🛠️ 环境配置

在开始之前，请确保你的开发环境满足以下要求：

- **Node.js**: 建议版本 `20.19.0+` 或 `22.12.0+` (由于 Vite 6 的兼容性要求)。
- **包管理器**: 推荐使用 `pnpm` (亦可使用 `npm` 或 `yarn`)。
- **安装依赖**：安装 `json-server` 以维持本地数据库运行 ：npm install json-server

---

## 🚀 快速开始

### 1. 克隆与下载

如果你已经有了项目文件，请进入项目根目录：

```bash
cd lifelog
```

### 2. 安装依赖

由于项目对构建工具有特定的版本适配需求（已锁定 Tailwind v3 以确保 PostCSS 兼容性），请执行：

```bash
npm install
```

### 3. 配置说明 (针对开发者)

项目核心依赖说明：

Tailwind CSS v3: 解决了与某些环境下的构建工具冲突问题。

FontAwesome: 提供 UI 图标支持。

PostCSS: 自动处理 CSS 兼容性前缀。

Json-server：零代码快速搭建本地 RESTful API 的工具

### 4. 本地启动

运行以下命令开启开发服务器：

- 1.启动后端服务：

```bash
npx json-server --watch db.json --port 3001
```

- 2.启动前端应用：

```bash
  npm run dev
```

启动后，在浏览器访问 http://localhost:5173 即可预览项目。

### 5. 项目构建

若需要生成用于部署的静态文件：

```bash
pnpm run build
```

## 📂 项目结构

```
lifelog-project/
├── .gitignore              # 忽略 node_modules、db.json(可选) 和本地环境配置
├── db.json                 # ★ 核心：本地 JSON 数据库 (json-server 自动读写)
├── index.html              # 入口 HTML 文件
├── package.json            # 项目依赖、脚本配置 (包含 dev 和 server 启动命令)
├── vite.config.js          # Vite 构建工具配置
│
├── public/                 # 静态资源 (图片、图标等直接引用的文件)
│   └── favicon.ico
│
├── scripts/                # 测试辅助脚本
│   └── seed.js             # 一键生成 100 条测试数据的种子脚本
│
├── src/                    # 源代码目录
│   ├── main.jsx            # React 渲染入口
│   ├── App.jsx             # 应用主逻辑 (指挥官，负责页面跳转和数据调度)
│   ├── index.css           # 全局样式配置
│   │
│   ├── api/                # ★ 逻辑抽离：后端交互层 (Service Layer)
│   │   └── diaryService.js # 封装所有的 CRUD (fetch) 请求
│   │
│   ├── components/         # ★ 组件化：UI 层 (Presentation Layer)
│   │   ├── EntryList.jsx   # 日记列表展示组件
│   │   ├── Editor.jsx      # 编辑/新增日记表单
│   │   ├── Sidebar.jsx     # 侧边栏及导入导出按钮
│   │   └── common/         # 通用基础组件 (按钮、输入框等)
│   │
│   ├── utils/              # 工具函数
│   │   └── dateHelper.js   # 格式化日期显示逻辑
│   │
│   └── assets/             # 需要被打包工具处理的资源 (CSS变量、SVG等)
│
└── tests/                  # ★ 未来扩展：自动化测试目录
    ├── e2e/                # 端到端测试 (Playwright / Cypress)
    └── unit/               # 单元测试 (Vitest / Jest)
```

🛡️ 数据安全说明
存储机制：~~应用不设后端服务器，所有日记数据均存储在用户本地浏览器的 LocalStorage 中。~~ 应用采用本地服务器模式，数据持久化存储在根目录的 db.json 文件中。

备份建议：~~建议定期点击页面右上角的 “导出” 按钮...~~ 得益于文件存储，数据不再受浏览器清理影响。仍可通过“导出”功能生成 JSON 快照，用于测试数据回滚或环境迁移。

## ⚖️ 开源协议

本项目仅供个人学习记录与技术交流，采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 协议。**严禁任何形式的商业使用。**
