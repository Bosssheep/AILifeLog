# Railway 后端 + GitHub Pages 前端部署配置

## 部署架构

- **后端**: Railway (https://ailifelog-production-alex.up.railway.app)
- **前端**: GitHub Pages (https://bosssheep.github.io/AILifeLog/)

## 环境变量配置

### Railway 后端环境变量

```bash
JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars
NODE_ENV=production
```

### GitHub Actions 环境变量

在 GitHub 仓库设置中添加：

- `VITE_API_BASE_URL`: `https://ailifelog-production-alex.up.railway.app`

## 构建命令

```bash
# 本地开发
npm run dev

# GitHub Pages 构建
npm run build:gh-pages

# Railway 后端
npm start
```

## 注意事项

1. 前端使用 GitHub Pages 的 base 路径 `/AILifeLog/`
2. 后端 API 地址通过环境变量配置
3. CORS 已在后端配置支持 GitHub Pages 域名
