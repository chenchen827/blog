import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, PointerEvent as ReactPointerEvent, SyntheticEvent } from "react";
import { App } from "antd";

const VIEW_SIZE = 288;
const OUTPUT_SIZE = 512;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export interface AvatarCropUploadProps {
  value?: string;
  onChange?: (value?: string) => void;
  onCrop?: (file: File, previewUrl: string) => void;
  disabled?: boolean;
}

export function AvatarCropUpload({ value, onCrop, disabled }: AvatarCropUploadProps) {
  const { message } = App.useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [cropOpen, setCropOpen] = useState(false);

  useEffect(() => {
    if (value) {
      setLocalPreview(value);
    }
  }, [value]);

  const previewUrl = value || localPreview;
  const coverScale = naturalSize.width > 0 && naturalSize.height > 0 ? Math.max(VIEW_SIZE / naturalSize.width, VIEW_SIZE / naturalSize.height) : 1;
  const displayWidth = naturalSize.width > 0 ? naturalSize.width * coverScale * zoom : 0;
  const displayHeight = naturalSize.height > 0 ? naturalSize.height * coverScale * zoom : 0;

  function getMaxPan() {
    return {
      x: Math.max(0, (displayWidth - VIEW_SIZE) / 2),
      y: Math.max(0, (displayHeight - VIEW_SIZE) / 2),
    };
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      message.warning("请选择图片文件。");
      return;
    }

    setSourceUrl(URL.createObjectURL(file));
    setNaturalSize({ width: 0, height: 0 });
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setCropOpen(true);
  }

  function handleImageLoad(event: SyntheticEvent<HTMLImageElement>) {
    const image = event.currentTarget;
    setNaturalSize({ width: image.naturalWidth, height: image.naturalHeight });
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const maxPan = getMaxPan();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: clamp(pan.x, -maxPan.x, maxPan.x),
      originY: clamp(pan.y, -maxPan.y, maxPan.y),
    };
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const maxPan = getMaxPan();
    setPan({
      x: clamp(drag.originX + event.clientX - drag.startX, -maxPan.x, maxPan.x),
      y: clamp(drag.originY + event.clientY - drag.startY, -maxPan.y, maxPan.y),
    });
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleZoomChange(event: ChangeEvent<HTMLInputElement>) {
    const nextZoom = Number(event.target.value);
    setZoom(nextZoom);

    const nextDisplayWidth = naturalSize.width * coverScale * nextZoom;
    const nextDisplayHeight = naturalSize.height * coverScale * nextZoom;
    const maxPan = {
      x: Math.max(0, (nextDisplayWidth - VIEW_SIZE) / 2),
      y: Math.max(0, (nextDisplayHeight - VIEW_SIZE) / 2),
    };

    setPan((prev) => ({
      x: clamp(prev.x, -maxPan.x, maxPan.x),
      y: clamp(prev.y, -maxPan.y, maxPan.y),
    }));
  }

  function handleConfirmCrop() {
    const image = imageRef.current;
    if (!image || naturalSize.width <= 0 || naturalSize.height <= 0) {
      message.warning("图片尚未加载完成，请稍候再试。");
      return;
    }

    const scale = coverScale * zoom;
    const sourceSize = VIEW_SIZE / scale;
    const sourceX = ((displayWidth - VIEW_SIZE) / 2 - pan.x) / scale;
    const sourceY = ((displayHeight - VIEW_SIZE) / 2 - pan.y) / scale;

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const context = canvas.getContext("2d");
    if (!context) {
      message.error("浏览器不支持 Canvas，无法裁剪图片。");
      return;
    }

    context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          message.error("头像裁剪失败，请重试。");
          return;
        }

        const file = new File([blob], `avatar-${Date.now()}.jpg`, { type: "image/jpeg" });
        const preview = URL.createObjectURL(file);
        setLocalPreview(preview);
        setCropOpen(false);
        onCrop?.(file, preview);
      },
      "image/jpeg",
      0.92,
    );
  }

  const imageStyle = {
    width: displayWidth,
    height: displayHeight,
    marginLeft: -displayWidth / 2,
    marginTop: -displayHeight / 2,
    transform: `translate(${pan.x}px, ${pan.y}px)`,
  };

  return (
    <div className="flex items-start gap-4">
      <button
        type="button"
        onClick={openFilePicker}
        disabled={disabled}
        className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-none border border-hairline bg-surface-soft text-xs font-bold uppercase tracking-wider text-text-secondary transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
      >
        {previewUrl ? <img src={previewUrl} alt="用户头像" className="h-full w-full object-cover" /> : <span>上传头像</span>}
      </button>

      <div className="min-w-0">
        <p className="text-sm font-bold text-text-primary">头像裁剪</p>
        <p className="mt-2 text-xs leading-relaxed text-text-secondary">选择图片后先本地裁剪，注册时会自动上传至阿里云并写入用户头像字段。</p>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden!" onChange={handleFileChange} />

      {cropOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-scrim/85 px-4">
          <div className="w-full max-w-90 border border-hairline bg-primary p-5 shadow-[0_30px_80px_rgba(0,0,0,0.65)]">
            <div className="flex items-center justify-between border-b border-hairline pb-4">
              <h3 className="text-lg font-black uppercase tracking-wider text-text-primary">裁剪头像</h3>
              <button
                type="button"
                aria-label="关闭裁剪"
                onClick={() => setCropOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-none bg-surface-soft text-text-primary transition-colors hover:bg-surface"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 flex justify-center">
              <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="relative h-[288px] w-[288px] touch-none select-none overflow-hidden border border-hairline bg-black"
              >
                {sourceUrl && (
                  <img
                    ref={imageRef}
                    src={sourceUrl}
                    onLoad={handleImageLoad}
                    draggable={false}
                    alt="待裁剪头像"
                    className="absolute left-1/2 top-1/2 max-w-none"
                    style={imageStyle}
                  />
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-text-secondary">缩放</span>
              <input type="range" min={MIN_ZOOM} max={MAX_ZOOM} step={0.01} value={zoom} onChange={handleZoomChange} className="min-w-0 flex-1 accent-[#d9ff00]" />
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setCropOpen(false)}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-none bg-surface-soft px-4 text-base font-black uppercase tracking-wider text-text-primary transition-colors hover:bg-surface"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmCrop}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-none bg-accent px-4 text-base font-black uppercase tracking-wider text-ink! transition-[filter] hover:brightness-90"
              >
                确认裁剪
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
