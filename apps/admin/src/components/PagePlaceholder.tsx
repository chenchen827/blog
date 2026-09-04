interface PagePlaceholderProps {
  title: string
  description?: string
}

export default function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <section className="space-y-6">
      <h1 className="text-[32px] font-semibold leading-[1.2] tracking-[-0.01em] text-on-primary">
        {title}
      </h1>
      <div className="rounded-xl border border-hairline bg-surface-soft p-6 text-base leading-relaxed text-on-primary">
        {description ?? `${title}：模块建设中。`}
      </div>
    </section>
  )
}
