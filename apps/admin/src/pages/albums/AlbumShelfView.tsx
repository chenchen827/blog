import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Button, Popconfirm } from "antd";

import { Book } from "@repo/shared";
import type { BookPage } from "@repo/shared";
import type { Album } from "../../apis/albums";
import "./AlbumShelfView.css";

/* 书页尺寸 */
const BOOK_WIDTH = 300;
const BOOK_HEIGHT = 420;

/* Cover-Flow 舞台几何（单位 px / deg） */
const STAGE_PERSPECTIVE = 1400; // 舞台透视
const SLIDE_STEP_X = 230; // 相邻滑片水平间距
const SLIDE_DEPTH = 190; // 相邻滑片向 Z 轴后退的距离（越靠两侧离屏幕越远）
const SPREAD_SHIFT = 170; // 镜像开合时两页摊开的整体位移，使摊开书居中
const MOVE_DURATION = 520; // 切换动画时长（ms）
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

function padNo(value: number): string {
  return String(value).padStart(2, "0");
}

/** 内页（闭合时被封面压住，翻开后移动到左页背面）*/
function AlbumCover({ album, no }: { album: Album; no: string }) {
  return (
    <div className="album-cover relative flex h-full w-full flex-col justify-between overflow-hidden">
      <div className="album-cover-frame">
        {album.coverUrl ? (
          <img src={album.coverUrl} alt={album.name} />
        ) : (
          <div aria-hidden="true" className="absolute inset-0 bg-linear-to-br from-[#1b1b1b] via-[#101010] to-primary" />
        )}
        <span className="album-cover-tape" aria-hidden="true" />
        <span className="album-cover-corner album-cover-corner-tl" aria-hidden="true" />
        <span className="album-cover-corner album-cover-corner-tr" aria-hidden="true" />
        <span className="album-cover-corner album-cover-corner-bl" aria-hidden="true" />
        <span className="album-cover-corner album-cover-corner-br" aria-hidden="true" />
        <span className="album-cover-meta">Album · {no}</span>
      </div>
    </div>
  );
}

/** 封面页 */
function AlbumContent({ album, no }: { album: Album; no: string }) {
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-linear-to-br from-surface-soft to-[#0c0c0c] p-5">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div className="relative flex items-start justify-between text-[10px] font-black uppercase tracking-[0.4em] text-text-secondary">
        <span>Archive · {no}</span>
        <span aria-hidden="true" className="text-accent">
          ∅
        </span>
      </div>
      <div className="relative">
        <span className="block text-[24px] font-black uppercase leading-none tracking-[-0.02em] text-text-primary">{album.name}</span>
        <span aria-hidden="true" className="mt-4 block h-1 w-10 bg-accent" />
        <span className="mt-3 block text-[9px] font-black uppercase tracking-[0.5em] text-text-secondary">Photo Archive</span>
      </div>
      <div className="h-24 mt-1 text-text-secondary wrap-break-word line-clamp-4">{album.description || "—"}</div>
      <div className="relative flex items-center justify-between text-[9px] font-black uppercase tracking-[0.35em] text-text-secondary">
        <span>{padNo(album.photosCount ?? 0)} Photos</span>
        <span aria-hidden="true" className="flex h-6 items-end gap-0.5">
          {[10, 4, 14, 6, 10].map((h, i) => (
            <span key={i} className="block w-0.75 bg-hairline" style={{ height: h }} />
          ))}
        </span>
      </div>
    </div>
  );
}

