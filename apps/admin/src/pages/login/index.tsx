import { Link } from 'react-router'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6 py-10 text-text-primary">
      <div className="w-full max-w-md rounded-lg border border-card-border bg-primary p-8">
        <h1 className="text-[42px] font-extrabold uppercase leading-tight tracking-[-0.01em] text-text-primary">
          登录
        </h1>
        <p className="mt-4 text-base leading-relaxed text-text-secondary">
          登录功能开发中，后续将在此接入真实鉴权。
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center rounded-none bg-surface-soft px-8 text-base font-black uppercase tracking-wide text-text-primary transition-colors hover:bg-surface"
          >
            返回首页
          </Link>
        </div>
      </div>
    </main>
  )
}
