import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react'
import { Link } from 'react-router'

import type { Album } from '../types'
import { cn } from '../lib/cn'

const DISC_OFFSETS = [0, 12, -8, 18, -4, 8]
const RIGHT_COLUMN_PHASE = 0.46

interface AlbumWallProps {
  albums: Album[]
}

type TrackSide = 'left' | 'right'

interface AlbumSlot {
  album: Album
  albumIndex: number
  key: string
}

interface ActiveSelection {
  albumId: number
  copyIndex: number
  track: TrackSide
}

function positiveModulo(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor
}

function makeSlots(albums: Album[], offset: number, slotCount: number): AlbumSlot[] {
  return Array.from({ length: slotCount }, (_, slotIndex) => {
    const primaryIndex = slotIndex * 2 + offset
    const albumIndex = primaryIndex < albums.length ? primaryIndex : slotIndex % albums.length
    const album = albums[albumIndex]

    return {
      album,
      albumIndex,
      key: `${album.id}-${albumIndex}-${slotIndex}`,
    }
  })
}
interface FocusRingConfig {
  radius: number
  segmentCount: number
  segmentPercent: number
  className: string
}

const FOCUS_RINGS: FocusRingConfig[] = [
  { radius: 279.29, segmentCount: 2, segmentPercent: 47.75, className: 'album-focus-line-1' },
  { radius: 254.2, segmentCount: 4, segmentPercent: 23.75, className: 'album-focus-line-2' },
  { radius: 231.53, segmentCount: 16, segmentPercent: 5.5625, className: 'album-focus-line-3' },
]

function polarPoint(radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180
  return [300 + radius * Math.cos(radians), 300 + radius * Math.sin(radians)] as const
}

function arcPath(radius: number, startAngle: number, endAngle: number) {
  const [startX, startY] = polarPoint(radius, startAngle)
  const [endX, endY] = polarPoint(radius, endAngle)
  const sweep = endAngle >= startAngle ? 1 : 0

  return `M ${startX} ${startY} A ${radius} ${radius} 0 0 ${sweep} ${endX} ${endY}`
}

