---
version: alpha
name: Zenless-Design-System
description: "A confident, dark-mode-first design system inspired by the retro-futuristic world of 'Zenless Zone Zero'. It balances a deep, immersive monochrome base with vibrant, neon accent colors and nostalgic 80s Japanese pop-culture elements. The system feels both premium and playful, using bold typography, mechanical UI components, and high-energy color accents to create a unique, story-driven brand experience."

colors:
  # Core Brand
  primary: "#1a1a1a" # Deep base for backgrounds and surfaces
  on-primary: "#f5f5f5" # High-contrast text on primary surfaces
  ink: "#1a1a1a"
  canvas: "#0d0d0d" # The primary background
  inverse-canvas: "#f5f5f5"
  inverse-ink: "#f5f5f5"

  # Surfaces & Accents
  surface-soft: "#242424" # Slightly lighter than canvas for cards/tiles
  hairline: "#333333" # Subtle borders
  hairline-soft: "#2a2a2a"

  # Signature Accent Colors (霓虹 / Neon & Retro)
  accent-cyan: "#00e5ff"
  accent-magenta: "#ff3d8b"
  accent-yellow: "#ffe600"
  accent-orange: "#ff7a00"
  accent-neon-green: "#39ff14"
  accent-lime: "#bfff00"
  accent-purple: "#b388ff"

  # Thematic Color Blocks (for story sections)
  block-cyan: "#0a2a3a"
  block-magenta: "#2e1a2a"
  block-yellow: "#2e2a0a"
  block-orange: "#2e1a0a"
  block-lime: "#1a2a0a"
  block-purple: "#1a0a2e"

  # Semantic
  semantic-success: "#39ff14"
  semantic-warning: "#ffe600"
  overlay-scrim: "#000000" # Used at ~70% opacity

typography:
  font-family-sans: "Inter, system-ui, -apple-system, sans-serif"
  font-family-mono: "JetBrains Mono, monospace"
  font-family-display: "Space Grotesk, Inter, sans-serif" # For headlines

  display-xl:
    fontSize: 86px
    fontWeight: 700
    lineHeight: 1.00
    letterSpacing: -0.02em
  display-lg:
    fontSize: 64px
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: -0.02em
  display-md:
    fontSize: 48px
    fontWeight: 600
    lineHeight: 1.10
    letterSpacing: -0.02em
  headline:
    fontSize: 32px
    fontWeight: 600
    lineHeight: 1.20
    letterSpacing: -0.01em
  subhead:
    fontSize: 24px
    fontWeight: 500
    lineHeight: 1.30
    letterSpacing: -0.01em
  body-lg:
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: 0
  body:
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.60
    letterSpacing: 0
  body-sm:
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: 0
  button:
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.00
    letterSpacing: 0.02em
  caption:
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.20
    letterSpacing: 0.05em
  overline:
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1.10
    letterSpacing: 0.10em

spacing:
  hair: 1px
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  xxxl: 64px
  section: 96px

rounded:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  pill: 50px
  full: 9999px

components:
  # --- Buttons ---
  button-primary:
    backgroundColor: "{colors.accent-cyan}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: 12px 32px
    hover: "brightness(0.9)"
  button-secondary:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: 12px 32px
    hover: "brightness(1.2)"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: 10px 24px
    hover: "backgroundColor: rgba(255,255,255,0.1)"
  button-icon:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
    size: 44px
    hover: "backgroundColor: rgba(255,255,255,0.2)"

  # --- Navigation ---
  top-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-sm}"
    height: 68px
    border: "0 0 1px 0 solid {colors.hairline}"

  # --- Thematic Color Blocks (Sections) ---
  color-block-cyan:
    backgroundColor: "{colors.block-cyan}"
    textColor: "{colors.accent-cyan}"
    typography: "{typography.headline}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xxxl}"
  color-block-magenta:
    backgroundColor: "{colors.block-magenta}"
    textColor: "{colors.accent-magenta}"
    typography: "{typography.headline}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xxxl}"
  color-block-yellow:
    backgroundColor: "{colors.block-yellow}"
    textColor: "{colors.accent-yellow}"
    typography: "{typography.headline}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xxxl}"

  # --- Cards & Containers ---
  card-default:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
    border: "1px solid {colors.hairline}"
  card-feature:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "{spacing.xl}"
    border: "1px solid {colors.hairline}"
  template-card:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"

  # --- Inputs ---
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
    border: "1px solid {colors.hairline}"
    focus: "border: 1px solid {colors.accent-cyan}"

  # --- Footer ---
  footer:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.on-primary}"
    typography: "{typography.caption}"
    padding: "{spacing.section} {spacing.xl}"
    border: "1px solid {colors.hairline}"

---

## 设计理念 (Design Philosophy)

本项目设计语言深受《绝区零》启发，核心是**「复古未来主义 (Retro-Futurism)」**与**「潮流多元化 (Trendy & Diverse)」**的碰撞。

