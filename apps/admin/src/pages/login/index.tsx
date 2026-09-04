import { Link } from 'react-router'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6 py-10 text-on-primary">
      <div className="w-full max-w-md rounded-xl border border-hairline bg-surface-soft p-8">
        <h1 className="text-[32px] font-semibold leading-[1.2] tracking-[-0.01em]">登录</h1>
        <p className="mt-4 text-base leading-relaxed">登录功能开发中，后续将在此接入真实鉴权。</p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-surface-soft px-6 text-base font-semibold text-on-primary hover:brightness-125"
          >
            返回首页
          </Link>
        </div>
      </div>
    </main>
  )
}
