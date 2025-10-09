# Wonderland Nexus - Turborepo Monorepo

统一的 wonderland 项目 monorepo，包含前端和后端应用以及共享包。

## 项目结构

```
wonderland-nexus/
├── apps/
│   ├── web/           # Next.js 前端应用 (原 floria-next-wonderland)
│   └── api/           # Express 后端应用 (原 eco-node)
├── packages/
│   ├── database/      # 共享 MongoDB models (Thread, MailMessage, Comment)
│   ├── mail-sync/     # 邮件同步服务 (Microsoft Graph API)
│   └── shared/        # 共享工具和类型定义
```

## 快速开始

### 安装依赖

```bash
yarn install
```

### 开发模式

```bash
# 启动所有应用
yarn dev

# 仅启动前端
yarn workspace @wonderland/web dev

# 仅启动后端
yarn workspace @wonderland/api dev
```

### 构建

```bash
# 构建所有项目
yarn build

# 仅构建前端
yarn workspace @wonderland/web build
```

### 邮件同步

```bash
# 同步所有邮件
yarn sync-mail

# 同步标记的邮件
yarn sync-mail:flagged

# 同步指定联系人的邮件
TARGET_EMAIL=example@email.com yarn sync-mail
```

## 包说明

### @wonderland/web

Next.js 15 前端应用，包含：
- 博客系统
- 邮件线程查看
- 评论功能
- 图库管理
- 性能监控

**技术栈**: Next.js 15, React 19, TypeScript, Tailwind CSS, Ant Design

### @wonderland/api

Express 后端应用，提供：
- API 路由
- 邮件同步脚本

**技术栈**: Express.js, Node.js

### @wonderland/database

**共享的** MongoDB 数据库层（前后端共享），包含：
- `Thread` - 邮件线程 model
- `MailMessage` - 邮件消息 model
- `Comment` - 评论 model
- `dbConnect` - MongoDB 连接管理

**前端专有** models（位于 `apps/web/src/app/api/models/`）：
- `BlogPost` - 博客文章
- `GalleryImage` - 图库图片
- `Lab` - 实验室/项目
- `WhisperEntry` - 碎碎念

### @wonderland/mail-sync

邮件同步服务，包含：
- Microsoft Graph API 客户端
- 邮件同步核心逻辑
- Cloudinary 图片上传
- 邮件内容处理

### @wonderland/shared

共享工具和类型，包含：
- HTML 清理和验证
- 速率限制
- TypeScript 类型定义

## 环境变量

创建 `.env.local` 文件在项目根目录：

```env
# MongoDB
MONGODB_URI=your_mongodb_uri

# Microsoft Graph API
MS_CLIENT_ID=your_client_id
MS_AUTHORITY=https://login.microsoftonline.com/consumers
TARGET_EMAIL=your_target_email

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional
FILTER_FLAGGED=false
```

## 开发工具

```bash
# 类型检查
yarn typecheck

# 代码检查
yarn lint

# 清理构建产物
yarn clean
```

## 迁移说明

本项目整合了以下原始项目：
- `floria-next-wonderland` → `apps/web`
- `eco-node` → `apps/api`

主要改进：
1. 统一的 MongoDB models，避免重复定义
2. 共享的邮件同步逻辑
3. 统一的工具函数和类型定义
4. 简化的依赖管理
5. 统一的开发和构建流程

## 部署

### Vercel 部署（推荐）

查看完整的部署指南：[DEPLOYMENT.md](./DEPLOYMENT.md)

**快速部署步骤：**
1. 设置环境变量（MONGODB_URI, GITHUB_ID, GITHUB_SECRET, NEXTAUTH_SECRET）
2. 运行 `vercel --prod --yes`

## 技术栈

- **包管理器**: Yarn 4.10.3 (Workspaces)
- **构建工具**: Turborepo
- **前端**: Next.js 15, React 19, TypeScript
- **后端**: Express.js, Node.js
- **数据库**: MongoDB, Mongoose
- **其他**: Microsoft Graph API, Cloudinary
