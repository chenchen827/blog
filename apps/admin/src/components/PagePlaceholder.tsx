interface PagePlaceholderProps {
  title: string
  description?: string
}

export default function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <section className="space-y-6">
      <h1 className="text-[42px] font-extrabold uppercase leading-tight tracking-[-0.01em] text-text-primary">
        {title}
      </h1>
      <div className="rounded-lg border border-card-border bg-primary p-6 text-base leading-relaxed text-text-primary [clip-path:polygon(0_0,100%_0,100%_85%,85%_100%,0_100%)]">
        {description ?? `${title}：模块建设中。`}
      </div>
    </section>
  )
}