function makeRingArcs({ radius, segmentCount, segmentPercent }: FocusRingConfig) {
  const step = 360 / segmentCount
  const halfSegment = segmentPercent * 1.8

  return Array.from({ length: segmentCount }, (_, index) => {
    const center = index * step
    return [
      arcPath(radius, center, center + halfSegment),
      arcPath(radius, center, center - halfSegment),
    ]
  }).flat()
}
function AlbumFocusRings({ active }: { active: boolean }) {
  if (!active) return null

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 600 600"
      className="album-focus-rings pointer-events-none absolute inset-[2%] z-30 h-[96%] w-[96%] overflow-visible"
    >
      <g className="album-focus-spin">
        {FOCUS_RINGS.map((ring) => (
          <g key={ring.radius} className="album-focus-ring">
            {makeRingArcs(ring).map((path, index) => (
              <path
                key={`${ring.radius}-${index}`}
                className={`album-focus-line album-focus-segment ${ring.className}`}
                d={path}
                pathLength="100"
              />
            ))}
          </g>
        ))}
      </g>
    </svg>
  )
}
function AlbumDisc({
  album,
  albumIndex,
  copyIndex,
  active,
  onActivate,
}: {
  album: Album
  albumIndex: number
  copyIndex: number
  active: boolean
  onActivate: (albumId: number) => void
}) {
  const offset = DISC_OFFSETS[albumIndex % DISC_OFFSETS.length]
  const dimension = 'var(--album-size)'
  const discRef = useRef<HTMLAnchorElement>(null)
  const rotationStateRef = useRef({ rotateX: 0, rotateY: 0, raf: 0 })
  const hoverReadyRef = useRef(false)
  const activateTimerRef = useRef<number | null>(null)
  const resetTimerRef = useRef<number | null>(null)

  const clearActivateTimer = () => {
    if (activateTimerRef.current === null) return
    window.clearTimeout(activateTimerRef.current)
    activateTimerRef.current = null
  }

  const clearResetTimer = () => {
    if (resetTimerRef.current === null) return
    window.clearTimeout(resetTimerRef.current)
    resetTimerRef.current = null
  }

  useEffect(() => {
    return () => {
      if (rotationStateRef.current.raf) cancelAnimationFrame(rotationStateRef.current.raf)
      clearActivateTimer()
      clearResetTimer()
    }
  }, [])

  const handleDiscPointerEnter = () => {
    hoverReadyRef.current = false
    clearResetTimer()
    clearActivateTimer()
    activateTimerRef.current = window.setTimeout(() => {
      activateTimerRef.current = null
      hoverReadyRef.current = true
      onActivate(album.id)
    }, 180)
  }

  const handleDiscPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    clearResetTimer()
    if (!hoverReadyRef.current) return

    const rect = event.currentTarget.getBoundingClientRect()
    const state = rotationStateRef.current

    state.rotateX = -((event.clientY - rect.top) / rect.height - 0.5) * 44
    state.rotateY = ((event.clientX - rect.left) / rect.width - 0.5) * 52

    if (state.raf) return

    state.raf = requestAnimationFrame(() => {
      const disc = discRef.current
      state.raf = 0
      if (!disc) return

      disc.style.setProperty('--disc-rotate-x', `${state.rotateX}deg`)
      disc.style.setProperty('--disc-rotate-y', `${state.rotateY}deg`)
    })
  }

  const resetDiscRotation = () => {
    const state = rotationStateRef.current
    const disc = discRef.current
    if (state.raf) {
      cancelAnimationFrame(state.raf)
      state.raf = 0
    }
    if (!disc) return

    disc.style.setProperty('--disc-rotate-x', '0deg')
    disc.style.setProperty('--disc-rotate-y', '0deg')
  }

  const handleDiscPointerLeave = () => {
    hoverReadyRef.current = false
    clearActivateTimer()
    clearResetTimer()
    resetTimerRef.current = window.setTimeout(() => {
      resetTimerRef.current = null
      resetDiscRotation()
    }, 300)
  }

  return (
    <div className="flex h-[var(--album-size)] shrink-0 -rotate-45 items-center justify-center">
      <div
        className="album-disc-scene relative"
        style={{ width: dimension, height: dimension, transform: `translateX(${offset}px)` }}
        onPointerEnter={handleDiscPointerEnter}
        onPointerMove={handleDiscPointerMove}
        onPointerLeave={handleDiscPointerLeave}
        onPointerCancel={handleDiscPointerLeave}
      >
        <Link
          ref={discRef}
          to={`/albums/${album.id}`}
          tabIndex={copyIndex === 0 ? 0 : -1}
          aria-current={active ? 'true' : undefined}
          aria-label={`${album.name}，${album.photosCount ?? 0} 张相片`}
          onBlur={resetDiscRotation}
          onFocus={() => onActivate(album.id)}
          style={{ width: '100%', height: '100%' }}
          className={cn(
            'album-disc pointer-events-auto group relative block overflow-hidden rounded-full border transition-[transform,filter,border-color,box-shadow] duration-200 ease-out',
            active ? 'album-disc-active z-20' : '',
          )}
        >
          <div className="album-disc-well absolute inset-[16%] overflow-hidden rounded-full border bg-surface-soft">
            {album.coverUrl ? (
              <img
                src={album.coverUrl}
                alt=""
                loading="lazy"
                draggable={false}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="relative h-full w-full overflow-hidden bg-[#151515]">
                <span className="absolute inset-0 bg-[repeating-linear-gradient(135deg,#181818_0,#181818_13px,#d9ff00_14px,#d9ff00_16px)] opacity-80" />
                <span className="absolute inset-0 flex items-center justify-center text-[clamp(1.5rem,4vw,3.5rem)] font-black uppercase tracking-[-0.08em] text-text-primary">
                  {String(albumIndex + 1).padStart(2, '0')}
                </span>
              </div>
            )}
          </div>

          <span className="pointer-events-none absolute inset-[8%] rounded-full border border-[#767676]/25" />
          <span className="pointer-events-none absolute inset-[16%] rounded-full bg-gradient-to-t from-black/18 via-transparent to-white/20" />
          <span className="pointer-events-none absolute bottom-[15%] left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-[0.35em] text-white/80">
            {String(albumIndex + 1).padStart(2, '0')}
          </span>
          <AlbumFocusRings active={active} />
        </Link>
      </div>
    </div>
  )
}

