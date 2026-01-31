# 📒 LifeLog - 极简模块化日记

LifeLog 是一款基于 **React + Tailwind CSS** 开发的极简主义日记应用。
它采用“模块化块（Block-based）”的设计理念，让你可以像玩积木一样记录生活，支持按标签分类回顾和本地化存储。

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white)

---

## ✨ 核心特性

- 🧩 **模块化记录**：自由组合“今日小记”、“心情”、“成长”、“感恩”等内容模块。
- 🏷️ **标签时间轴**：点击标签即可进入专属时间线，回顾特定领域的成长点滴。
- 💾 **本地化优先**：数据存储在浏览器 `localStorage` 中，支持 JSON 文件的导出与导入，确保隐私。
- ⚡ **极致速度**：基于 Vite 6 构建，零冗余代码，秒级启动。
- 📱 **响应式设计**：适配 PC 与移动端，随时随地记录。

---

## 🛠️ 环境配置

在开始之前，请确保你的开发环境满足以下要求：

- **Node.js**: 建议版本 `20.19.0+` 或 `22.12.0+` (由于 Vite 6 的兼容性要求)。
- **包管理器**: 推荐使用 `pnpm` (亦可使用 `npm` 或 `yarn`)。

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

### 4. 本地启动

运行以下命令开启开发服务器：

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
lifelog/
├── public/              # 静态资源（Favicon, Logo等）
├── src/
│   ├── App.jsx          # 核心业务逻辑与组件
│   ├── main.jsx         # 项目入口文件
│   └── index.css        # Tailwind 指令与全局样式
├── index.html           # 页面宿主
├── tailwind.config.js   # Tailwind 配置文件
└── package.json         # 依赖与脚本配置
```

## 🛡️ 数据安全说明

存储机制：应用不设后端服务器，所有日记数据均存储在用户本地浏览器的 LocalStorage 中。
备份建议：建议定期点击页面右上角的 “导出” 按钮，将数据以 .json 格式备份到本地硬盘，防止浏览器缓存清理导致数据丢失。

## ⚖️ 开源协议

本项目仅供个人学习记录与技术交流，采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 协议。**严禁任何形式的商业使用。**