- **核心概念**：将**日式80年代昭和复古风情**与**充满活力的现代潮流元素**相结合。它是对一个既熟悉又陌生的架空世界的视觉重构，旨在营造独特的“新艾利都”式沉浸感。
- **情感基调**：**怀旧、时髦、反叛、充满活力与韵律感**。设计应唤起用户对老电影、街头文化、复古电子产品的温暖记忆，同时又不失现代设计的简洁与锐利。
- **差异化**：拒绝市场的同质化设计，巧妙地将“新拟态”的视觉特点融入复古元素中，既简洁，又保留了轻材质所带来的拟物感。

## 色彩体系 (Color System)

色彩系统由两个层次构成：作为基底的**深色(单色)系统**和用于强调与叙事的**霓虹/复古色彩系统**。

### 核心色 (Core)

- **`{colors.canvas}` (#0d0d0d)**: 主要背景色，提供沉浸感。
- **`{colors.primary}` (#1a1a1a)**: 深色基底，用于卡片、导航等组件的背景。
- **`{colors.on-primary}` (#f5f5f5)**: 基础文本色，确保高可读性。
- **`{colors.surface-soft}` (#242424)**: 比背景稍亮的表面色，用于卡片、输入框等，以建立层级。

### 强调色 (Accents)

这些色彩源自霓虹灯、街机和波普艺术，用于交互元素、关键信息和装饰。

- **`{colors.accent-cyan}` (#00e5ff)**: **主要行为召唤 (Primary CTA)**。用于主按钮、链接和焦点状态。充满科技与未来感。
- **`{colors.accent-magenta}` (#ff3d8b)**: **次级强调**。用于促销、特殊功能或需要高亮但非主线的元素。
- **`{colors.accent-yellow}` (#ffe600)**: **警告与高亮**。用于需要吸引注意力的标签、徽章或图形元素。
- **`{colors.accent-neon-green}` (#39ff14)**: **成功状态**。用于表示操作成功、已确认或开启状态。
- **`{colors.accent-orange}` (#ff7a00)**: **活力与动感**。常用于战斗、能量或进度相关的视觉元素。

### 主题色块 (Thematic Color Blocks)

用于构建故事性章节的大面积背景色，比强调色更暗、更柔和，以突出前景内容。

- **`{colors.block-cyan}`**: 用于“科技”、“系统”或“未来”相关的章节。
- **`{colors.block-magenta}`**: 用于“反叛”、“潮流”或“都市”相关的章节。
- **`{colors.block-yellow}`**: 用于“活力”、“能量”或“预告”相关的章节。
- **`{colors.block-orange}`**: 用于“战斗”、“行动”或“热点”相关的章节。
- **`{colors.block-lime}`**: 用于“生活”、“日常”或“轻松”相关的章节。
- **`{colors.block-purple}`**: 用于“神秘”、“未知”或“虚空”相关的章节。

## 字体排印 (Typography)

### 字族 (Font Families)

- **`{typography.font-family-display}` - Space Grotesk**: 用于所有标题 (`display-*`, `headline`)。其几何感和未来感完美契合“复古未来主义”风格。
- **`{typography.font-family-sans}` - Inter**: 用于正文 (`body-*`)、按钮和导航。提供极高的可读性和现代感。
- **`{typography.font-family-mono}` - JetBrains Mono**: 用于代码、标签和强调科技感的文本 (`caption`, `overline`)。

### 层级 (Hierarchy)

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-xl}` | 86px | 700 | 1.00 | -0.02em | 英雄区 (Hero) 主标题 |
| `{typography.display-lg}` | 64px | 700 | 1.05 | -0.02em | 章节大标题 |
| `{typography.display-md}` | 48px | 600 | 1.10 | -0.02em | 次级大标题 |
| `{typography.headline}` | 32px | 600 | 1.20 | -0.01em | 卡片或色块标题 |
| `{typography.subhead}` | 24px | 500 | 1.30 | -0.01em | 副标题或引言 |
| `{typography.body-lg}` | 20px | 400 | 1.50 | 0 | 大号正文 |
| `{typography.body}` | 16px | 400 | 1.60 | 0 | **默认正文** |
| `{typography.body-sm}` | 14px | 400 | 1.50 | 0 | 小号正文，用于卡片内 |
| `{typography.button}` | 18px | 600 | 1.00 | 0.02em | **所有按钮** |
| `{typography.caption}` | 12px | 500 | 1.20 | 0.05em | 说明文字、标签 |
| `{typography.overline}` | 11px | 600 | 1.10 | 0.10em | 装饰性分类标签 |

## 间距与布局 (Spacing & Layout)

- **基准单位**: `{spacing.xs}` = 8px。
- **系统间距**: 使用 `{spacing.md}` (16px), `{spacing.lg}` (24px), `{spacing.xl}` (32px), `{spacing.xxl}` (48px) 来构建内外边距。
- **章节间距**: 主要内容区块之间的垂直间距为 `{spacing.section}` (96px)。
- **网格**: 采用12列网格系统。主要内容容器最大宽度为1280px，两侧有 `{spacing.xxl}` 的边距。
- **色块章节**: 如 `color-block-*` 组件，会突破普通容器宽度，采用全宽设计，并使用 `{rounded.xl}` 圆角，内部填充 `{spacing.xxxl}`。

## 组件规范 (Component Specs)

### 按钮 (Buttons)

所有按钮必须使用 `{rounded.pill}` 形状，文字使用 `{typography.button}`。

- **`{components.button-primary}`**: 主按钮。背景为 `{colors.accent-cyan}`，文字为 `{colors.ink}`。用于最重要的行动点。
- **`{components.button-secondary}`**: 次要按钮。背景为 `{colors.surface-soft}`，文字为 `{colors.on-primary}`。用于次要行动点。
- **`{components.button-ghost}`**: 幽灵按钮。透明背景，用于导航栏或轻量级操作。
- **`{components.button-icon}`**: 圆形图标按钮。用于社交链接、轮播控制等。

### 卡片 (Cards)

卡片用于承载信息，在深色背景上建立层级。

- **`{components.card-default}`**: 标准卡片。使用 `{colors.surface-soft}` 背景和 `{colors.hairline}` 边框。
- **`{components.card-feature}`**: 特色卡片。背景为 `{colors.canvas}`，常用于展示产品或功能亮点。
- **`{components.template-card}`**: 模板卡片。用于展示缩略图或模板预览，内边距较小。

### 导航 (Navigation)

- **`{components.top-nav}`**: 顶部导航栏。固定在顶部，背景为 `{colors.canvas}`，底部有细边框。高度 `68px`。左侧为Logo，右侧为导航链接和按钮组。

## 设计原则 (Design Principles)

### 对比 (Contrast)

- **核心**: 整个系统的活力来源于**深色背景**与**霓虹亮色**的强烈对比。文本必须在深色背景上保持高可读性 (使用 `{colors.on-primary}` 和 `{colors.accent-*}`)。
- **色彩对比**: 例如，在 `{colors.block-cyan}` 的背景上，使用 `{colors.accent-cyan}` 作为标题或强调色，营造出色彩主题统一且富有层次的视觉效果。

### 沉浸感 (Immersion)

- 设计应让用户感觉是在浏览一个“世界”的窗口。大面积的深色和充满氛围感的色块，配合高质量的视觉素材（如动态背景、视频），共同构建沉浸式体验。

### 趣味与细节 (Joy & Details)

- **拟物化**: 按钮和交互元素应有细腻的悬停和点击反馈，模拟物理世界的质感（如按压感）。
- **复古元素**: 在不破坏整体现代感的前提下，巧妙加入**CRT扫描线纹理、像素风格图标、美式漫画拟声词**等细节装饰，增强主题氛围。

## 响应式行为 (Responsive Behavior)

- **断点**:
    - **Desktop**: ≥ 1280px (标准体验)
    - **Tablet**: 768px - 1279px (导航折叠，网格从4列变为2列)
    - **Mobile**: < 768px (色块圆角去除，全宽展示。标题尺寸按比例缩小)
- **导航**: 在平板和手机上，导航链接折叠为汉堡菜单，CTA按钮保留在导航栏上。
- **色块章节**: 在移动设备上，去除 `{rounded.xl}` 圆角，使其完全水平延伸，以获得更强烈的“画报”效果。
- **触摸目标**: 所有可交互元素（按钮、链接）的触摸目标高度不低于44px。

## 注意事项 (Do's and Don'ts)

### Do

- 主要行为召唤 (Primary CTA) **必须**使用 `{colors.accent-cyan}` 按钮。
- 使用 `{colors.block-*}` 色块来划分不同的故事章节，每个色块之间用 `{spacing.section}` 的留白隔开。
- 正文内容**必须**使用 `{typography.body}` (16px/Inter/400)。
- 所有文本按钮**必须**使用 `{rounded.pill}` 形状。
- 充分利用 `{colors.accent-*}` 色彩来引导用户的视线和操作路径。

### Don't

- **不要**在深色背景上使用低对比度的灰色文本。使用 `{colors.on-primary}` 或 `{colors.accent-*}`。
- **不要**将按钮设计为方形或使用其他圆角值。统一使用 `{rounded.pill}`。
- **不要**在同一视口中过度使用多种强调色。选择一种主色和一种辅色。
- **不要**在色块章节上添加投影。色彩本身就是其主要的视觉深度手段。

## 迭代指南 (Iteration Guide)

1.  **引用组件**: 在讨论设计实现时，请使用 `{components.*}` 或 `{colors.*}` 等 Token 名称，以确保一致性。
2.  **从内容开始**: 为新章节选择主题色块 (`{components.color-block-*}`) 是第一步，它决定了该章节的情感基调。
3.  **保持简洁**: 如果某个界面元素在视觉上过于复杂，优先考虑减少颜色或简化排版，而不是增加更多装饰。
4.  **检查对比度**: 确保所有文本与其背景色有足够的对比度 (至少 WCAG AA 级)。