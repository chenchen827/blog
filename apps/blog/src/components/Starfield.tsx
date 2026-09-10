import { useEffect, useMemo, useRef } from 'react'

import starfieldUrl from '../assets/starfield.png'

/** 星屑可配置项 */
export interface StarfieldProps {
  /** 星屑数量（默认 150） */
  count?: number
  /** 闪烁角频率范围 rad/s，越小越慢（默认 [0.7, 1.8]） */
  speedRange?: readonly [number, number]
  /** 星屑基准亮度范围 0~1（默认 [0.4, 1]） */
  alphaRange?: readonly [number, number]
  /** 星屑尺寸范围 px（默认 [0.7, 2.2]） */
  sizeRange?: readonly [number, number]
  /** 谷值时星屑/光斑缩到的最小比例，越小“消失”越彻底（默认 0.12） */
  minScale?: number
  /** 谷值时透明度下限比例（默认 0.04） */
  minAlpha?: number
  /** 外层光斑颜色（默认 '#cfe0ff'） */
  glowColor?: string
  /** 内芯星屑颜色（默认 '#ffffff'） */
  dotColor?: string
}

interface StarSpec {
  x: number
  y: number
  size: number
  baseAlpha: number
  speed: number
  phase: number
  vertCount: number
  verts: number[]
  rotation: number
}

interface ResolvedConfig {
  count: number
  speedRange: [number, number]
  alphaRange: [number, number]
  sizeRange: [number, number]
  minScale: number
  minAlpha: number
  glowColor: string
  dotColor: string
}

const DEFAULTS: ResolvedConfig = {
  count: 150,
  speedRange: [0.7, 1.8],
  alphaRange: [0.4, 1],
  sizeRange: [0.7, 2.2],
  minScale: 0.12,
  minAlpha: 0.04,
  glowColor: '#cfe0ff',
  dotColor: '#ffffff',
}

function resolveConfig(props: StarfieldProps): ResolvedConfig {
  return {
    count: props.count ?? DEFAULTS.count,
    speedRange: props.speedRange ? [props.speedRange[0], props.speedRange[1]] : DEFAULTS.speedRange,
    alphaRange: props.alphaRange ? [props.alphaRange[0], props.alphaRange[1]] : DEFAULTS.alphaRange,
    sizeRange: props.sizeRange ? [props.sizeRange[0], props.sizeRange[1]] : DEFAULTS.sizeRange,
    minScale: props.minScale ?? DEFAULTS.minScale,
    minAlpha: props.minAlpha ?? DEFAULTS.minAlpha,
    glowColor: props.glowColor ?? DEFAULTS.glowColor,
    dotColor: props.dotColor ?? DEFAULTS.dotColor,
  }
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

/** 生成一簇不规则星屑（随机多边形 + 旋转） */
function generateStars(config: ResolvedConfig): StarSpec[] {
  const stars: StarSpec[] = []
  for (let i = 0; i < config.count; i++) {
    const vertCount = 4 + Math.floor(Math.random() * 4)
    const verts = Array.from({ length: vertCount }, () => 0.35 + Math.random() * 0.85)
    stars.push({
      x: Math.random(),
      y: Math.random(),
      size: rand(config.sizeRange[0], config.sizeRange[1]) + (Math.random() < 0.06 ? 1.0 : 0),
      baseAlpha: rand(config.alphaRange[0], config.alphaRange[1]),
      speed: rand(config.speedRange[0], config.speedRange[1]),
      phase: Math.random() * Math.PI * 2,
      vertCount,
      verts,
      rotation: Math.random() * Math.PI * 2,
    })
  }
  return stars
}

/** 以 cover 方式绘制图片到画布 */
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, width: number, height: number) {
  const scale = Math.max(width / img.width, height / img.height)
  const dw = img.width * scale
  const dh = img.height * scale
  const dx = (width - dw) / 2
  const dy = (height - dh) / 2
  ctx.drawImage(img, dx, dy, dw, dh)
}

/** 追踪一条不规则星屑路径 */
function traceSpec(ctx: CanvasRenderingContext2D, star: StarSpec, scale: number) {
  const n = star.vertCount
  const r = star.size * scale
  ctx.beginPath()
  for (let i = 0; i <= n; i++) {
    const idx = i % n
    const ang = (i / n) * Math.PI * 2 + star.rotation
    const radius = star.verts[idx] * r
    const px = Math.cos(ang) * radius
    const py = Math.sin(ang) * radius
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
}

/** 绘制一颗星屑：外层光斑 + 内芯碎片 */
function drawSpec(
  ctx: CanvasRenderingContext2D,
  star: StarSpec,
  width: number,
  height: number,
  config: ResolvedConfig,
  scale: number,
  alpha: number,
) {
  const x = star.x * width
  const y = star.y * height
  ctx.save()
  ctx.translate(x, y)

  ctx.globalAlpha = alpha * 0.28
  ctx.fillStyle = config.glowColor
  traceSpec(ctx, star, scale * 2.6)
  ctx.fill()

  ctx.globalAlpha = alpha
  ctx.fillStyle = config.dotColor
  traceSpec(ctx, star, scale)
  ctx.fill()

  ctx.restore()
}

/**
 * 全屏固定星空背景（Canvas）：星云底图 + 不规则星屑「缩小 + 透明」循环呼吸。
 */
export default function Starfield(props: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const config = useMemo<ResolvedConfig>(() => resolveConfig(props), [props])
  const configKey = JSON.stringify(config)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = window.innerWidth
    let height = window.innerHeight
    let stars = generateStars(config)
    let img: HTMLImageElement | null = null
    let raf = 0

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = '#050505'
      ctx.fillRect(0, 0, width, height)

      if (img) drawCover(ctx, img, width, height)

      for (const star of stars) {
        const wave = 0.5 + 0.5 * Math.sin((time / 1000) * star.speed + star.phase)
        const env = Math.pow(wave, 1.5)
        const scale = config.minScale + (1 - config.minScale) * env
        const alpha = star.baseAlpha * (config.minAlpha + (1 - config.minAlpha) * env)
        drawSpec(ctx, star, width, height, config, scale, alpha)
      }

      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }

    const drawOnce = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = '#050505'
      ctx.fillRect(0, 0, width, height)
      if (img) drawCover(ctx, img, width, height)
      for (const star of stars) {
        drawSpec(ctx, star, width, height, config, 0.7, star.baseAlpha * 0.6)
      }
      ctx.globalAlpha = 1
    }

    resize()

    const image = new Image()
    image.src = starfieldUrl
    image.onload = () => {
      img = image
      if (reducedMotion) {
        drawOnce()
      } else {
        raf = requestAnimationFrame(draw)
      }
    }

    const onResize = () => {
      resize()
      if (reducedMotion) drawOnce()
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configKey])

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0" />
}
