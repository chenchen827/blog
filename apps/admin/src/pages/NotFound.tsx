import { Link } from 'react-router'

export default function NotFound() {
  return (
    <section className="space-y-6">
      <h1 className="text-[32px] font-semibold leading-[1.2] tracking-[-0.01em] text-on-primary">
        404
      </h1>
      <div className="rounded-xl border border-hairline bg-surface-soft p-6 text-base leading-relaxed text-on-primary">
        页面不存在，请检查访问地址。
      </div>
      <Link
        to="/"
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-surface-soft px-6 text-base font-semibold text-on-primary hover:brightness-125"
      >
        返回首页
      </Link>
    </section>
  )
}
