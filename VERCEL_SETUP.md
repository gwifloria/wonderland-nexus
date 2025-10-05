# Vercel 部署快速指南

## 🚨 解决 "workspace:* not found" 错误

你遇到的错误是因为 Vercel 默认使用 Yarn 1，不支持 Yarn 4 的 `workspace:*` 协议。

### ✅ 解决方案（3 步）

#### 1. 在 Vercel 添加环境变量

进入 **Vercel Dashboard → Settings → Environment Variables**，添加：

```
ENABLE_EXPERIMENTAL_COREPACK=1
```

**重要**: 这个环境变量必须添加，否则 Vercel 无法使用 Yarn 4。

#### 2. 配置 Vercel 项目设置

在 Vercel Dashboard → Settings → General:

```
Root Directory: . (留空或填 "."，使用 monorepo 根目录)
Framework Preset: Next.js
Node.js Version: 20.x
```

在 Build & Development Settings:

```
Install Command: yarn install
Build Command: yarn turbo run build --filter=@wonderland/web
Output Directory: apps/web/.next
```

#### 3. 添加其他必需的环境变量

```
MONGODB_URI=mongodb+srv://your-connection-string
```

可选环境变量（按需添加）:
```
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key
GITHUB_TOKEN=ghp_...
GITHUB_OWNER=your-username
```

### 🎯 完成

配置完成后，点击 **Redeploy** 重新部署即可。

---

## 工作原理

1. `ENABLE_EXPERIMENTAL_COREPACK=1` 启用 Vercel 的 Corepack 支持
2. Vercel 读取根目录 `package.json` 中的 `"packageManager": "yarn@4.2.2"`
3. 自动使用 Yarn 4 进行安装和构建
4. Yarn 4 识别 `workspace:*` 协议并正确处理 monorepo 依赖

## 检查清单

- [ ] 添加 `ENABLE_EXPERIMENTAL_COREPACK=1` 环境变量
- [ ] 添加 `MONGODB_URI` 环境变量
- [ ] Root Directory 设置为 `apps/web`
- [ ] Build Command 设置为 `cd ../.. && yarn turbo run build --filter=@wonderland/web`
- [ ] 重新部署

完整文档见 `DEPLOYMENT.md`
