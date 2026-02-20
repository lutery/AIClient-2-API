# AIClient-2-API Copilot Instructions

## 项目定位

- 这是一个 Node.js ESM 代理服务：把 Gemini/Claude/OpenAI/Ollama 等不同协议统一为可互转接口。
- 主入口是双进程模型：`src/core/master.js` 管 worker 生命周期，`src/services/api-server.js` 处理实际流量。

## 启动与调试工作流

- 常用启动命令：`npm start`（master+worker）、`npm run start:standalone`（仅 worker）、`npm run start:dev`。
- 管理面 API 由 master 暴露在 `3100`：`GET /master/status`、`POST /master/restart`（见 `src/core/master.js`）。
- 业务服务默认在 `3000`，健康检查 `GET /health`，Web UI 在 `/login.html`（见 `src/handlers/request-handler.js`）。
- 测试建议优先用 `npm test -- tests/<file>.test.js` 做定向验证；`package.json` 中的 `test:unit`/`test:integration` 依赖缺失的 `run-tests.js`，不要默认使用。

## 请求处理主链路（必须理解）

- `createRequestHandler` 是流量总入口（`src/handlers/request-handler.js`）：
  1) 静态文件/UI API → 2) 插件路由 → 3) provider 覆盖（header/path）→ 4) 认证插件 → 5) 中间件插件 → 6) Ollama 特殊路由 → 7) `handleAPIRequests`。
- `MODEL_PROVIDER` 可被 `model-provider` 请求头或 URL 首段覆盖，这对排查“为什么落到某 provider”很关键。
- API 分发在 `src/services/api-manager.js`：`/v1/chat/completions`、`/v1/responses`、`/v1/messages`、`/v1beta/models/...`。

## 协议转换与扩展点

- 转换器采用工厂+策略：`src/converters/ConverterFactory.js` + `src/converters/strategies/*`。
- 应用启动时通过 `src/converters/register-converters.js` 自动注册；新增协议时必须在这里注册。
- 兼容层在 `src/convert/convert.js`，保留旧函数签名并转发到新转换器，改动时优先保持向后兼容。

## Provider Pool 机制（高优先级约定）

- 池管理在 `src/providers/provider-pool-manager.js`：包含健康检查、LRU/轮询、错误退化、跨 provider fallback、模型 fallback。
- 令牌刷新不是简单定时器：有“缓冲队列 + 去重 + 全局/单 provider 并发限制”，改逻辑时不要破坏 `refreshBufferQueues` 和 `refreshConcurrency`。
- 初始化流程在 `src/services/service-manager.js`：会按 `DEFAULT_MODEL_PROVIDERS` 预热节点，并尝试自动关联 `configs/` 下凭证到 `provider_pools.json`。

## 插件系统约定

- 插件核心在 `src/core/plugin-manager.js`，类型分为 `auth` 和 `middleware`，执行顺序按 `_priority`，内置插件最后执行。
- `auth` 插件需返回 `{ authorized: true|false|null, handled }` 语义；`null` 表示放行到下一个认证插件。
- 默认禁用插件在 `DEFAULT_DISABLED_PLUGINS`（`api-potluck`、`ai-monitor`），不要假设它们总是启用。

## 配置与代码风格

- 所有配置集中在 `configs/`，运行时入口是 `initializeConfig`（`src/core/config-manager.js`）。
- 本仓库是纯 ESM（`"type": "module"`）：新增导入必须带 `.js` 扩展名。
- 日志统一走 `src/utils/logger.js`，请求链路依赖 requestId 上下文，不要直接 `console.log`。
- 新增 provider 的最小路径：实现 `ApiServiceAdapter`（`src/providers/adapter.js`）→ 更新模型映射（`src/providers/provider-models.js`）→ 必要时补 converter 并注册。