/** 双列无限相册墙：滚轮 / 触摸拖动移动，hover 同步当前相册信息。 */
export default function AlbumWall({ albums }: AlbumWallProps) {
  const [activeSelection, setActiveSelection] = useState<ActiveSelection>({ albumId: albums[0]?.id ?? 0, copyIndex: 0, track: 'left' })
  const [repeatCount, setRepeatCount] = useState(3)

  const containerRef = useRef<HTMLDivElement>(null)
  const cycleMeasureRef = useRef<HTMLDivElement>(null)
  const leftTrackRef = useRef<HTMLDivElement>(null)
  const rightTrackRef = useRef<HTMLDivElement>(null)
  const currentOffsetRef = useRef(0)
  const targetOffsetRef = useRef(0)
  const cycleHeightRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const dragRef = useRef<{ pointerId: number; y: number; moved: boolean } | null>(null)
  const suppressClickRef = useRef(false)

  const activeIndex = Math.max(0, albums.findIndex((album) => album.id === activeSelection.albumId))
  const activeAlbum = albums[activeIndex] ?? albums[0]
  const slotCount = Math.ceil(albums.length / 2)
  const leftSlots = useMemo(() => makeSlots(albums, 0, slotCount), [albums, slotCount])
  const rightSlots = useMemo(() => makeSlots(albums, 1, slotCount), [albums, slotCount])

  const paint = useCallback(() => {
    const cycleHeight = cycleHeightRef.current
    if (cycleHeight <= 0) return

    const leftOffset = positiveModulo(currentOffsetRef.current, cycleHeight)
    const rightOffset = positiveModulo(cycleHeight * RIGHT_COLUMN_PHASE - currentOffsetRef.current, cycleHeight)

    if (leftTrackRef.current) leftTrackRef.current.style.transform = `translate3d(0, ${-leftOffset}px, 0)`
    if (rightTrackRef.current) rightTrackRef.current.style.transform = `translate3d(0, ${-rightOffset}px, 0)`
  }, [])

  const animateRef = useRef<() => void>(() => undefined)

  useEffect(() => {
    animateRef.current = () => {
      const difference = targetOffsetRef.current - currentOffsetRef.current

      if (Math.abs(difference) < 0.1) {
        currentOffsetRef.current = targetOffsetRef.current
        paint()
        rafRef.current = null
        return
      }

      currentOffsetRef.current += difference * 0.14
      paint()
      rafRef.current = requestAnimationFrame(animateRef.current)
    }
  }, [paint])

  const startAnimation = useCallback(() => {
    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(animateRef.current)
  }, [])

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  useEffect(() => {
    setActiveSelection((current) => (albums.some((album) => album.id === current.albumId) ? current : { albumId: albums[0]?.id ?? 0, copyIndex: 0, track: 'left' }))
  }, [albums])

  useEffect(() => {
    const container = containerRef.current
    const cycle = cycleMeasureRef.current
    if (!container || !cycle) return

    const updateMeasurements = () => {
      const nextCycleHeight = cycle.offsetHeight
      if (nextCycleHeight <= 0) return

      const previousCycleHeight = cycleHeightRef.current
      if (previousCycleHeight > 0 && previousCycleHeight !== nextCycleHeight) {
        const ratio = nextCycleHeight / previousCycleHeight
        currentOffsetRef.current *= ratio
        targetOffsetRef.current *= ratio
      }

      cycleHeightRef.current = nextCycleHeight
      const requiredCycles = Math.ceil((container.clientHeight * 3 + nextCycleHeight) / nextCycleHeight) + 1
      const nextRepeatCount = Math.min(12, Math.max(3, requiredCycles))
      setRepeatCount((current) => (current === nextRepeatCount ? current : nextRepeatCount))
      paint()
    }

    const observer = new ResizeObserver(updateMeasurements)
    observer.observe(container)
    observer.observe(cycle)
    updateMeasurements()

    return () => observer.disconnect()
  }, [albums, paint])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? container.clientHeight : 1
      targetOffsetRef.current += event.deltaY * unit * 0.9
      startAnimation()
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [startAnimation])

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') return
    dragRef.current = { pointerId: event.pointerId, y: event.clientY, moved: false }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    const distance = drag.y - event.clientY
    if (Math.abs(distance) > 3) {
      drag.moved = true
      suppressClickRef.current = true
      drag.y = event.clientY
      targetOffsetRef.current += distance
      startAnimation()
    }
  }

  const finishPointerDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    dragRef.current = null
    window.setTimeout(() => {
      suppressClickRef.current = false
    }, 250)
  }

  const handleClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return
    event.preventDefault()
    event.stopPropagation()
    suppressClickRef.current = false
  }
  const renderCycle = (slots: AlbumSlot[], copyIndex: number, track: TrackSide) => (
    <div key={copyIndex} className="flex flex-col gap-[var(--album-gap)] pb-[var(--album-gap)]" aria-hidden={copyIndex > 0 || undefined}>
      {slots.map((slot) => (
        <AlbumDisc
          key={slot.key}
          album={slot.album}
          albumIndex={slot.albumIndex}
          copyIndex={copyIndex}
          active={
            slot.album.id === activeSelection.albumId &&
            copyIndex === activeSelection.copyIndex &&
            track === activeSelection.track
          }
          onActivate={() => setActiveSelection((current) => (current.albumId === slot.album.id && current.copyIndex === copyIndex && current.track === track ? current : { albumId: slot.album.id, copyIndex, track }))}
        />
      ))}
    </div>
  )
  return (
    <section
      ref={containerRef}
      aria-label="相册墙"
      className="album-wall relative left-1/2 -my-8 h-[calc(100dvh-8rem)] min-h-[560px] w-screen -translate-x-1/2 touch-none select-none overflow-hidden md:h-[calc(100dvh-5rem)]"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointerDrag}
      onPointerCancel={finishPointerDrag}
      onClickCapture={handleClickCapture}
    >

      <div className="absolute inset-0">
        <div className="pointer-events-none absolute top-1/2 h-[320vh] w-[var(--album-size)] -translate-x-1/2 -translate-y-1/2 rotate-45" style={{ left: 'calc(50% - 212.132px)' }}>
          <div ref={leftTrackRef} className="absolute inset-x-0 top-0 flex flex-col will-change-transform">
            {Array.from({ length: repeatCount }, (_, copyIndex) => renderCycle(leftSlots, copyIndex, 'left'))}
          </div>
        </div>
        <div className="pointer-events-none absolute top-1/2 h-[320vh] w-[var(--album-size)] -translate-x-1/2 -translate-y-1/2 rotate-45" style={{ left: 'calc(50% + 212.132px)' }}>
          <div ref={rightTrackRef} className="absolute inset-x-0 top-0 flex flex-col will-change-transform">
            {Array.from({ length: repeatCount }, (_, copyIndex) => renderCycle(rightSlots, copyIndex, 'right'))}
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="pointer-events-none invisible absolute left-0 top-0">
        <div ref={cycleMeasureRef}>{renderCycle(leftSlots, -1, 'left')}</div>
      </div>

      <div className="album-info-panel pointer-events-none absolute left-4 top-5 z-30 md:left-7 md:top-7">
        <div className="album-info-copy flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] font-black uppercase tracking-[0.42em] text-accent">
          <span className="inline-block h-3 w-3 rounded-full border-2 border-accent" />
          <span>Work</span>
          <span className="text-text-secondary">
            {String(activeIndex + 1).padStart(2, '0')} / {String(albums.length).padStart(2, '0')}
          </span>
        </div>
        <h1 key={activeAlbum.id} className="album-info-copy album-copy-enter mt-3 max-w-full text-2xl font-black uppercase leading-[0.92] tracking-[-0.035em] text-text-primary md:text-5xl">
          {activeAlbum.name}
        </h1>
        <p key={`${activeAlbum.id}-count`} className="album-copy-enter mt-3 flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-text-primary md:text-sm">
          <span className="h-px w-7 bg-accent" />
          <span className="text-accent">{String(activeAlbum.photosCount ?? 0).padStart(2, '0')}</span>
          Photos
        </p>
      </div>

      <div className="album-info-panel pointer-events-none absolute bottom-6 right-4 z-30 flex flex-col items-end text-right md:bottom-9 md:right-7">
        <p className="album-info-copy max-w-full text-[9px] font-black uppercase tracking-[0.34em] text-accent">All Works of 2020 - 2026</p>
        <p key={`${activeAlbum.id}-description`} className="album-info-copy album-copy-enter mt-3 max-w-full text-base font-extrabold uppercase leading-tight tracking-[-0.025em] text-text-primary md:text-2xl xl:text-3xl">
          {activeAlbum.description || 'No description archived.'}
        </p>
        <div className="mt-5 flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.32em] text-text-secondary md:text-[10px]">
          <span>Scroll to explore</span>
          <span className="text-accent" aria-hidden="true">↓</span>
        </div>
      </div>
    </section>
  )
}












































