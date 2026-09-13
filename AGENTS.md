# AGENTS.md

## 项目概览 (Project Overview)

pnpm + Vite + React + TypeScript + Tailwind CSS v4 的 monorepo：

- `apps/blog`：博客站点 (blog site)
- `apps/admin`：管理后台 (admin dashboard)
- `packages/shared`：共享类型 / 工具 / UI 组件 (shared types / utils / UI components)

## 部署规则（强制要求）

- **默认不部署。** 除非用户在当前任务中明确要求“部署”“发布”“上线”“部署到服务器”“重新部署”等操作，否则只能进行本地代码修改、构建和验证。
- 修复、重构、优化、改样式、打包、生成 `dist`、提交代码或执行 `git push`，都**不代表**用户授权部署。
- 未收到部署指令时，禁止对生产服务器执行 `scp`、上传静态文件、修改 Nginx、重载服务或重启 PM2；完成后应明确说明“未部署”。
- 收到明确部署指令后，也必须先完成本地构建验证、创建服务器备份、执行 Nginx 配置检查，再上线并验证公网结果。
- 不要在仓库中记录服务器密码、宝塔面板密码、私钥、Token 或其他敏感凭据。

## 部署手册

### 生产环境映射

- 服务器：`8.137.97.238`
- 当前开发机 SSH 别名：`ssh cc`
- 博客：[https://www.chenchen.fun/blog/](https://www.chenchen.fun/blog/)
- 管理后台：[https://www.chenchen.fun/admin/](https://www.chenchen.fun/admin/)
- API：[https://api.chenchen.fun/](https://api.chenchen.fun/)
- 静态根目录：`/www/wwwroot/blog-frontend-sites`
- 博客产物目录：`/www/wwwroot/blog-frontend-sites/blog`
- 后台产物目录：`/www/wwwroot/blog-frontend-sites/admin`
- 后端目录：`/www/wwwroot/chenchen-api`
- 宝塔站点类型：`www.chenchen.fun` 对应 `HTML项目`

重要：静态后台必须部署在 `www.chenchen.fun/admin/`。不要给 `api.chenchen.fun/admin/` 配置静态页面，否则会拦截后端 `/admin/...` API 路由。

### 生产环境变量

以下文件已被 `.gitignore` 忽略，不提交仓库：

`apps/blog/.env.production`

```dotenv
VITE_API_BASE_URL=https://api.chenchen.fun
VITE_ADMIN_URL=https://www.chenchen.fun/admin/
```

`apps/admin/.env.production`

```dotenv
VITE_API_BASE_URL=https://api.chenchen.fun
VITE_BLOG_BASE_URL=https://www.chenchen.fun/blog
```

### 本地构建

博客使用 `/blog/` base，后台使用 `/admin/` base，不要使用默认根路径构建。

```powershell
pnpm --filter @repo/blog typecheck
pnpm --filter @repo/blog exec vite build --base=/blog/

pnpm --filter @repo/admin typecheck
pnpm --filter @repo/admin exec vite build --base=/admin/
```

### 部署前备份

```powershell
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
ssh cc "tar -czf /root/bt-backups/blog-frontend-$stamp.tgz -C /www/wwwroot/blog-frontend-sites blog admin"
```

只部署单个应用时，可只备份对应目录。

### 上传与重载

```powershell
scp -r apps/blog/dist/* cc:/www/wwwroot/blog-frontend-sites/blog/
scp -r apps/admin/dist/* cc:/www/wwwroot/blog-frontend-sites/admin/

ssh cc "find /www/wwwroot/blog-frontend-sites -path '*/.user.ini' -prune -o -exec chmod a+rX {} +; nginx -t && nginx -s reload"
```

注意：站点根目录的 `.user.ini` 被宝塔设置为不可修改，权限修复必须跳过它，否则 `chmod -R` 会失败。

### 上线验证

```powershell
curl.exe -sS -o NUL -w "blog=%{http_code}`n" https://www.chenchen.fun/blog/
curl.exe -sS -o NUL -w "admin=%{http_code}`n" https://www.chenchen.fun/admin/
curl.exe -sS -o NUL -w "api=%{http_code}`n" https://api.chenchen.fun/
```

同时检查最新 HTML 引用的 JS/CSS 是否返回 `200`，并确认浏览器控制台无错误。

### 回滚

备份包包含 `blog` 与 `admin` 两个目录，可直接解压回静态根目录：

```powershell
ssh cc "tar -xzf /root/bt-backups/<backup-file>.tgz -C /www/wwwroot/blog-frontend-sites && nginx -t && nginx -s reload"
```

### Nginx 与证书

- 主站点配置：`/www/server/panel/vhost/nginx/html_www.chenchen.fun.conf`
- HTTP 跳转配置：`/www/server/panel/vhost/nginx/chenchen-frontend-http.conf`
- API 配置：`/www/server/panel/vhost/nginx/api.chenchen.fun.conf`
- HTTPS 证书：`/www/server/panel/vhost/cert/www.chenchen.fun/fullchain.pem`
- HTTPS 私钥：`/www/server/panel/vhost/cert/www.chenchen.fun/privkey.pem`
- 证书由 Let's Encrypt 签发；服务器直连 ACME 服务可能超时，证书到期前必须提前检查并续签，不要默认自动续签一定成功。
## UI 风格规范（强制要求）

**整个项目的所有 UI 与视觉实现——包括 `apps/blog`、`apps/admin` 以及 `packages/shared` 中的全部前端代码——必须统一遵循仓库根目录下的 [`design.md`](./design.md) 设计规范。**

- `design.md` 是本项目 UI 风格的**唯一事实来源 (single source of truth)**。任何涉及外观的改动（配色、字体排版、间距、圆角、组件样式、动效、响应式行为等）都必须以它为准，不得另立风格或自行引入不一致的设计。
- 在编写、修改或评审任何 UI 之前，**先阅读根目录 `design.md`**，并优先使用其中的 Token 名称（如 `{colors.*}`、`{typography.*}`、`{spacing.*}`、`{rounded.*}`、`{components.*}`）进行沟通与实现，以保证全局一致性。

### 必须遵守的核心规则

- **深色优先 (dark-mode-first)**：默认使用 `{colors.canvas}` (#0d0d0d) 作为背景、`{colors.primary}` (#1a1a1a) 作为表面色，文字使用 `{colors.on-primary}` (#f5f5f5)。
- **主 CTA** 必须使用 `{colors.accent-cyan}` 背景 + `{colors.ink}` 文字；强调色用于引导视线与操作路径。
- **按钮**统一使用 `{rounded.pill}`（胶囊）形状，文字使用 `{typography.button}`；不要使用方形按钮或其他圆角值。
- **正文字体**使用 `{typography.body}`（16px / Inter / 400），标题使用 display/headline 层级；字体栈遵循 `{typography.*}`。
- **对比度**：深色背景上禁止使用低对比度的灰色文本；所有文本与其背景须满足至少 WCAG AA 级对比度。
- **克制用色**：同一视口内不要过度使用多种强调色，选择一种主色 + 一种辅色；色块章节 (`{components.color-block-*}`) 不添加投影。
- **间距与布局**：遵循 `{spacing.*}` 体系，章节间使用 `{spacing.section}` (96px)；网格采用 12 列，主要内容容器最大宽度 1280px。
- **响应式**：遵循 `design.md` 的断点——Desktop ≥ 1280px、Tablet 768–1279px、Mobile < 768px；所有可交互元素（按钮、链接）的触摸目标高度不低于 44px。
- **卡片 / 输入框 / 导航 / 页脚**等组件的背景、边框、圆角与内边距，一律按 `design.md` 的 `{components.*}` 与 `{rounded.*}` 定义实现。

> 当某个 UI 细节存在疑问或与 `design.md` 冲突时，一律以根目录 `design.md` 为准；若规范未覆盖，先在实现前指出并遵循其整体设计理念，避免引入不一致的视觉。