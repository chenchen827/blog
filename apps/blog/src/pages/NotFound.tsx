import { Link, useLocation } from "react-router";

const GRID_STYLE = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.72) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.72) 1px, transparent 1px)",
  backgroundSize: "36px 36px",
};

export default function NotFound() {
  const { pathname } = useLocation();

  return (
    <section className="relative isolate min-h-[calc(100vh-7rem)] overflow-hidden border border-hairline bg-primary/60 px-6 py-12 [clip-path:polygon(0_0,100%_0,100%_calc(100%-32px),calc(100%-32px)_100%,0_100%)] sm:px-10 sm:py-16 lg:px-14">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.05]" style={GRID_STYLE} />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-3 top-2 select-none text-[clamp(7rem,22vw,17rem)] font-black uppercase leading-none tracking-[-0.09em] text-white/[0.025] sm:top-8"
      >
        404
      </span>
      <div aria-hidden="true" className="absolute right-6 top-6 h-16 w-16 rotate-12 border border-accent/20 bg-accent/[0.035] sm:right-10 sm:top-10" />

      <div className="relative flex min-h-[calc(100vh-13rem)] max-w-4xl flex-col justify-center">
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.42em]">
          <span className="h-2 w-2 bg-accent" />
          <span className="text-accent">Signal Lost</span>
          <span className="text-text-secondary">/ Error 404</span>
        </div>

        <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-8">
          <strong className="text-[clamp(5.5rem,17vw,11rem)] font-black leading-[0.72] tracking-[-0.08em] text-accent">404</strong>
          <div className="min-w-0 pb-1">
            <h1 className="text-3xl font-black uppercase leading-none tracking-[-0.035em] text-text-primary sm:text-5xl">页面不存在</h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-text-secondary">请求的档案地址无效、已被移动，或当前访问路径不在系统索引中。</p>
          </div>
        </div>

        <div className="mt-8 border-l-2 border-accent/70 bg-canvas/55 px-4 py-3">
          <span className="block text-[9px] font-black uppercase tracking-[0.34em] text-text-secondary">Requested Path</span>
          <code className="mt-2 block break-all font-mono text-xs font-bold text-text-primary sm:text-sm">{pathname}</code>
        </div>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center bg-accent px-7 text-sm font-black uppercase tracking-[0.18em] text-ink transition-[filter] hover:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          >
            返回首页
          </Link>
          <Link
            to="/knowledge"
            className="inline-flex min-h-11 items-center justify-center border border-hairline bg-surface-soft px-7 text-sm font-black uppercase tracking-[0.18em] text-text-primary transition-colors hover:border-accent/60 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          >
            浏览知识库
          </Link>
        </div>
      </div>

      <div aria-hidden="true" className="absolute bottom-5 left-6 flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.32em] text-text-secondary sm:left-10">
        <span className="h-px w-10 bg-accent/70" />
        System Route / Unresolved
      </div>
    </section>
  );
}