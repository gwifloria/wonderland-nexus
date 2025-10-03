# 性能监控和错误追踪系统

本项目集成了comprehensive的性能监控和错误追踪系统，帮助监控应用性能和用户体验。

## 🎯 功能特性

### 错误追踪
- **Sentry 集成**: 自动捕获和报告错误
- **Error Boundary**: React错误边界保护
- **统一日志系统**: 结构化日志记录
- **错误分类**: 自动过滤和分类错误

### 性能监控
- **Core Web Vitals**: LCP、FID、CLS、INP、FCP、TTFB
- **自定义性能指标**: 组件渲染时间、API响应时间
- **实时监控**: 内存使用、网络状态
- **用户体验追踪**: 设备类型、连接质量

### 数据收集
- **多端点API**: 分类收集不同类型的监控数据
- **MongoDB存储**: 结构化存储性能和日志数据
- **自动清理**: TTL索引自动清理历史数据
- **聚合分析**: 统计分析和趋势报告

## 🚀 使用方法

### 基础设置

1. **环境变量配置**:
```bash
# 复制环境变量模板
cp .env.example .env.local

# 配置 Sentry DSN
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

2. **在组件中使用监控**:
```typescript
import { logger } from "@/monitoring/logger";
import { performanceMonitor } from "@/monitoring/performance";

// 记录日志
logger.info("User action performed", { action: "button_click" });

// 性能测量
const result = await performanceMonitor.measureUserTiming("api_call", async () => {
  return await fetch("/api/data");
});

// 自定义事件
performanceMonitor.markCustomEvent("feature_used", { feature: "gallery" });
```

### 监控面板

访问 `/admin/monitoring` 查看性能监控面板（需要管理员权限）。

面板包含：
- **Web Vitals 总览**: Core Web Vitals 指标和趋势
- **性能指标**: 自定义性能指标统计
- **错误日志**: 最近的错误记录
- **设备分析**: 不同设备类型的性能表现

## 📊 API 端点

### 监控数据收集
- `POST /api/monitoring/logs` - 收集日志数据
- `POST /api/monitoring/performance` - 收集性能指标
- `POST /api/monitoring/web-vitals` - 收集 Web Vitals 数据

### 数据查询
- `GET /api/monitoring/logs?level=error&limit=100` - 查询日志
- `GET /api/monitoring/performance?timeframe=24h` - 查询性能指标
- `GET /api/monitoring/web-vitals?name=LCP&timeframe=7d` - 查询 Web Vitals

## 🔧 配置选项

### Sentry 配置
- **采样率**: 生产环境 10%，开发环境 100%
- **性能监控**: 启用事务追踪
- **Session Replay**: 错误回放功能
- **自定义过滤**: 过滤无关错误

### 数据保留
- **日志数据**: 30天自动清理
- **性能数据**: 90天自动清理
- **Web Vitals**: 90天自动清理

### 监控级别
- **开发环境**: 详细日志和调试信息
- **生产环境**: 错误和性能数据，降低采样率

## 🛠️ 开发指南

### 添加自定义监控

1. **组件级监控**:
```typescript
import { withMonitoring } from "@/components/MonitoringProvider";

const MyComponent = () => {
  // 组件内容
};

export default withMonitoring(MyComponent, "MyComponent");
```

2. **API性能监控**:
```typescript
import { logApiCall } from "@/monitoring/logger";

const response = await fetch("/api/endpoint");
logApiCall("/api/endpoint", "GET", response.status, responseTime);
```

3. **用户行为追踪**:
```typescript
import { logUserAction } from "@/monitoring/logger";

const handleClick = () => {
  logUserAction("button_click", { buttonId: "submit" });
};
```

## 📈 性能优化建议

系统会自动分析性能数据并提供优化建议：

- **LCP > 2.5s**: 优化图片加载和服务器响应时间
- **FID > 100ms**: 减少JavaScript执行时间
- **CLS > 0.1**: 避免布局偏移
- **内存使用 > 80%**: 检查内存泄漏

## 🔒 隐私和安全

- **数据脱敏**: 自动过滤敏感信息
- **用户隐私**: 不收集个人身份信息
- **数据加密**: 传输和存储数据加密
- **访问控制**: 监控面板仅管理员可访问

## 🐛 故障排除

### 常见问题

1. **Sentry 错误不显示**:
   - 检查 DSN 配置
   - 确认网络连接
   - 查看浏览器控制台错误

2. **性能数据缺失**:
   - 检查 MongoDB 连接
   - 确认 API 端点可访问
   - 查看服务器日志

3. **监控面板空白**:
   - 确认管理员权限
   - 检查时间范围设置
   - 确认数据库中有数据

### 调试模式
开发环境下，所有监控事件会输出到浏览器控制台，方便调试。

## 📞 支持

如需技术支持或有问题反馈，请：
1. 查看错误日志和监控数据
2. 检查相关文档和配置
3. 在项目中创建 Issue