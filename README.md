# 📒 LifeLog - 极简 AI 模块化日记

LifeLog 不仅仅是一款基于 **React + Tailwind CSS** 开发的极简日记应用，更是你的**数字灵魂知己**。
它巧妙地结合了“模块化块（Block-based）”的设计理念与大模型AI能力，通过内置的 **AI Agent “小含”**，为你每一天的生活碎碎念提供高共情的回应与深度的情感重构。

在这里，记录不再是单向的倾诉，而是一场温情的双向对话。💌

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
- 🤖 **AI 灵魂知己**：接入 Google Gemini 大模型，提供高共情、有深度的温情回信。
- 💾 **接口驱动**：基于 Express.js + JWT 认证的完整后端，支持标准 RESTful API
- ⚡ **极致速度**：基于 Vite 6 构建，零冗余代码，秒级启动。
- 📱 **响应式设计**：适配 PC 与移动端，随时随地记录。

---

## 🚀 最新更新

### 📅 AI Agent “小含”接入与情感重构系统 (v4.0)

> **更新日期：** 2026-03-09

为了打破传统日记的单向性，引入了智能 Agent 角色：

- **🤖 灵魂知己“小含”**：接入 Google Gemini 大模型，采用“情绪镜像”技术提供深度共情回信。
- **💌 手动寄信仪式感**：在详情页点击“寄给小含”，开启与 AI 的心灵对话。
- **📊 维度情绪分析**：自动生成情绪分值、核心标签及极具临场感的成长建议。
- **⚡ 跨语言异步处理**：Node.js 后端异步调度 Python AI 核心，极致响应体验。
- **🧹 暴力解析脱敏**：强大的内容清洗逻辑，确保回信正文纯净，JSON 元数据静默存储。

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

- **Node.js**: 建议版本 `20.19.0+` 或 `22.12.0+`。
- **Python**: 建议版本 `3.10+` (用于运行 AI Agent)。
- **包管理器**: 推荐使用 `pnpm` 或 `npm`。
- **AI 依赖**:
  ```bash
  pip3 install langchain-google-genai langchain-core jinja2 python-dotenv
  ```

---

## 🚀 快速开始

### 1. 配置环境变量

在项目根目录创建 `.env` 文件，并填入以下必要信息：

```bash
# Google Gemini API Key
GOOGLE_API_KEY=your_key_here
# 可选模型切换 (gemini-1.5-flash-latest, gemini-1.5-pro-latest)
GOOGLE_AI_MODEL=gemini-1.5-flash-latest
# JWT 密钥
JWT_SECRET=your_secret_key
# 本地代理 (可选)
# HTTP_PROXY=http://127.0.0.1:8001
```

### 2. 安装与启动

```bash
# 安装 Node 依赖
npm install

# 启动全栈服务 (前端 + 后端)
npm run dev
```

启动后，在浏览器访问 http://localhost:5173 即可。

---

## 📂 项目结构

```
lifelog/
├── agent/                  # ★ AI 核心层 (Python + LangChain)
│   ├── agent.py            # AI 执行脚本
│   └── prompt_v1.j2        # 灵魂知己系统 Prompt
├── server/                 # ★ 后端服务层 (Express.js)
│   ├── index.js            # API 主入口
│   ├── aiService.js        # AI 调度与内容清洗
│   └── data/               # 用户的专属 JSON 数据库
├── src/                    # ★ 前端 UI 层 (React + Tailwind)
│   ├── components/         # 模块化组件 (DetailView, Editor 等)
│   └── api/                # 前端 Service 请求封装
```

🛡️ 数据安全说明
存储机制：~~应用不设后端服务器，所有日记数据均存储在用户本地浏览器的 LocalStorage 中。~~ 应用采用本地服务器模式，数据持久化存储在根目录的 db.json 文件中。

备份建议：~~建议定期点击页面右上角的 “导出” 按钮...~~ 得益于文件存储，数据不再受浏览器清理影响。仍可通过“导出”功能生成 JSON 快照，用于测试数据回滚或环境迁移。

## ⚖️ 开源协议

本项目仅供个人学习记录与技术交流，采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 协议。**严禁任何形式的商业使用。**
