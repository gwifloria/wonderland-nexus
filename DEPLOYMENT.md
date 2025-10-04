# Vercel 部署指南

## 部署前端 (apps/web) 到 Vercel

### 方式一：使用 vercel.json（推荐）

项目根目录已配置 `vercel.json`，直接部署即可。

### 方式二：手动配置

#### 1. Vercel 项目设置

**General Settings:**
- Framework Preset: `Next.js`
- Root Directory: `apps/web`
- Node.js Version: `20.x`

**Build & Development Settings:**

| 设置项 | 值 |
|--------|-----|
| **Install Command** | `corepack enable && corepack prepare yarn@4.2.2 --activate && yarn install` |
| **Build Command** | `cd ../.. && corepack enable && corepack prepare yarn@4.2.2 --activate && yarn install && yarn turbo run build --filter=@wonderland/web` |
| **Output Directory** | `.next` (默认) |
| **Development Command** | `yarn dev` |

> **重要**: 必须使用 corepack 启用 Yarn 4，因为 Vercel 默认使用 Yarn 1，不支持 `workspace:*` 协议。

#### 2. 环境变量配置

在 Vercel Dashboard → Settings → Environment Variables 添加：

**必需的环境变量:**
```
MONGODB_URI=mongodb+srv://...
```

**可选的环境变量:**
```
# NextAuth
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key

# GitHub (用于博客和图库同步)
GITHUB_TOKEN=ghp_...
GITHUB_OWNER=your-username

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Sentry (如果需要)
SENTRY_DSN=...

# Mapbox (如果需要地图功能)
NEXT_PUBLIC_MAPBOX_TOKEN=...
```

#### 3. 部署步骤

**通过 Git 自动部署:**
```bash
# 1. 推送到 GitHub
git push origin main

# 2. 在 Vercel 中连接仓库
# - 导入项目
# - 选择 wonderland-nexus 仓库
# - Root Directory: apps/web
# - 按照上面的配置填写
```

**通过 CLI 部署:**
```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 首次部署
cd /Users/guihuajiu/wonderland/wonderland-nexus
vercel

# 4. 生产环境部署
vercel --prod
```

## Turborepo + Vercel 关键配置说明

### 为什么 Build Command 需要 cd ../..?

```bash
cd ../.. && yarn turbo run build --filter=@wonderland/web
```

**原因:**
- Vercel 会 cd 到 `apps/web` 目录
- 但 `turbo` 命令需要在 **monorepo 根目录** 运行
- `cd ../..` 回到根目录
- `--filter=@wonderland/web` 只构建前端

### 依赖构建顺序

Turborepo 会自动处理：
```
1. 构建 packages/database
2. 构建 packages/shared
3. 构建 apps/web (依赖上面两个)
```

### 输出目录

- `apps/web/.next` - Next.js 构建输出
- Vercel 会自动识别并部署

## 常见问题

### Q1: Module not found: Can't resolve '@wonderland/database'

**原因:** packages 没有被构建

**解决:** 确保 Build Command 使用 `turbo run build`，它会自动构建依赖的 packages

### Q2: yarn install 很慢

**优化:** 在 Vercel 中启用 "Dependency Caching"

### Q3: 构建超时

**原因:** Monorepo 首次构建可能较慢

**解决:**
- 确保 `turbo.json` 中配置了缓存
- Vercel 会缓存后续构建

### Q4: 环境变量不生效

**检查:**
1. 环境变量是否在 Vercel Dashboard 中配置
2. 变量名是否正确（区分大小写）
3. Production/Preview/Development 环境是否都配置了

## 性能优化建议

### 1. 启用 Vercel Remote Caching（可选）

在根目录 `.turbo/config.json`:
```json
{
  "teamId": "your-team-id",
  "apiUrl": "https://vercel.com/api"
}
```

### 2. 配置 .vercelignore

创建 `.vercelignore`:
```
# 不需要上传到 Vercel 的文件
apps/api
packages/mail-sync
.turbo
node_modules
*.log
.env*.local
```

### 3. 优化构建时间

在 `vercel.json` 中:
```json
{
  "github": {
    "silent": true
  },
  "buildCommand": "yarn turbo run build --filter=@wonderland/web --no-cache",
  "installCommand": "yarn install --frozen-lockfile"
}
```

## 验证部署

部署成功后访问：
- Preview URL: `https://wonderland-nexus-xxx.vercel.app`
- Production URL: `https://your-domain.com`

检查：
1. ✅ 页面正常加载
2. ✅ API 路由工作 (/api/*)
3. ✅ 数据库连接正常
4. ✅ 静态资源加载

## 监控和日志

- Vercel Dashboard → Deployments → 查看构建日志
- Vercel Dashboard → Logs → 查看运行时日志
- 如启用 Sentry，查看错误报告

## 回滚

如需回滚到之前的版本：
1. Vercel Dashboard → Deployments
2. 找到之前的成功部署
3. 点击 "Promote to Production"

---

## 快速参考

**一键部署配置:**
```
Root Directory: apps/web
Install Command: yarn install
Build Command: cd ../.. && yarn turbo run build --filter=@wonderland/web
Output Directory: .next
```

**环境变量模板:** 见 `.env.example`