/** 右页内面：进入相片 / 编辑 / 删除 */
function AlbumOperations({
  album,
  no,
  onOpenPhotos,
  onEdit,
  onDelete,
}: {
  album: Album;
  no: string;
  onOpenPhotos: (album: Album) => void;
  onEdit: (album: Album) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-linear-to-br from-[#151515] via-surface to-[#0c0c0c] p-5">
      <div className="flex items-start justify-between text-[9px] font-black uppercase tracking-[0.4em] text-text-secondary">
        <span>Album · {no}</span>
        <span aria-hidden="true" className="text-accent">
          //
        </span>
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary">
          <span className="text-accent">{album.photosCount ?? 0}</span> Photos
        </p>
        <Button type="primary" block onClick={() => onOpenPhotos(album)}>
          进入相片
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button block onClick={() => onEdit(album)}>
            编辑
          </Button>
          <Popconfirm title="确定删除该相集？" onConfirm={() => onDelete(album.id)}>
            <Button danger block>
              删除
            </Button>
          </Popconfirm>
        </div>
      </div>

      <span className="text-[9px] font-black uppercase tracking-[0.35em] text-text-secondary">Hover to Close</span>
    </div>
  );
}

interface AlbumShelfViewProps {
  albums: Album[];
  onOpenPhotos: (album: Album) => void;
  onEdit: (album: Album) => void;
  onDelete: (id: number) => void;
}

/** 书架视图：循环 Cover-Flow 轮播，每个相集独立成一本可翻开的书 */
export default function AlbumShelfView({ albums, onOpenPhotos, onEdit, onDelete }: AlbumShelfViewProps) {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const total = albums.length;

  // 删除 / 刷新后把 active 归一化到合法索引（循环轮播，取模即可）
  useEffect(() => {
    if (total === 0) return;
    setActive((current) => ((current % total) + total) % total);
  }, [total]);

  if (total === 0) return null;

  const safeActive = ((active % total) + total) % total;
  const currentAlbum = albums[safeActive];
  const opened = hovered || pinned;

  const enterCenter = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setHovered(true);
  };

  const leaveCenter = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    // 快速移入移出时给关闭动画一个缓冲，避免动画被打断而残留中间帧
    hoverTimerRef.current = setTimeout(() => setHovered(false), 260);
  };

  const closeAnd = (next: number) => {
    setHovered(false);
    setPinned(false);
    setActive(((next % total) + total) % total);
  };

  const goTo = (index: number) => closeAnd(index);
  const goPrev = () => closeAnd(safeActive - 1);
  const goNext = () => closeAnd(safeActive + 1);

  // 循环窗口：优先取中心、左右各取两本，不足 total 时去重只渲染实际存在的相集
  const visibleSlides: Array<{ album: Album; index: number; offset: number }> = [];
  const seen = new Set<number>();
  for (const offset of [0, -1, 1, -2, 2]) {
    const index = (((safeActive + offset) % total) + total) % total;
    if (seen.has(index)) continue;
    seen.add(index);
    visibleSlides.push({ album: albums[index], index, offset });
  }
  visibleSlides.sort((a, b) => a.offset - b.offset);

  return (
    <section aria-label="相册封面流" className="space-y-5">
      {/* 信息栏 */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-[0.45em] text-text-secondary">Album Archive</span>
          <span aria-hidden="true" className="h-1.5 w-1.5 bg-accent" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">
            Album {padNo(safeActive + 1)} / {padNo(total)}
          </span>
        </div>
      </div>

      {/* 3D 渐变舞台 + 左右居中箭头 */}
      <div className="relative">
        <div className="relative h-140 w-full overflow-hidden" style={{ perspective: STAGE_PERSPECTIVE }}>
          {/* 中心低亮度光晕 */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-110 w-190 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: "radial-gradient(closest-side, rgba(217, 255, 0, 0.07), transparent 70%)" }}
          />

          {/* 滑片层 */}
          <div className="pointer-events-none absolute inset-0 z-1" style={{ transformStyle: "preserve-3d" }}>
            {visibleSlides.map(({ album, index, offset }) => {
              const isCenter = offset === 0;

              // 多页书：目录 → 简介 → 相片一览 → 封面，翻开后可逐页翻动
              const no = padNo(index + 1);
              const pages: BookPage[] = [
                {
                  id: `album-${album.id}-index`,
                  label: `相册 ${no}：${album.name}（目录）`,
                  front: <AlbumContent album={album} no={no} />,
                  back: <AlbumCover album={album} no={no} key="overview0" />,
                },
                {
                  id: `album-${album.id}-overview`,
                  label: `相册 ${no}：${album.name}（简介）`,
                  front: <AlbumContent album={album} no={no} key="overview1" />,
                  back: <AlbumCover album={album} no={no} key="overview2" />,
                },
                {
                  id: `album-${album.id}-photos`,
                  label: `相册 ${no}：${album.name}（相片一览）`,
                  front: <AlbumContent album={album} no={no} key="overview3" />,
                  back: <AlbumCover album={album} no={no} key="overview4" />,
                },
                {
                  id: `album-${album.id}-cover`,
                  label: `相册 ${no}：${album.name}（封面）`,
                  front: <AlbumOperations album={album} no={no} onOpenPhotos={onOpenPhotos} onEdit={onEdit} onDelete={onDelete} />,
                },
              ];

              const slideStyle: CSSProperties = {
                width: BOOK_WIDTH,
                height: BOOK_HEIGHT,
                left: "50%",
                top: "50%",
                pointerEvents: "auto",
                zIndex: 10 - Math.abs(offset),
                transform: `translate(-50%, -50%) translateX(${offset * SLIDE_STEP_X}px) translateZ(${-Math.abs(offset) * SLIDE_DEPTH}px)`,
                transition: `transform ${MOVE_DURATION}ms ${EASE}`,
                willChange: "transform",
                backfaceVisibility: "hidden",
              };

              return (
                <div
                  key={`${album.id}-${isCenter ? "center" : "side"}`}
                  className="absolute"
                  style={slideStyle}
                  onMouseEnter={isCenter ? enterCenter : undefined}
                  onMouseLeave={isCenter ? leaveCenter : undefined}
                >
                  <div className={isCenter ? undefined : "pointer-events-none"}>
                    <Book
                      pages={pages}
                      width={BOOK_WIDTH}
                      height={BOOK_HEIGHT}
                      shift={SPREAD_SHIFT}
                      interactive={isCenter}
                      open={isCenter ? opened : false}
                      onOpenChange={isCenter ? setPinned : undefined}
                    />
                  </div>

                  {!isCenter ? (
                    <button
                      type="button"
                      aria-label={`切换到相册 ${padNo(index + 1)}：${album.name}`}
                      tabIndex={-1}
                      onClick={() => goTo(index)}
                      className="absolute inset-0 cursor-pointer bg-transparent"
                    />
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* 两侧渐变渐隐遮罩 */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-2 w-16 bg-linear-to-r from-[#050505]/90 via-[#050505]/25 to-transparent md:w-24" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-2 w-16 bg-linear-to-l from-[#050505]/90 via-[#050505]/25 to-transparent md:w-24" />
        </div>

        {/* 左右切换按钮：垂直居中 */}
        {total > 1 ? (
          <>
            <button
              type="button"
              aria-label="上一个相册"
              onClick={goPrev}
              className="absolute left-3 top-1/2 z-3 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-hairline bg-primary/85 text-xl leading-none text-text-primary backdrop-blur-sm transition-colors hover:border-accent/60 hover:text-accent"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="下一个相册"
              onClick={goNext}
              className="absolute right-3 top-1/2 z-3 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-hairline bg-primary/85 text-xl leading-none text-text-primary backdrop-blur-sm transition-colors hover:border-accent/60 hover:text-accent"
            >
              ›
            </button>
          </>
        ) : null}
      </div>

      {/* 当前相集说明 */}
      <div className="space-y-1 text-center">
        <h3 className="text-xl font-black uppercase leading-none tracking-[-0.01em] text-text-primary">{currentAlbum.name}</h3>
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-text-secondary">
          <span className="text-accent">{currentAlbum.photosCount ?? 0}</span> Photos · Hover to Open · Click Sides to Switch
        </p>
      </div>
    </section>
  );
}
