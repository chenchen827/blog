import type { CSSProperties } from "react";

import { Book } from "@repo/shared";
import type { BookPage } from "@repo/shared";

const ISSUES = ["Neon", "Rain", "Noir", "Echo", "Void", "Signal"];

const GRID_OVERLAY: CSSProperties = {
  backgroundImage: "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
  backgroundSize: "26px 26px",
};

/** 演示用封面：纯 CSS 绘制的“工业档案”风格封面,无需图片资源 */
function CoverFront({ index, title }: { index: number; title: string }) {
  const no = String(index + 1).padStart(2, "0");
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden p-5">
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-[#1b1b1b] via-[#101010] to-[#0a0a0a]" />
      <div aria-hidden="true" className="absolute inset-0 opacity-[0.06]" style={GRID_OVERLAY} />

      <div className="relative flex items-start justify-between text-[9px] font-black uppercase tracking-[0.4em] text-text-secondary">
        <span>System Archive</span>
        <span aria-hidden="true" className="text-accent">
          ∅
        </span>
      </div>

      <div className="relative">
        <span className="block text-[44px] font-black uppercase leading-[0.92] tracking-[-0.02em] text-text-primary">{title}</span>
        <span aria-hidden="true" className="mt-3 block h-1 w-10 bg-accent" />
        <span className="mt-3 block text-[9px] font-black uppercase tracking-[0.5em] text-text-secondary">Field Notes</span>
      </div>

      <div className="relative flex items-end justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary">Vol · {no}</span>
        <span aria-hidden="true" className="flex h-7 items-end gap-[2px]">
          {[10, 4, 14, 4, 10, 4, 16].map((h, i) => (
            <span key={i} className="block w-[3px] bg-hairline" style={{ height: h }} />
          ))}
        </span>
      </div>
    </div>
  );
}

/** 演示用封底：翻开后展示的简短说明,用于演示 pages[].back */
function CoverBack({ index, title }: { index: number; title: string }) {
  const no = String(index + 1).padStart(2, "0");
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-linear-to-b from-[#141414] to-[#0c0c0c] p-5">
      <div className="flex items-start justify-between text-[9px] font-black uppercase tracking-[0.4em] text-text-secondary">
        <span>Issue · {no}</span>
        <span aria-hidden="true" className="text-accent">
          //
        </span>
      </div>
      <div className="relative">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">— Reverse —</span>
        <p className="mt-3 text-sm font-bold uppercase leading-snug text-text-primary">{title}</p>
        <p className="mt-2 text-xs leading-relaxed text-text-secondary">A single-page dispatch from the city archive. Hover the stack to flip it open.</p>
      </div>
      <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.35em] text-text-secondary">
        <span>Zenless Vol.01</span>
        <span aria-hidden="true" className="h-1.5 w-6 bg-accent" />
      </div>
    </div>
  );
}

/** 公共 Book 组件的演示区块 */
export default function BookDemo() {
  const pages: BookPage[] = ISSUES.map((title, index) => ({
    id: index,
    label: `第 ${index + 1} 页：${title}`,
    front: <CoverFront index={index} title={title} />,
    back: <CoverBack index={index} title={title} />,
  }));

  return (
    <section className="mt-16 border-t border-hairline pt-10">
      <header className="flex items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-accent">Shared Component</span>
          <h2 className="mt-2 text-[28px] font-extrabold uppercase leading-none tracking-[-0.01em] text-text-primary">Book · 翻页书架</h2>
        </div>
        <span className="hidden pb-1 text-[10px] font-black uppercase tracking-[0.4em] text-text-secondary sm:block">Issue 01 – 06</span>
      </header>

      <div className="-mx-4 mt-2 overflow-x-auto px-4 py-10">
        <div className="mx-auto w-max">
          <Book pages={pages} width={232} height={320} showHint />
        </div>
      </div>

      <p className="mx-auto max-w-2xl text-center text-sm leading-relaxed text-text-secondary">
        来自 <code className="text-accent">@repo/shared</code> 的 3D 翻页组件：悬停展开成书,点击书页可翻阅下一页,点击封面合上；每页翻开后展示背面内容。
      </p>
    </section>
  );
}
