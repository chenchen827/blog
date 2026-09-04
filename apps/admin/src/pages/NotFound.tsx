import { Link } from 'react-router'

export default function NotFound() {
  return (
    <section className="space-y-6">
      <h1 className="text-[42px] font-extrabold uppercase leading-tight tracking-[-0.01em] text-text-primary">
        404
      </h1>
      <div className="rounded-lg border border-card-border bg-primary p-6 text-base leading-relaxed text-text-primary [clip-path:polygon(0_0,100%_0,100%_85%,85%_100%,0_100%)]">
        页面不存在，请检查访问地址。
      </div>
      <Link
        to="/"
        className="inline-flex min-h-11 items-center justify-center rounded-none bg-surface-soft px-8 text-base font-black uppercase tracking-wide text-text-primary transition-colors hover:bg-surface"
      >
        返回首页
      </Link>
    </section>
  )
}
