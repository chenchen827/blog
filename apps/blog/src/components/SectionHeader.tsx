import type { ReactNode } from 'react'

interface SectionHeaderProps {
  /** 模块标签，例如 KNOWLEDGE / ALBUM */
  code: string
  title: string
  desc?: string
  /** 右侧附加内容 */
  action?: ReactNode
}

/** 区块标题：工业档案风格小标签 + 海报级大标题 */
export default function SectionHeader({ code, title, desc, action }: SectionHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-accent">{code}</span>
        <h2 className="mt-2 text-3xl font-extrabold uppercase leading-none tracking-[-0.01em] text-text-primary md:text-[36px]">{title}</h2>
        {desc && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary">{desc}</p>}
      </div>
      {action ? <div className="pb-1">{action}</div> : null}
    </header>
  )
}
