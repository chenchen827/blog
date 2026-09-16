import type { ReactNode } from "react";

import { cn } from "../utils";

export interface EmptyStateProps {
  /** 主标题,默认“这里还没有内容” */
  title?: string;
  /** 说明文字,默认引导用户新建数据 */
  description?: string;
  /** 附加操作,例如“新增相集 / 上传相片”按钮 */
  action?: ReactNode;
  /** 模块标签,例如 ALBUM / PHOTO */
  code?: string;
  className?: string;
}

/**
 * 工业档案风格的全局空状态组件：
 * 用斜切框、虚线圆环、网格纹理和荧光黄符号替代 antd 默认灰空图标。
 */
export function EmptyState({ title = "这里还没有内容", description = "从零开始建立你的记录,让这块区域开始运转。", action, code = "EMPTY", className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-[320px] flex-col items-center justify-center overflow-hidden rounded-none border border-hairline bg-primary/50 px-6 py-12 text-center",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <span className="pointer-events-none absolute left-5 top-4 text-[10px] font-black uppercase tracking-[0.4em] text-text-secondary">Zone · {code}</span>
      <span className="pointer-events-none absolute right-4 top-4 text-[10px] font-black uppercase tracking-[0.4em] text-accent">∅ Void</span>

      <div className="relative flex h-32 w-32 items-center justify-center">
        <div aria-hidden="true" className="absolute inset-0 border border-hairline [clip-path:polygon(0_0,100%_0,100%_75%,75%_100%,0_100%)]" />
        <div aria-hidden="true" className="absolute inset-1.5 rotate-45 border border-dashed border-hairline" />
        <div aria-hidden="true" className="absolute h-20 w-20 rounded-full border border-accent/30" />
        <div aria-hidden="true" className="absolute h-14 w-14 rounded-full border-2 border-dashed border-accent/80" />
        <span className="relative text-4xl font-black text-accent">∅</span>
      </div>

      <div className="mt-5 flex items-center gap-2">
        <span aria-hidden="true" className="h-1 w-1 rounded-full bg-accent" />
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-text-secondary">No Data</span>
        <span aria-hidden="true" className="h-1 w-1 rounded-full bg-accent" />
      </div>

      <h3 className="mt-3 text-xl font-black uppercase leading-none tracking-[-0.02em] text-text-primary">{title}</h3>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-text-secondary">{description}</p>

      {action ? <div className="relative z-10 mt-5">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
