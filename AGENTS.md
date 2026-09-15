# AGENTS.md

## 项目概览 (Project Overview)

pnpm + Vite + React + TypeScript + Tailwind CSS v4 的 monorepo：

- `apps/blog`：博客站点 (blog site)
- `apps/admin`：管理后台 (admin dashboard)
- `packages/shared`：共享类型 / 工具 / UI 组件 (shared types / utils / UI components)

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