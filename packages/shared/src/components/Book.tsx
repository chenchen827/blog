import { useState } from 'react'
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react'

import { cn } from '../utils'

export interface BookPage {
  /** 封面（正面）内容：封面图、标题封面等任意节点 */
  front: ReactNode
  /** 翻开后露出的背面内容；缺省时使用内置的档案封底 */
  back?: ReactNode
  /** 正面容器附加类名 */
  frontClassName?: string
  /** 背面容器附加类名 */
  backClassName?: string
  /** React key，缺省时按顺序使用 */
  id?: string | number
  /** 无障碍标签，例如 “第 1 页” */
  label?: string
}

export interface BookProps {
  /** 书页列表，数组最后一项视为最上层封面（展开时保持在前） */
  pages: BookPage[]
  /** 单页宽度（px），默认 240 */
  width?: number
  /** 单页高度（px），默认 330 */
  height?: number
  /** 展开后整体向右的位移（px），默认 width * 0.55（让展开后的书大致保持在原视觉中心） */
  shift?: number
  /** 展开方式：hover = 悬停展开（点击可固定）；click = 仅点击展开 */
  trigger?: 'hover' | 'click'
  /** 是否可交互：false 时永不展开（hover / focus / click / 键盘均 no-op），仅渲染闭合封面，供轮播侧边预览等场景使用 */
  interactive?: boolean
  /** 受控展开状态 */
  open?: boolean
  /** 初始展开状态（非受控时生效） */
  defaultOpen?: boolean
  /** 展开状态变化回调 */
  onOpenChange?: (open: boolean) => void
  /** 组件下方是否显示 “悬停 / 点击翻页” 小提示 */
  showHint?: boolean
  /** 无障碍说明 */
  ariaLabel?: string
  /** 根节点附加类名 */
  className?: string
  /** 统一附加到每一页正面的类名 */
  pageClassName?: string
}

/* ------------------------------------------------------------------ */
/* 3D 几何常量（单位 deg），参考 CSS 书本翻页演示：                    */
/* 闭合时书页以 2° 步进轻微散开；展开后内页平铺到左侧（展示背面），    */
/* 最上层封面保留在右侧；点击某一页或页边可“翻到”那一页。             */
/* 单页书（pages.length === 1）：整页按内页翻开，展示背面后原位合上。  */
/* ------------------------------------------------------------------ */
const CLOSED_BASE = 15 // 封面闭合倾角
const CLOSED_STEP = 2 // 层与层之间的角度差
const COVER_OPEN = 22 // 展开时封面的倾角（略微抬起）
const TURN_ANGLE = 172 // 内页展开后平躺左侧的角度（展示背面）
const TOP_DEPTH = 6 // 当前页向前凸出的深度（px，越小与封面越齐）
const BACK_DEPTH = 8 // 其余页向后退的深度（px）
const FLIP_DURATION = 620 // 翻页时长（ms）
const COVER_DURATION = 520 // 封面动作时长（ms）
const STAGGER = 70 // 逐页错峰时长（ms）
const EASE = 'cubic-bezier(0.5, 0.04, 0.26, 0.94)'

const INTERACTIVE_SELECTOR = 'a, button, input, select, textarea, label, [role="button"], [data-book-interactive]'

/** 命中交互元素时，不拦截其默认行为 / 不触发展开切换 */
function isInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(INTERACTIVE_SELECTOR) !== null
}

/** 闭合时第 index 页的倾角：越下层角度越大，封面最平 */
function closedAngle(index: number, count: number): number {
  return -(CLOSED_BASE + CLOSED_STEP * (count - 1 - index))
}

/** 从点击事件中解析被点击的书页索引（无则返回 null） */
function pageIndexFromEvent(event: MouseEvent<HTMLDivElement>): number | null {
  const target = event.target as HTMLElement
  const el = target.closest?.('[data-book-page]')
  if (!el) return null
  const value = Number(el.getAttribute('data-book-page'))
  return Number.isFinite(value) ? value : null
}

/** 内置档案封底：翻页后展示统一的 “REVERSE / PAGE 0X” 扉页样式 */
function DefaultBack({ index, total }: { index: number; total: number }) {
  const no = String(index).padStart(2, '0')
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden p-5">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="relative flex items-start justify-between text-[10px] font-black uppercase tracking-[0.4em] text-text-secondary">
        <span>Reverse · {no}</span>
        <span aria-hidden="true" className="text-accent">
          ∅
        </span>
      </div>
      <div className="relative flex flex-1 items-center justify-center">
        <span
          aria-hidden="true"
          className="select-none text-[6rem] font-black leading-none text-transparent [-webkit-text-stroke:1.5px_#2c2c2c]"
        >
          {no}
        </span>
      </div>
      <div className="relative flex items-center justify-between text-[10px] font-black uppercase tracking-[0.35em] text-text-secondary">
        <span>{String(total).padStart(2, '0')} Pages</span>
        <span aria-hidden="true" className="h-2 w-2 bg-accent" />
      </div>
    </div>
  )
}

/**
 * Book —— 3D 书本翻页组件（公共组件）
 *
 * - 悬停 / 聚焦时书本展开，当前页平铺到左侧展示背面，封面在右侧；
 * - 点击某一页（或露出的页边）可把那一页“翻到”最前（再点封面合上）；
 * - 每一页都是双面卡片：正面为封面/内容，背面为信息与管理操作；
 * - 单页书（pages 仅 1 项）：展开 = 整页翻开显示背面，点击页面合上；
 * - interactive=false：作为静态闭合封面预览，不响应任何展开交互。
 */
