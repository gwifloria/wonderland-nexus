# Vercel 部署指南

## 🚀 快速开始

### 前置条件

确保你已经：

1. ✅ 推送代码到 GitHub
2. ✅ 有 Vercel 账号并连接到 GitHub
3. ✅ 项目已包含 `vercel.json` 配置文件

### 一键部署（推荐）

项目已配置 `vercel.json`，按以下步骤快速部署：

#### 1. 设置必需的环境变量

在 **Vercel Dashboard → Settings → Environment Variables** 添加：

**必需：**

```bash
# 数据库连接
MONGODB_URI=mongodb+srv://your-connection-string

# NextAuth 认证（必需）
GITHUB_ID=your_github_oauth_app_client_id
GITHUB_SECRET=your_github_oauth_app_client_secret
NEXTAUTH_SECRET=your_nextauth_secret  # 使用 openssl rand -base64 32 生成
```

**可选：**

```bash
# Cloudinary 图片上传
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Sentry 错误监控
SENTRY_DSN=your_sentry_dsn

# Mapbox 地图功能
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

#### 2. 通过 CLI 部署

```bash
# 安装 Vercel CLI（如果未安装）
npm i -g vercel

# 登录
vercel login

# 部署到生产环境
vercel --prod --yes
```

#### 3. 或通过 Git 自动部署

推送到 main 分支会自动触发部署：

```bash
git push origin main
```

---

## 手动配置（如果需要）

#### 1. Vercel 项目设置

**General Settings:**

- Framework Preset: `Next.js`
- Root Directory: `.` (monorepo 根目录)
- Node.js Version: `20.x`

**Build & Development Settings:**

| 设置项                  | 值                                                                                                                                  |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Root Directory**      | `.` (留空，使用 monorepo 根目录)                                                                                                    |
| **Install Command**     | `yarn install`                                                                                                                      |
| **Build Command**       | `yarn workspaces foreach -Apt --include '@wonderland/{database,shared}' run build && yarn build:web` |
| **Output Directory**    | `apps/web/.next`                                                                                                                    |
| **Development Command** | `yarn dev`                                                                                                                          |

> **重要提示**:
>
> - Root Directory 保持为 `.`（monorepo 根目录）
> - Build Command 会先构建依赖的 workspace 包，再构建 web 应用
> - 项目已捆绑 Yarn 4 二进制文件（`.yarn/releases/`），无需额外配置

#### 2. 部署步骤

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
cd ../.. && yarn build:web
```

**原因:**

- Vercel 会 cd 到 `apps/web` 目录
- 但 `yarn build:web` (turbo) 命令需要在 **monorepo 根目录** 运行
- `cd ../..` 回到根目录
- `build:web` script 使用 `--filter=@wonderland/web` 只构建前端

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

### Q1: Missing required environment variables

**错误信息:**

```
❌ Missing required environment variables for authentication:
   - GITHUB_ID
   - GITHUB_SECRET
   - NEXTAUTH_SECRET
```

**原因:** NextAuth 认证需要这些环境变量

**解决:**
在 Vercel Dashboard → Settings → Environment Variables 添加：

```bash
GITHUB_ID=your_github_oauth_app_client_id
GITHUB_SECRET=your_github_oauth_app_client_secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)  # 生成随机密钥
```

### Q2: Module not found: Can't resolve '@wonderland/database'

**原因:** packages 没有被构建

**解决:** 确保 Build Command 使用 `yarn build`，Turborepo 会自动构建依赖的 packages

### Q3: yarn install 很慢

**优化:** 在 Vercel 中启用 "Dependency Caching"

### Q4: 构建超时

**原因:** Monorepo 首次构建可能较慢

**解决:**

- 确保 `turbo.json` 中配置了缓存
- Vercel 会缓存后续构建

### Q5: 构建失败 - TypeScript 编译没有输出

**错误信息:**

```
WARNING  no output files found for task @wonderland/database#build
```

**原因:** TypeScript 的 `.tsbuildinfo` 缓存文件损坏或过期

**解决:**

```bash
# 清理所有 tsbuildinfo 缓存
find . -name "*.tsbuildinfo" -type f -delete
# 重新构建
yarn turbo run build --force
```

### Q6: 环境变量不生效

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
  "buildCommand": "yarn workspaces foreach -Apt --include '@wonderland/{database,shared}' run build && yarn build:web --no-cache",
  "installCommand": "yarn install"
}
```

Note: `build:web` is defined in root package.json as `"build:web": "turbo run build --filter=@wonderland/web"`

## 验证部署

部署成功后访问：

- Preview URL: `https://wonderland-nexus-xxx.vercel.app`
- Production URL: `https://your-domain.com`

检查：

1. ✅ 页面正常加载
2. ✅ API 路由工作 (/api/\*)
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

**Vercel 项目配置（使用 vercel.json）:**

```json
{
  "buildCommand": "yarn workspaces foreach -Apt --include '@wonderland/{database,shared}' run build && yarn build:web",
  "installCommand": "yarn install",
  "outputDirectory": "apps/web/.next"
}
```

**必需环境变量:**

```bash
MONGODB_URI=mongodb+srv://...           # MongoDB 连接
GITHUB_ID=your_client_id                # GitHub OAuth
GITHUB_SECRET=your_client_secret        # GitHub OAuth Secret
NEXTAUTH_SECRET=your_generated_secret   # NextAuth 密钥
```

**CLI 部署命令:**

```bash
vercel --prod --yes
```
