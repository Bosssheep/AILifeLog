# 👥 产品功能规格文档 - 用户认证与数据隔离系统 (V3.0)

| 属性         | 内容                 |
| :----------- | :------------------- |
| **版本**     | v3.0 多用户版        |
| **状态**     | 已实现 (Implemented) |
| **最后更新** | 2026-02-22           |
| **撰写人**   | DeepSeek AI & Owner  |

---

## 1. 功能概述 (Feature Overview)

V3.0 版本将系统从单用户升级为多用户架构，引入完整的用户认证体系和数据隔离机制。通过 JWT + bcrypt 实现安全认证，每个用户拥有独立的数据库文件，确保数据隐私和安全。

## 2. 核心交互流程 (User Journey)

1. **注册/登录**：新用户注册账号或现有用户登录系统
2. **数据隔离**：登录后只能访问自己的日记数据
3. **数据迁移**：管理员可通过迁移接口将旧数据迁移到新结构
4. **安全退出**：JWT token 过期或用户主动退出

---

## 3. 详细功能说明 (Features)

### A. 用户认证系统 (Authentication System)

- **用户注册**：支持用户名密码注册，密码使用 bcrypt 哈希存储
- **用户登录**：基于 JWT token 的认证，token 有效期 7 天
- **密码安全**：所有密码经过 salt rounds=10 的 bcrypt 哈希处理
- **自动重定向**：未认证用户自动跳转到登录页面

### B. 数据隔离机制 (Data Isolation)

- **独立数据文件**：每个用户在 `server/data/users/{userId}/entries.json` 拥有专属数据文件
- **用户信息集中存储**：所有用户账号信息存储在 `server/data/users.json`
- **API 权限控制**：所有日记相关 API 都需要有效的 JWT token
- **并发控制**：使用写锁机制防止并发写入冲突

### C. 数据迁移工具 (Migration Tool)

- **一次性迁移**：提供 `/admin/migrate` 接口迁移旧版数据
- **智能合并**：自动识别并合并用户账号，保留原密码哈希
- **数据分发**：将旧版 entries 按 userId 分发到对应的用户数据文件
- **统计报告**：迁移完成后返回详细的迁移统计信息

### D. 安全增强 (Security Enhancements)

- **环境变量配置**：JWT_SECRET 通过环境变量配置，增强安全性
- **.gitignore 配置**：自动排除敏感数据文件（server/data/\*, .env）
- **错误处理**：统一的错误响应格式和友好的错误消息

## 4. 技术架构 (Technical Architecture)

### 后端技术栈

- **Express.js** - Web 框架
- **JWT** - JSON Web Token 认证
- **bcryptjs** - 密码哈希加密
- **Lowdb** - 轻量级 JSON 数据库
- **crypto** - UUID 生成

### 文件结构

```
server/
├── index.js                 # 主服务器文件
└── data/
    ├── users.json           # 用户账号数据库
    └── users/              # 用户数据目录
        └── {userId}/       # 每个用户的专属目录
            └── entries.json # 用户的日记数据
```

### API 端点

| 方法   | 端点               | 描述         | 认证要求         |
| ------ | ------------------ | ------------ | ---------------- |
| POST   | `/api/register`    | 用户注册     | 无               |
| POST   | `/api/login`       | 用户登录     | 无               |
| GET    | `/api/entries`     | 获取日记列表 | JWT Required     |
| POST   | `/api/entries`     | 创建新日记   | JWT Required     |
| PUT    | `/api/entries/:id` | 更新日记     | JWT Required     |
| DELETE | `/api/entries/:id` | 删除日记     | JWT Required     |
| POST   | `/admin/migrate`   | 数据迁移     | 无（仅开发环境） |

## 5. 部署说明 (Deployment)

### 环境变量

```bash
JWT_SECRET=your-super-secret-jwt-key
PORT=4000
```

### 生产环境注意事项

- 设置强壮的 JWT_SECRET
- 配置正确的 CORS 设置（如果前端独立部署）
- 确保 server/data 目录有写权限
- 定期备份用户数据文件

---

## 6. 未来规划 (Future Roadmap)

- [ ] **邮箱验证**：注册时发送验证邮件
- [ ] **密码重置**：通过邮箱重置密码功能
- [ ] **社交登录**：支持 GitHub/Google OAuth 登录
- [ ] **数据导出**：支持导出个人数据为 JSON/PDF
- [ ] **管理员面板**：用户管理和数据统计功能