export function Book({
  pages,
  width = 240,
  height = 330,
  shift,
  trigger = 'hover',
  interactive = true,
  open,
  defaultOpen = false,
  onOpenChange,
  showHint = false,
  ariaLabel,
  className,
  pageClassName,
}: BookProps) {
  const count = pages.length
  const single = count === 1
  const controlled = open !== undefined
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [pinned, setPinned] = useState(defaultOpen)
  const [current, setCurrent] = useState(0)

  const hoverEnabled = trigger !== 'click'
  const expanded = interactive && (controlled ? open : hovered || focused || pinned)
  // 单页书翻开后整页原位展示背面，无需像多页书那样为右侧封面让位
  const resolvedShift = shift ?? (single ? width : Math.round(width * 0.55))
  const perspective = Math.max(720, Math.round(width * 4))

  const setOpenState = (next: boolean) => {
    if (controlled) {
      onOpenChange?.(next)
      return
    }
    setPinned(next)
    if (!next) setCurrent(0)
  }

  const toggle = () => setOpenState(!expanded)

  /** 鼠标点击不把焦点交给书本，确保点击翻页 / 收起时互不干扰 */
  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (!interactive) return
    if (event.button !== 0) return
    if (isInteractiveTarget(event.target)) return
    event.preventDefault()
  }

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!interactive) return
    if (isInteractiveTarget(event.target)) return
    const pageIndex = pageIndexFromEvent(event)

    // 展开状态：点击某一页 / 页边 → 翻到该页（否则翻到下一页）；点击封面 → 合上
    if (expanded) {
      if (pageIndex === count - 1) {
        setOpenState(false)
        return
      }
      if (!controlled) {
        const innerCount = count - 1
        if (innerCount <= 0) {
          setOpenState(false)
          return
        }
        if (pageIndex !== null && pageIndex !== current) setCurrent(pageIndex)
        else setCurrent((prev) => (prev + 1) % innerCount)
      }
      return
    }

    // 闭合状态：点击展开并固定
    setOpenState(true)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return
    if (event.key === 'Escape') {
      event.currentTarget.blur()
      setOpenState(false)
      return
    }
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    toggle()
  }

  return (
    <div className={cn('inline-flex flex-col items-center', className)}>
      <div
        role="group"
        aria-label={ariaLabel ?? `书本组件，共 ${count} 页。悬停或聚焦可展开，点击书页可翻页。`}
        tabIndex={interactive ? 0 : -1}
        className="rounded-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent/80"
        style={{ perspective }}
        onMouseEnter={() => hoverEnabled && interactive && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => hoverEnabled && interactive && setFocused(true)}
        onBlur={() => setFocused(false)}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {/* 位移容器：展开时整体右移，为左侧平铺的书页让出空间 */}
        <div
          className="relative cursor-pointer select-none"
          style={{
            width,
            height,
            transformStyle: 'preserve-3d',
            transform: expanded ? `translateX(${resolvedShift}px)` : 'translateX(0px)',
            transition: `transform ${COVER_DURATION}ms ${EASE}`,
          }}
        >
          {/* 书脊厚度：右侧露出几道书页边缘，闭合时增强“书本”体积感 */}
          {[0, 1, 2].map((layer) => (
            <div
              key={layer}
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute inset-0 border border-hairline transition-all duration-700',
                layer === 0 ? 'bg-surface' : 'bg-primary',
                expanded && 'translate-x-0 opacity-0',
              )}
              style={{
                transform: expanded ? 'translateX(0px)' : `translateX(${6 + layer * 4}px)`,
              }}
            />
          ))}

          {/* 3D 书页层 */}
          {pages.map((page, index) => {
            const isCover = index === count - 1
            const isCurrent = expanded && index === current
            // 单页书展开时整页当作内页翻到左侧，露出背面（操作 / 信息页）
            const angle = !expanded ? closedAngle(index, count) : single ? -TURN_ANGLE : isCover ? -COVER_OPEN : -TURN_ANGLE
            const fanOffset =
              expanded && (single || !isCover)
                ? isCurrent || single
                  ? ` translateZ(${-TOP_DEPTH}px)`
                  : ` translateZ(${BACK_DEPTH}px)`
                : ''
            const duration = isCover ? COVER_DURATION : FLIP_DURATION
            const delay = expanded
              ? isCover
                ? 0
                : index * STAGGER
              : isCover
                ? 0
                : (count - 2 - index) * STAGGER

            return (
              <div
                key={page.id ?? index}
                data-book-page={index}
                aria-label={page.label}
                className="absolute inset-0"
                style={{
                  transform: `rotateY(${angle}deg)${fanOffset}`,
                  transformOrigin: 'left center',
                  transformStyle: 'preserve-3d',
                  transition: `transform ${duration}ms ${EASE} ${delay}ms`,
                }}
              >
                {/* 正面（封面） */}
                <div
                  className={cn(
                    'absolute inset-0 overflow-hidden border border-hairline bg-surface text-text-primary',
                    pageClassName,
                    page.frontClassName,
                  )}
                  style={{ backfaceVisibility: 'hidden', pointerEvents: 'none' }}
                >
                  {page.front}
                </div>
                {/* 背面（翻开后可见） */}
                <div
                  className={cn('absolute inset-0 overflow-hidden border border-hairline bg-primary text-text-primary', page.backClassName)}
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  {page.back ?? <DefaultBack index={index + 1} total={count} />}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {showHint ? (
        <div className="mt-9 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.45em] text-text-secondary">
          <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          <span>Hover to Open · Click a Page to Turn</span>
        </div>
      ) : null}
    </div>
  )
}

export default Book

