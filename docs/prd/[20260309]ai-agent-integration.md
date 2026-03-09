# 🤖 产品功能规格文档 - AI Agent 接入系统 (V4.0)

| 属性         | 内容                 |
| :----------- | :------------------- |
| **版本**     | v4.0 AI 增强版       |
| **状态**     | 已实现 (Implemented) |
| **最后更新** | 2026-03-09           |
| **撰写人**   | Gemini AI & Owner    |

---

## 1. 功能概述 (Feature Overview)

V4.0 版本为 LifeLog 引入了名为“小含”的智能 AI Agent。通过接入 Google Gemini 大模型，系统能够根据用户记录的模块化日记内容，提供高共情、深层次的情感回馈与生活洞察。该功能旨在打破传统日记“单向记录”的枯燥感，为用户提供一个温情的、有回应的数字树洞。

## 2. 核心交互流程 (User Journey)

1. **记录生活**：用户在编辑器中通过模块化标签（日常、心情、成长等）记录当日内容。
2. **主动寄信**：日记保存后，用户进入详情页，点击顶部的“寄给小含”按钮。
3. **异步生成**：后端接收请求后，在后台调用 Python AI 脚本，不阻塞用户操作。
4. **温情回信**：AI 生成包含“情感镜像”、“深度理解”和“启发提问”的回信，并附带情绪评分与成长建议。
5. **查阅回信**：用户刷新详情页，即可看到以信封形式呈现的专属回信。

---

## 3. 详细功能说明 (Features)

### A. 智能 Agent “小含” (AI Identity)

- **角色定位**：高共情力的灵魂知己，语气自然平实，拒绝机械化的夸赞。
- **核心逻辑**：采用“情绪镜像”技术，优先确认用户情绪，再进行正向重构与深度陪伴。
- **模型支持**：支持 `gemini-1.5-flash-latest` (默认)、`gemini-1.5-pro-latest` 等多种大模型。

### B. 模块化解析与重构 (Content Processing)

- **结构化输入**：AI 能够识别日记中的 `tag`（如 `schedule` 识别为行动力，`thoughts` 识别为内心世界）。
- **暴力清洗逻辑**：后端具备强大的解析能力，自动剥离 AI 输出中的 JSON 元数据和模板标签，确保展示给用户的正文纯净无干扰。
- **自动格式化**：将 AI 返回的结构化评分（分数、标签、成长建议）自动追加到信件末尾。

### C. 交互体验设计 (UX Design)

- **手动寄信模式**：将“保存”与“AI 触发”分离，通过“寄给小含”按钮增强仪式感，同时节省 API 消耗。
- **异步处理**：回信生成过程在后台进行，前端通过温馨提示告知用户，无需原地等待。
- **专属 UI 呈现**：回信内容展示在淡黄色信封样式的模块中，具备鼠标悬浮放大效果，增强交互温度。

### D. 技术实现方案 (Technical Integration)

- **跨语言集成**：Node.js 后端通过 `child_process` 异步调用 Python 脚本，完美复用 Python 生态中的 AI 工具链。
- **代理支持**：支持本地开发环境的 HTTP/HTTPS 代理配置，解决 API 访问受限问题。
- **元数据存储**：AI 生成的深度分析数据（JSON 格式）持久化存储在日记条目的 `metadata` 字段中。

---

## 4. 技术架构 (Technical Architecture)

### 技术栈

- **Google Gemini API** - 核心大模型
- **LangChain (Python)** - AI 链编排与 Prompt 管理
- **Node.js** - 后端业务逻辑与异步调度
- **Jinja2** - 灵活的系统 Prompt 模板

### 核心组件

```
lifelog/
├── agent/
│   ├── agent.py            # AI 执行核心 (Python)
│   └── prompt_v1.j2        # 灵魂知己 Prompt 模板
├── server/
│   ├── aiService.js        # AI 调用包装器 (Node.js)
│   └── index.js            # API 接口与异步逻辑
└── src/
    └── components/
        └── DetailView.jsx  # 回信 UI 渲染
```

### API 端点

| 方法   | 端点                         | 描述                   | 认证要求     |
| ------ | ---------------------------- | ---------------------- | ------------ |
| POST   | `/api/entries/:id/ai-reply`  | 手动触发 AI 生成回信   | JWT Required |

## 5. 部署与配置 (Deployment)

### 环境变量 (.env)

```bash
GOOGLE_API_KEY=your_key_here
GOOGLE_AI_MODEL=gemini-1.5-flash-latest
HTTP_PROXY=http://127.0.0.1:8001  # 本地开发可选
```

### 注意事项

- 确保部署环境已安装 `python3` 及相关依赖包（`langchain-google-genai` 等）。
- 生产环境（如 Railway）建议关闭代理配置。
