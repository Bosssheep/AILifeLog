# 技术更新文档：LifeLog 系统架构升级 (v2.0)

## 1. 概述 (Overview)

本次更新将系统从基于浏览器的纯前端应用升级为前后端分离的持久化系统。通过引入 Node.js 服务端存储，解决了数据容量限制及设备隔离问题，并为自动化测试提供了稳定的数据底座。

## 2. 架构变更 (Architecture Changes)

特性 旧版 (v1.0) 新版 (v2.0)
存储介质 Browser LocalStorage Local Disk (db.json)
通信协议 无（内存直接读写） HTTP / RESTful API
代码结构 UI 与逻辑耦合 Service 层抽离 (Decoupling)
数据一致性 手动维护前端数组 以服务端为准 (Single Source of Truth)

## 3. 核心功能实现

### 3.1 数据持久化 (Persistence)

使用 json-server 搭建轻量级后端，通过 Node.js 文件系统将日记实时写入根目录下的 db.json。

### 3.2 异步 CRUD 服务

提取 src/api/diaryService.js 模块，封装标准 RESTful 请求：
●GET: 获取全部数据并执行服务端数据同步。
●POST/PUT: 实现“保存”功能，自动识别新增或更新。
●DELETE: 实现物理删除。

### 3.3 智能合并逻辑 (Smart Import)

重构导入功能，引入 Upsert (更新或插入) 策略：

- 1.对比导入文件与当前数据库的 id。
- 2.若匹配成功，则覆盖旧数据（先删后增）。
- 3.若匹配失败，则直接追加。
- 4.操作完成后自动触发 fetchEntries 刷新视图。

## 4. 异常处理与健壮性 (Robustness)

针对测开关注的边缘场景进行了优化：
● 连接容错：捕获 ERR_CONNECTION_REFUSED 异常，在后端服务未启动时提供 UI 友好提示，防止脚本崩溃。
● 数据校验：导入前置 Array.isArray 检查，确保数据源格式合法。
● 状态隔离：清空 currentEntry 状态，确保在保存或导入后界面逻辑复位。

## 5. 环境启动指南

前置要求
● Node.js 环境
● 安装依赖：npm install json-server

启动步骤

- 1.启动后端服务：

```bash
npx json-server --watch db.json --port 3001
```

- 2.启动前端应用：

```bash
  npm run dev
```

## 6. 质量保证视角：未来扩展点 (Future Roadmap)

● 数据工厂 (Data Factory)：编写 Node.js 脚本批量生成 Mock 数据进行压力测试。
● 接口测试：可接入 Postman 或 Pytest 针对 localhost:3001 进行独立接口校验。
● UI 自动化：利用 Service 层解耦的优势，接入 Playwright 进行端到端 (E2E) 测试。
