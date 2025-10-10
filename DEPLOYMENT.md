# Vercel 部署指南

## 🚀 快速部署

### 前置条件

1. ✅ 代码已推送到 GitHub
2. ✅ 有 Vercel 账号并连接 GitHub
3. ✅ 项目包含 `vercel.json` 配置

### 1. 配置环境变量

在 **Vercel Dashboard → Settings → Environment Variables** 添加以下变量：

**必需变量：**

```bash
# 数据库
MONGODB_URI=mongodb+srv://your-connection-string
MONGODB_PASSWORD=your_password

# 认证 (NextAuth)
GITHUB_ID=your_github_oauth_client_id
GITHUB_SECRET=your_github_oauth_client_secret
NEXTAUTH_SECRET=your_generated_secret  # openssl rand -base64 32

# GitHub集成（博客功能）
GITHUB_TOKEN=your_github_personal_access_token
```

**可选变量：**

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

> 💡 参考 `apps/web/.env.example` 查看完整说明

### 2. 部署方式（二选一）

**方式 A：Git 自动部署（推荐）**

```bash
git push origin main  # 推送后自动部署
```

**方式 B：CLI 手动部署**

```bash
npm i -g vercel       # 安装 Vercel CLI
vercel login          # 登录
vercel --prod --yes   # 部署到生产环境
```

---

## ⚙️ Turborepo + Vercel 配置说明

### 环境变量传递机制

Vercel 注入的环境变量必须在 `turbo.json` 中声明才能被构建任务使用：

```json
{
  "tasks": {
    "build": {
      "env": [
        "MONGODB_URI",
        "GITHUB_ID",
        "GITHUB_TOKEN",
        "NEXT_PUBLIC_*"
      ]
    }
  }
}
```

**工作流程：**
```
Vercel Dashboard 环境变量
  ↓ 注入到构建环境
turbo.json 声明
  ↓ 传递给构建任务
next.config.mjs 验证
  ↓ 构建成功 ✅
```

### 依赖构建顺序

Turborepo 自动处理依赖关系：

1. 构建 `@wonderland/database`
2. 构建 `@wonderland/shared`
3. 构建 `@wonderland/web`

---

## 🔧 常见问题

### Q1: 缺少必需环境变量

**错误：**
```
❌ Missing required environment variables: GITHUB_TOKEN
```

**解决：**
在 Vercel Dashboard 添加缺失的环境变量，确保勾选 Production 环境。

### Q2: Module not found '@wonderland/database'

**原因：** workspace 依赖未构建

**解决：** 检查 `vercel.json` 的 buildCommand 是否包含：
```json
{
  "buildCommand": "yarn workspaces foreach -Apt --include '@wonderland/{database,shared}' run build && yarn build:web"
}
```

### Q3: 环境变量不生效

**检查清单：**
1. 变量是否在 Vercel Dashboard 配置
2. 是否勾选了 Production 环境
3. 变量名是否在 `turbo.json` 的 `env` 数组中

---

## ✅ 验证部署

部署成功后访问：
- **Production:** `https://wonderland-nexus-web.vercel.app`

检查清单：
- [ ] 页面正常加载
- [ ] API 路由工作 (`/api/*`)
- [ ] 数据库连接正常
- [ ] 静态资源加载

---

## 📋 快速参考

**vercel.json 配置：**
```json
{
  "buildCommand": "yarn workspaces foreach -Apt --include '@wonderland/{database,shared}' run build && yarn build:web",
  "installCommand": "yarn install"
}
```

**必需环境变量清单：**
- `MONGODB_URI` - MongoDB 连接
- `MONGODB_PASSWORD` - 数据库密码
- `GITHUB_ID` / `GITHUB_SECRET` - OAuth 认证
- `NEXTAUTH_SECRET` - NextAuth 密钥
- `GITHUB_TOKEN` - GitHub API 访问（博客功能）

**CLI 命令：**
```bash
vercel --prod --yes      # 部署到生产
vercel logs             # 查看日志
vercel env ls           # 查看环境变量
```

**回滚：**
Vercel Dashboard → Deployments → 选择之前版本 → Promote to Production
