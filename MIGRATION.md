# 迁移记录

## 从独立项目到 Turborepo Monorepo

### 原始项目

- `floria-next-wonderland` - Next.js 前端
- `eco-node` - Express.js 后端

### 迁移后的结构

```
wonderland-nexus/
├── apps/
│   ├── web/              # @wonderland/web (Next.js 15)
│   └── api/              # @wonderland/api (Express)
└── packages/
    ├── database/         # @wonderland/database
    ├── mail-sync/        # @wonderland/mail-sync
    └── shared/           # @wonderland/shared
```

## 主要改进

### 1. 统一的数据层

**共享 Models** (在 `packages/database`):
- `Thread` - 邮件线程
- `MailMessage` - 邮件消息
- `Comment` - 评论
- `dbConnect` - 数据库连接

**前端专有 Models** (在 `apps/web/src/app/api/models`):
- `BlogPost` - 博客
- `GalleryImage` - 图库
- `Lab` - 实验室
- `WhisperEntry` - 碎碎念

### 2. 提取的共享逻辑

**@wonderland/mail-sync**:
- Microsoft Graph API 客户端
- 邮件同步核心逻辑
- Cloudinary 图片上传

**@wonderland/shared**:
- HTML 清理工具 (`sanitizeHtml`, `extractPlainText`)
- 速率限制
- TypeScript 类型定义

### 3. 依赖关系

```
apps/web  ──┬──> packages/database
            └──> packages/shared

apps/api  ──┬──> packages/database
            └──> packages/mail-sync

packages/mail-sync ──> packages/database
```

## 迁移步骤

1. ✅ 创建 Turborepo 基础结构
2. ✅ 创建 `packages/database` 并统一 mail 相关 models
3. ✅ 创建 `packages/mail-sync` 提取同步逻辑
4. ✅ 创建 `packages/shared` 提取工具函数
5. ✅ 迁移前端到 `apps/web`
6. ✅ 迁移后端到 `apps/api`
7. ✅ 更新所有代码引用
8. ✅ 恢复前端专有 models

## 破坏性变更

### 引用路径变更

**之前**:
```ts
import dbConnect from "@/app/api/lib/mongoose";
import Thread from "@/app/api/models/Thread";
import { sanitizeHtml } from "@/app/api/lib/htmlUtils";
```

**之后**:
```ts
import { dbConnect, Thread, MailMessage, Comment } from "@wonderland/database";
import { sanitizeHtml, extractPlainText } from "@wonderland/shared";
```

### Package.json 变更

**apps/web**:
```json
{
  "name": "@wonderland/web",
  "dependencies": {
    "@wonderland/database": "workspace:*",
    "@wonderland/shared": "workspace:*"
  }
}
```

**apps/api**:
```json
{
  "name": "@wonderland/api",
  "dependencies": {
    "@wonderland/database": "workspace:*",
    "@wonderland/mail-sync": "workspace:*"
  }
}
```

## 开发工作流

### 首次设置

```bash
yarn install
yarn build  # 构建所有 packages
```

### 日常开发

```bash
# 启动所有服务（packages 会以 watch 模式运行）
yarn dev

# 或分别启动
yarn workspace @wonderland/web dev
yarn workspace @wonderland/api dev
```

### 邮件同步

```bash
yarn sync-mail                    # 同步所有
yarn sync-mail:flagged           # 仅同步标记的
```

## 注意事项

1. **首次构建必须**: packages 必须先构建才能被 apps 引用
2. **Watch 模式**: 开发时 packages 会自动重新编译
3. **依赖顺序**: Turborepo 会自动处理构建顺序
4. **类型安全**: 所有 packages 都是 TypeScript 编写

## 遗留问题

无 - 迁移已完成并验证通过 ✅

## 性能优化

- Turborepo 缓存加速构建
- Workspace 共享依赖减少重复安装
- 增量构建仅编译变更的包

## 未来扩展

考虑添加的 packages:
- `@wonderland/ui` - 共享 UI 组件
- `@wonderland/config` - 共享配置（ESLint, TypeScript 等）
- `@wonderland/utils` - 通用工具函数
